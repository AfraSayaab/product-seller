// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { LoginSchema } from "@/lib/validators";
import { fail, ok } from "@/lib/responses";
import { rateLimit } from "@/lib/rateLimit";
import { signJwt } from "@/lib/auth";
import { setCORSHeaders } from "@/lib/cors";

const COOKIE_NAME = "auth_token";
const EXPIRES_DAYS = 7;

export async function OPTIONS(req: NextRequest) {
  const headers = new Headers();
  setCORSHeaders(req.headers.get("origin"), headers);
  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "content-type, authorization");
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "local";
    if (!rateLimit(`login:${ip}`, 60_000, 30).allowed) {
      return NextResponse.json(fail("Too many requests", "RATE_LIMIT"), { status: 429 });
    }

    const headers = new Headers();
    setCORSHeaders(req.headers.get("origin"), headers);

    const body = await req.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return new NextResponse(JSON.stringify(fail("Invalid credentials")), { status: 400, headers });
    }

    const { usernameOrEmail, password } = parsed.data;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }] },
    });

    if (!user) {
      return new NextResponse(JSON.stringify(fail("Invalid credentials")), { status: 401, headers });
    }

    const okPass = await bcrypt.compare(password, (user as any).passwordHash);
    if (!okPass) {
      return new NextResponse(JSON.stringify(fail("Invalid credentials")), { status: 401, headers });
    }

    const token = signJwt({ id: user.id, role: user.role as any, username: user.username });

    // ✅ Set cookie on the response (no cookies() call needed)
    const res = new NextResponse(JSON.stringify(ok({ token })), { status: 200, headers });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * EXPIRES_DAYS,
    });

    // Update login flags (best-effort; keeps response fast)
    prisma.user
      .update({
        where: { id: user.id },
        data: { lastLogin: new Date(), isFirstLogin: false },
        select: { id: true },
      })
      .catch(() => { /* ignore */ });

    return res;
  } catch (err) {
    const headers = new Headers();
    setCORSHeaders(req.headers.get("origin"), headers);
    return new NextResponse(JSON.stringify(fail("Internal error", "SERVER_ERROR")), {
      status: 500,
      headers,
    });
  }
}
