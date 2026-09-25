import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const existingProduct = await prisma.loanProduct.findFirst({
      where: {
        name: "Aponjan Individual Loan",
      },
    });

    if (existingProduct) {
      return NextResponse.json({
        success: true,
        message: "Loan product already exists",
        product: existingProduct,
      });
    }

    const product = await prisma.loanProduct.create({
      data: {
        name: "Aponjan Individual Loan",
        loanType: "INDIVIDUAL",
        interestRate: 30,
        minAmount: 5000,
        maxAmount: 100000,
        minTenure: 26,
        maxTenure: 26,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Loan product created successfully",
      product,
    });
  } catch (error) {
    console.error("Loan product setup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create loan product",
      },
      { status: 500 }
    );
  }
}