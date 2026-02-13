import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "auth_token";
const ADMIN_PATH = "/admin";

async function verifyJwtEdge(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: number; role: "USER" | "ADMIN"; username: string } | null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;

  const isProtected =
    path.startsWith("/admin") ||
    path.startsWith("/user") ||
    path.startsWith("/profile");

  const isAdminOnly = path.startsWith(ADMIN_PATH);

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifyJwtEdge(token);

  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminOnly && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/user", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/profile"],
};
