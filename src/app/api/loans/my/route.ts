import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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

    const applications = await prisma.loanApplication.findMany({
      where: {
        customerId: customer.id,
      },
      include: {
        loanProduct: true,
        loan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("My loans error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching loans",
      },
      { status: 500 }
    );
  }
}