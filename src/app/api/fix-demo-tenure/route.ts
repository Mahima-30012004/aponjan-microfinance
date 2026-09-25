import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const application = await prisma.loanApplication.update({
      where: {
        id: "cmucd1qtd0002wwifmsj2u6d3",
      },
      data: {
        requestedTenure: 26,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Demo application tenure updated to 26 weeks",
      application,
    });
  } catch (error) {
    console.error("Fix tenure error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update demo application tenure",
      },
      { status: 500 }
    );
  }
}