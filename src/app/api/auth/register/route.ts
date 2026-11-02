import { prisma } from "@/lib/prisma";
import {
  isValidPassword,
  normalizeEmail,
  normalizeName,
  normalizePhone,
} from "@/lib/validation";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;

    try {
      const payload: unknown = await request.json();

      if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
        return NextResponse.json(
          { success: false, message: "Invalid registration request" },
          { status: 400 }
        );
      }

      body = payload as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const name = normalizeName(body.name);
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    const password = typeof body.password === "string" ? body.password.trim() : "";

    if (!name || !email || !phone || !isValidPassword(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, valid email, valid phone number, and a password with at least 8 characters including a letter and number are required",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        status: "ACTIVE",
        phone,
        customer: {
          create: {
            fullName: name,
            phone,
          },
        },
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          customer: user.customer,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : null;

    if (errorCode === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email or phone number already exists",
        },
        { status: 409 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "";
    const databaseUnavailable =
      errorMessage === "DATABASE_URL is not configured" ||
      ["P1000", "P1001", "P1002", "P2021", "P2022"].includes(errorCode ?? "");

    return NextResponse.json(
      {
        success: false,
        message: databaseUnavailable
          ? "Registration is temporarily unavailable because the database is not configured or ready. Please contact support."
          : "Something went wrong during registration",
      },
      { status: databaseUnavailable ? 503 : 500 }
    );
  }
}