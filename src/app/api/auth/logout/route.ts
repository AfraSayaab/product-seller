// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fail, ok } from "@/lib/responses";
import { setCORSHeaders } from "@/lib/cors";

const COOKIE_NAME = "auth_token";

function withCors(origin: string | null) {
  const headers = new Headers();
  setCORSHeaders(origin, headers);
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "content-type, authorization");
  headers.set("Access-Control-Allow-Credentials", "true");
  return headers;
}

function clearAuthCookie(res: NextResponse) {
  // Prefer delete; also set an expired cookie for extra safety with older clients
  res.cookies.delete(COOKIE_NAME);
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export async function OPTIONS(req: NextRequest) {
  const headers = withCors(req.headers.get("origin"));
  return new NextResponse(null, { status: 204, headers });
}

// Allow both POST and GET (handy for simple link-based sign-outs)
export async function POST(req: NextRequest) {
  try {
    const headers = withCors(req.headers.get("origin"));
    const res = new NextResponse(JSON.stringify(ok({ message: "Logged out" })), {
      status: 200,
      headers,
    });
    return clearAuthCookie(res);
  } catch {
    const headers = withCors(req.headers.get("origin"));
    return new NextResponse(JSON.stringify(fail("Internal error", "SERVER_ERROR")), {
      status: 500,
      headers,
    });
  }
}

export async function GET(req: NextRequest) {
  // Optional: support GET /api/auth/logout for convenience
  return POST(req);
}
