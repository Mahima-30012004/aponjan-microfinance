import { authorizeRoles } from "@/lib/authorize";
import { prisma } from "@/lib/prisma";
import {
  isValidPassword,
  normalizeEmail,
  normalizeName,
  normalizePhone,
} from "@/lib/validation";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function GET(request: Request) {
  try {
    const authorization = await authorizeRoles(request, ["ADMIN"]);

    if ("response" in authorization) {
      return authorization.response;
    }

    const staff = await prisma.user.findMany({
      where: {
        role: "LOAN_OFFICER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        employee: {
          select: {
            employeeCode: true,
            designation: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error("Staff list error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load staff accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await authorizeRoles(request, ["ADMIN"]);

    if ("response" in authorization) {
      return authorization.response;
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid staff account request" },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;
    const name = normalizeName(input.name);
    const email = normalizeEmail(input.email);
    const phone = normalizePhone(input.phone);
    const employeeCode =
      typeof input.employeeCode === "string"
        ? input.employeeCode.trim().toUpperCase()
        : "";
    const password =
      typeof input.password === "string" ? input.password : "";

    if (
      !name ||
      !email ||
      !phone ||
      !/^[A-Z0-9_-]{2,32}$/.test(employeeCode) ||
      password.length < 12 ||
      !isValidPassword(password)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Provide a valid name, email, phone, employee code, and a password of at least 12 characters containing a letter and number",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const staff = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "LOAN_OFFICER",
        status: "ACTIVE",
        employee: {
          create: {
            employeeCode,
            designation: "Loan Officer",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        employee: {
          select: {
            employeeCode: true,
            designation: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Loan officer account created. Share the temporary password with them using a secure channel.",
        staff,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Staff creation error:", error);

    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "That email, phone number, or employee code is already in use",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to create staff account" },
      { status: 500 }
    );
  }
}
