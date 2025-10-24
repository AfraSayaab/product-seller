// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/responses"; // your ApiSuccess/ApiError helpers
import { rateLimit } from "@/lib/rateLimit";
import { signJwt } from "@/lib/auth";
import { setCORSHeaders } from "@/lib/cors";

const COOKIE_NAME = "auth_token";
const EXPIRES_DAYS = 7;

// ---- Helpers ---------------------------------------------------------------
type RegisterDTO = {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  nickname: string;
};

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // simple, pragmatic email check

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function sanitize(s: string) {
  return s.trim();
}

function validateRegister(body: any): { ok: true; data: RegisterDTO } | { ok: false; msg: string } {
  if (body == null || typeof body !== "object") {
    return { ok: false, msg: "Invalid input" };
  }

  const raw = {
    username: body.username,
    email: body.email,
    phone: body.phone,
    password: body.password,
    confirmPassword: body.confirmPassword,
    nickname: body.nickname,
  };

  // Presence & type checks
  for (const [k, v] of Object.entries(raw)) {
    if (!isString(v)) return { ok: false, msg: `\`${k}\` is required` };
  }

  const username = sanitize(raw.username);
  const email = sanitize(raw.email).toLowerCase();
  const phone = sanitize(raw.phone);
  const password = raw.password; // don't trim passwords
  const confirmPassword = raw.confirmPassword;
  const nickname = sanitize(raw.nickname);

  // Field validations (mirror your Zod rules)
  if (username.length < 3 || username.length > 32) {
    return { ok: false, msg: "Username must be 3–32 characters" };
  }
  if (!USERNAME_RE.test(username)) {
    return { ok: false, msg: "Username can only contain letters, numbers, and _" };
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, msg: "Invalid email" };
  }

  if (phone.length < 7 || phone.length > 20) {
    return { ok: false, msg: "Phone must be 7–20 characters" };
  }

  if (!isString(password) || password.length < 8) {
    return { ok: false, msg: "Password must be at least 8 characters" };
  }

  if (!isString(confirmPassword) || confirmPassword.length < 8) {
    return { ok: false, msg: "Confirm password must be at least 8 characters" };
  }

  if (password !== confirmPassword) {
    return { ok: false, msg: "Passwords do not match" };
  }

  if (nickname.length < 1 || nickname.length > 50) {
    return { ok: false, msg: "Nickname must be 1–50 characters" };
  }

  return {
    ok: true,
    data: { username, email, phone, password, confirmPassword, nickname },
  };
}

// ---- CORS preflight --------------------------------------------------------
export async function OPTIONS(req: NextRequest) {
  const headers = new Headers();
  setCORSHeaders(req.headers.get("origin"), headers);
  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "content-type, authorization");
  return new NextResponse(null, { status: 204, headers });
}

// ---- Register --------------------------------------------------------------
export async function POST(req: NextRequest) {
  const headers = new Headers();
  setCORSHeaders(req.headers.get("origin"), headers);

  try {
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "local";
    if (!rateLimit(`register:${ip}`, 60_000, 10).allowed) {
      return NextResponse.json(fail("Too many requests", "RATE_LIMIT"), { status: 429, headers });
    }

    const body = await req.json().catch(() => null);
    const v = validateRegister(body);
    if (!v.ok) {
      console.log(v)
      return new NextResponse(JSON.stringify(fail(v.msg, "VALIDATION")), {
        status: 400,
        headers,
      });
    }

    const { username, email, phone, password, nickname } = v.data;

    // Uniqueness check
    // ---- Uniqueness check with specific messages ----
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
          { phone },
        ],
      },
      select: { id: true, email: true, username: true, phone: true },
    });

    if (existingUser) {
      let msg = "User already exists";

      if (existingUser.email === email) {
        msg = "Email is already registered";
      } else if (existingUser.username === username) {
        msg = "Username is already taken";
      } else if (existingUser.phone === phone) {
        msg = "Phone number is already linked to another account";
      }

      return new NextResponse(JSON.stringify(fail(msg, "DUPLICATE")), {
        status: 409,
        headers,
      });
    }


    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, phone, passwordHash, nickname },
      select: { id: true, role: true, username: true },
    });

    const token = signJwt({ id: user.id, role: user.role, username: user.username });

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
    return new NextResponse(JSON.stringify(fail("Internal error", "SERVER_ERROR")), {
      status: 500,
      headers,
    });
  }
}
