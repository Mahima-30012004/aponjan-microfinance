import { prisma } from "@/lib/prisma";
import { authorizeRoles } from "@/lib/authorize";
import { NextResponse } from "next/server";
import { calculateFlatInterestLoan } from "@/lib/loan-calculator";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await authorizeRoles(request, ["ADMIN"]);

    if ("response" in authorization) {
      return authorization.response;
    }

    const { id } = await params;
    const body = await request.json();
    const { status, remarks } = body;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        {
          success: false,
          message: "Status must be APPROVED or REJECTED",
        },
        { status: 400 }
      );
    }

    const application = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        loanProduct: true,
        loan: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: "Loan application not found",
        },
        { status: 404 }
      );
    }

    if (
      application.status !== "PENDING" &&
      application.status !== "UNDER_REVIEW"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This application has already been processed",
        },
        { status: 400 }
      );
    }

    // Reject application
    if (status === "REJECTED") {
      const updatedApplication = await prisma.loanApplication.update({
        where: { id },
        data: {
          status: "REJECTED",
          remarks: remarks || null,
          reviewedById: authorization.user.userId,
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Application rejected successfully",
        application: updatedApplication,
      });
    }

    // Prevent duplicate loan creation
    if (application.loan) {
      return NextResponse.json(
        {
          success: false,
          message: "A loan already exists for this application",
        },
        { status: 400 }
      );
    }

    const principal = Number(application.requestedAmount);
    const interestRate = Number(application.loanProduct.interestRate);
    const tenureWeeks = application.requestedTenure;

    if (tenureWeeks <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid loan tenure",
        },
        { status: 400 }
      );
    }

    const calculation = calculateFlatInterestLoan(
      principal,
      interestRate,
      tenureWeeks
    );

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + tenureWeeks * 7);

    const loan = await prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.loanApplication.update({
        where: { id },
        data: {
          status: "APPROVED",
          remarks: remarks || null,
          reviewedById: authorization.user.userId,
          reviewedAt: new Date(),
        },
      });

      const createdLoan = await tx.loan.create({
        data: {
          customerId: application.customerId,
          applicationId: application.id,
          loanProductId: application.loanProductId,
          groupId: application.groupId,
          principalAmount: principal,
          interestRate,
          tenure: tenureWeeks,
          emiAmount: calculation.weeklyEmi,
          startDate,
          endDate,
          outstandingAmount: calculation.totalRepayment,
          status: "ACTIVE",
        },
      });

      const weeklyEmi = calculation.weeklyEmi;

      const emiData = Array.from(
        { length: tenureWeeks },
        (_, index) => {
          const dueDate = new Date(startDate);
          dueDate.setDate(dueDate.getDate() + (index + 1) * 7);

          const isLastInstallment = index === tenureWeeks - 1;

          const amountDue = isLastInstallment
            ? calculation.totalRepayment -
              weeklyEmi * (tenureWeeks - 1)
            : weeklyEmi;

          return {
            loanId: createdLoan.id,
            installmentNumber: index + 1,
            dueDate,
            amountDue,
          };
        }
      );

      await tx.emiSchedule.createMany({
        data: emiData,
      });

      return {
        loan: createdLoan,
        application: updatedApplication,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Application approved and loan created successfully",
      application: loan.application,
      loan: loan.loan,
      emiSchedule: {
        numberOfInstallments: tenureWeeks,
        weeklyAmount: calculation.weeklyEmi,
      },
    });
  } catch (error) {
    console.error("Application approval error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while processing the application",
      },
      { status: 500 }
    );
  }
}