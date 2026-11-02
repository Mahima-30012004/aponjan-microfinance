import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "This demo data repair endpoint has been disabled for production use.",
    },
    { status: 410 }
  );
}