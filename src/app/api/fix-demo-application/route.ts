import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const product = await prisma.loanProduct.findFirst({
      where: {
        id: "cmuh2n4tg0000q4ifdjjyfnqe",
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Correct loan product not found",
        },
        { status: 404 }
      );
    }

    const application = await prisma.loanApplication.findUnique({
      where: {
        id: "cmucd1qtd0002wwifmsj2u6d3",
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: "Demo application not found",
        },
        { status: 404 }
      );
    }

    const updatedApplication = await prisma.loanApplication.update({
      where: {
        id: application.id,
      },
      data: {
        loanProductId: product.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Demo application connected to the correct loan product",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Fix application error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fix demo application",
      },
      { status: 500 }
    );
  }
}