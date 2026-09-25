import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        emiSchedules: {
          orderBy: {
            installmentNumber: "asc",
          },
        },
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

    // Customers can only view their own loan.
    if (authUser.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({
        where: {
          userId: authUser.userId,
        },
      });

      if (!customer || loan.customerId !== customer.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Access denied",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      loan: {
        id: loan.id,
        principalAmount: loan.principalAmount,
        interestRate: loan.interestRate,
        tenure: loan.tenure,
        emiAmount: loan.emiAmount,
        outstandingAmount: loan.outstandingAmount,
        status: loan.status,
      },
      emiSchedule: loan.emiSchedules,
    });
  } catch (error) {
    console.error("EMI schedule error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching EMI schedule",
      },
      { status: 500 }
    );
  }
}