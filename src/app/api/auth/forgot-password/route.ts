// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ForgotPasswordSchema } from "@/lib/validators";
import { fail, ok } from "@/lib/responses";
import { rateLimit } from "@/lib/rateLimit";
import { setCORSHeaders } from "@/lib/cors";
import { sendEmail, generatePasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

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
    if (!rateLimit(`forgot-password:${ip}`, 60_000, 5).allowed) {
      return NextResponse.json(fail("Too many requests", "RATE_LIMIT"), { status: 429 });
    }

    const headers = new Headers();
    setCORSHeaders(req.headers.get("origin"), headers);

    const body = await req.json().catch(() => null);
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return new NextResponse(JSON.stringify(fail("Invalid email address")), { status: 400, headers });
    }

    const { email } = parsed.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return new NextResponse(JSON.stringify(fail("Email Not Found Please contact support if you think this is an error", "SERVER_ERROR")), {
        status: 404,
        headers,
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      } as any,
    });

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Send email (best-effort; don't fail the request if email fails)
    try {
      const emailData = generatePasswordResetEmail({
        email: user.email,
        resetToken,
        resetUrl,
        username: user.username,
      });

      await sendEmail({
        to: user.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Still return success to user, but log the error
    }

    return new NextResponse(
      JSON.stringify(ok({ message: "If an account exists with this email, a password reset link has been sent." })),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    const headers = new Headers();
    setCORSHeaders(req.headers.get("origin"), headers);
    return new NextResponse(JSON.stringify(fail("Internal error", "SERVER_ERROR")), {
      status: 500,
      headers,
    });
  }
}

