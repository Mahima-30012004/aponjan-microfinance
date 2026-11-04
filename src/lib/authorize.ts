import { prisma } from "@/lib/prisma";
import { verifyToken, type AuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";

type AuthorizationResult =
  | { user: AuthUser }
  | { response: NextResponse };

export async function authorizeRoles(
  request: Request,
  allowedRoles: readonly string[]
): Promise<AuthorizationResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      response: NextResponse.json(
        { success: false, message: "Authentication token is required" },
        { status: 401 }
      ),
    };
  }

  const tokenUser = verifyToken(authHeader.slice(7));

  if (!tokenUser) {
    return {
      response: NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenUser.userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return {
      response: NextResponse.json(
        { success: false, message: "Account is not active" },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      response: NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      ),
    };
  }

  return {
    user: {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
  };
}
