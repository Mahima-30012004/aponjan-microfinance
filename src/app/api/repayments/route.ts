import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication token is required",
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const authUser = verifyToken(token);

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    // For now, repayments can be recorded by Admin or Loan Officer.
    if (
      authUser.role !== "ADMIN" &&
      authUser.role !== "LOAN_OFFICER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only Admin or Loan Officer can record repayments",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      loanId,
      emiId,
      amount,
      paymentMethod,
      transactionReference,
      remarks,
    } = body;

    if (!loanId || !emiId || !amount || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message:
            "loanId, emiId, amount and paymentMethod are required",
        },
        { status: 400 }
      );
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment amount must be greater than 0",
        },
        { status: 400 }
      );
    }

    const validPaymentMethods = [
      "CASH",
      "BANK_TRANSFER",
      "UPI",
      "ONLINE",
    ];

    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method",
        },
        { status: 400 }
      );
    }

    const loan = await prisma.loan.findUnique({
      where: {
        id: loanId,
      },
    });

    if (!loan) {
      return NextResponse.json(
        {
          success: false,
          message: "Loan not found",
        },
        { status: 404 }
      );
    }

    const emi = await prisma.emiSchedule.findUnique({
      where: {
        id: emiId,
      },
    });

    if (!emi) {
      return NextResponse.json(
        {
          success: false,
          message: "EMI not found",
        },
        { status: 404 }
      );
    }

    if (emi.loanId !== loanId) {
      return NextResponse.json(
        {
          success: false,
          message: "EMI does not belong to this loan",
        },
        { status: 400 }
      );
    }

    const currentAmountPaid = Number(emi.amountPaid);
    const amountDue = Number(emi.amountDue);
    const remainingEmiAmount = amountDue - currentAmountPaid;

    if (remainingEmiAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This EMI has already been fully paid",
        },
        { status: 400 }
      );
    }

    if (paymentAmount > remainingEmiAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Payment cannot exceed the remaining EMI amount of ₹${remainingEmiAmount}`,
        },
        { status: 400 }
      );
    }

    const newAmountPaid = currentAmountPaid + paymentAmount;

    let newEmiStatus: "PENDING" | "PARTIALLY_PAID" | "PAID";

    if (newAmountPaid >= amountDue) {
      newEmiStatus = "PAID";
    } else {
      newEmiStatus = "PARTIALLY_PAID";
    }

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.repayment.create({
        data: {
          loanId,
          emiId,
          amount: paymentAmount,
          paymentMethod,
          transactionReference:
            transactionReference || null,
          recordedById: authUser.userId,
          remarks: remarks || null,
        },
      });

      await tx.emiSchedule.update({
        where: {
          id: emiId,
        },
        data: {
          amountPaid: newAmountPaid,
          status: newEmiStatus,
          paidDate:
            newEmiStatus === "PAID" ? new Date() : null,
        },
      });

      const newOutstandingAmount = Math.max(
        Number(loan.outstandingAmount) - paymentAmount,
        0
      );

      const allEmis = await tx.emiSchedule.findMany({
        where: {
          loanId,
        },
      });

      const allPaid =
        allEmis.length > 0 &&
        allEmis.every((item) => {
          if (item.id === emiId) {
            return newEmiStatus === "PAID";
          }

          return item.status === "PAID";
        });

      await tx.loan.update({
        where: {
          id: loanId,
        },
        data: {
          outstandingAmount: newOutstandingAmount,
          status: allPaid ? "COMPLETED" : "ACTIVE",
        },
      });

      return createdPayment;
    });

    return NextResponse.json({
      success: true,
      message: "Repayment recorded successfully",
      payment,
      emi: {
        id: emiId,
        amountPaid: newAmountPaid,
        amountDue,
        remainingAmount: Math.max(
          amountDue - newAmountPaid,
          0
        ),
        status: newEmiStatus,
      },
    });
  } catch (error) {
    console.error("Repayment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while recording repayment",
      },
      { status: 500 }
    );
  }
}