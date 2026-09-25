import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const email = "admin@example.com";
    const password = "Admin@12345";

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "Demo admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name: "Demo Admin",
        email,
        phone: "9876543212",
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Demo admin created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin setup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create demo admin",
      },
      { status: 500 }
    );
  }
}
