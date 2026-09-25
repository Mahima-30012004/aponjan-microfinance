import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check login token
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

    // Only customers can apply
    if (
      authUser.role !== "CUSTOMER" &&
      authUser.role !== "TEAM_LEADER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only customers can apply for loans",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      loanType,
      amount,
      tenure,
      purpose,
    } = body;

    if (!loanType || !amount || !tenure) {
      return NextResponse.json(
        {
          success: false,
          message: "Loan type, amount and tenure are required",
        },
        { status: 400 }
      );
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: {
        userId: authUser.userId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer profile not found",
        },
        { status: 404 }
      );
    }

    // Find active loan product
    const loanProduct = await prisma.loanProduct.findFirst({
  where: {
    loanType,
    name: "Aponjan Individual Loan",
    status: "ACTIVE",
  },
});

    if (!loanProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "No active loan product available",
        },
        { status: 404 }
      );
    }

    const requestedAmount = Number(amount);
    const requestedTenure = Number(tenure);

    // Validate amount
    if (
      requestedAmount < Number(loanProduct.minAmount) ||
      requestedAmount > Number(loanProduct.maxAmount)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Loan amount must be between ₹${loanProduct.minAmount} and ₹${loanProduct.maxAmount}`,
        },
        { status: 400 }
      );
    }

    // Validate tenure
    if (
      requestedTenure < loanProduct.minTenure ||
      requestedTenure > loanProduct.maxTenure
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Tenure must be between ${loanProduct.minTenure} and ${loanProduct.maxTenure} months`,
        },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.loanApplication.create({
      data: {
        customerId: customer.id,
        loanProductId: loanProduct.id,
        requestedAmount,
        requestedTenure,
        purpose: purpose || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Loan application submitted successfully",
        application: {
          id: application.id,
          amount: application.requestedAmount,
          tenure: application.requestedTenure,
          status: application.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Loan application error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while applying for the loan",
      },
      { status: 500 }
    );
  }
}