// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/lib/validators";
import { fail, ok } from "@/lib/responses";
import { rateLimit } from "@/lib/rateLimit";
import { signJwt } from "@/lib/auth";
import { setCORSHeaders } from "@/lib/cors";

const COOKIE_NAME = "auth_token";
const EXPIRES_DAYS = 7;

export async function OPTIONS(req: NextRequest) {
  const headers = new Headers();
  setCORSHeaders(req.headers.get("origin"), headers);
  // (Optional) Explicitly echo standard CORS bits:
  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "content-type, authorization");
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "local";
    if (!rateLimit(`register:${ip}`, 60_000, 10).allowed) {
      return NextResponse.json(fail("Too many requests", "RATE_LIMIT"), { status: 429 });
    }

    const headers = new Headers();
    setCORSHeaders(req.headers.get("origin"), headers);

    const body = await req.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return new NextResponse(
        JSON.stringify(fail(parsed.error.issues[0]?.message || "Invalid input", "VALIDATION")),
        { status: 400, headers }
      );
    }

    const { username, email, phone, password, nickname } = parsed.data;

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }, { phone }] },
      select: { id: true },
    });
    if (exists) {
      return new NextResponse(JSON.stringify(fail("User already exists", "DUPLICATE")), {
        status: 409,
        headers,
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, phone, passwordHash, nickname },
      select: { id: true, role: true, username: true },
    });

    const token = signJwt({ id: user.id, role: user.role, username: user.username });

    // ✅ Set cookie on the response (no cookies() call needed)
    const res = new NextResponse(JSON.stringify(ok({ token })), { status: 201, headers });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * EXPIRES_DAYS,
    });
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
