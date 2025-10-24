// src/lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // now async in Next 16
import type { NextRequest } from "next/server";

const COOKIE_NAME = "auth_token";
const EXPIRES_DAYS = 7 as const;

export type JWTPayload = { id: number; role: "USER" | "ADMIN"; username: string };

export function signJwt(payload: JWTPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: `${EXPIRES_DAYS}d` });
}

// ✅ make it async and await cookies()
export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * EXPIRES_DAYS,
  });
}

// ✅ also async
export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export function getTokenFromReq(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.substring(7);
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return cookie ?? null;
}

export function verifyJwt(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}
