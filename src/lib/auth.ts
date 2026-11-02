import jwt from "jsonwebtoken";
import { getRequiredServerEnv } from "@/lib/env";

export type AuthUser = {
  userId: string;
  role: string;
  email: string;
};

export function verifyToken(token: string): AuthUser | null {
  try {
    const jwtSecret = getRequiredServerEnv("JWT_SECRET");

    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      "role" in decoded &&
      "email" in decoded
    ) {
      return {
        userId: String(decoded.userId),
        role: String(decoded.role),
        email: String(decoded.email),
      };
    }

    return null;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}