// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { ResetPasswordSchema } from "@/lib/validators";
import { fail, ok } from "@/lib/responses";
import { rateLimit } from "@/lib/rateLimit";
import { setCORSHeaders } from "@/lib/cors";

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
    if (!rateLimit(`reset-password:${ip}`, 60_000, 5).allowed) {
      return NextResponse.json(fail("Too many requests", "RATE_LIMIT"), { status: 429 });
    }

    const headers = new Headers();
    setCORSHeaders(req.headers.get("origin"), headers);

    const body = await req.json().catch(() => null);
    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0]?.message || "Invalid input";
      return new NextResponse(JSON.stringify(fail(errorMessage)), { status: 400, headers });
    }

    const { token, password } = parsed.data;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(), // Token must not be expired
        },
      } as any,
      select: { id: true, passwordResetToken: true } as any,
    }) as { id: number; passwordResetToken: string | null } | null;

    if (!user) {
      return new NextResponse(JSON.stringify(fail("Invalid or expired reset token")), { status: 400, headers });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      } as any,
    });

    return new NextResponse(JSON.stringify(ok({ message: "Password has been reset successfully" })), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Reset password error:", err);
    const headers = new Headers();
    setCORSHeaders(req.headers.get("origin"), headers);
    return new NextResponse(JSON.stringify(fail("Internal error", "SERVER_ERROR")), {
      status: 500,
      headers,
    });
  }
}

