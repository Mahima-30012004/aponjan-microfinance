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

    if (
      authUser.role !== "ADMIN" &&
      authUser.role !== "LOAN_OFFICER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 403 }
      );
    }

    const applications = await prisma.loanApplication.findMany({
      include: {
        customer: true,
        loanProduct: true,
        group: true,
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
    console.error("Admin applications error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching applications",
      },
      { status: 500 }
    );
  }
}