import { prisma } from "@/lib/prisma";
import { authorizeRoles } from "@/lib/authorize";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authorization = await authorizeRoles(request, [
      "ADMIN",
      "LOAN_OFFICER",
    ]);

    if ("response" in authorization) {
      return authorization.response;
    }

    const applications = await prisma.loanApplication.findMany({
      select: {
        id: true,
        requestedAmount: true,
        requestedTenure: true,
        status: true,
        createdAt: true,
        customer: {
          select: {
            fullName: true,
          },
        },
        loanProduct: {
          select: {
            name: true,
            loanType: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      applications,
      viewerRole: authorization.user.role,
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