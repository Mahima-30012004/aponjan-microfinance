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
    const body = await request.json();

    const name = normalizeName(body?.name);
    const email = normalizeEmail(body?.email);
    const phone = normalizePhone(body?.phone);
    const password = typeof body?.password === "string" ? body.password.trim() : "";

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

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong during registration",
      },
      { status: 500 }
    );
  }
}