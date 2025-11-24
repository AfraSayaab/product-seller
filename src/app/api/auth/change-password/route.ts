import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { ChangePasswordSchema } from "@/lib/validators";
import { fail, ok } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const token = getTokenFromReq(req);
    if (!token) {
      return NextResponse.json(fail("Unauthorized. Please login to change your password.", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json(fail("Invalid token. Please login again.", "INVALID_TOKEN"), {
        status: 401,
      });
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);
    
    // Check if body exists
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        fail("Please provide your current password and new password.", "VALIDATION"),
        { status: 400 }
      );
    }

    // Check for missing fields with user-friendly messages
    if (!body.currentPassword || typeof body.currentPassword !== "string" || body.currentPassword.trim() === "") {
      return NextResponse.json(
        fail("Current password is required. Please enter your current password.", "VALIDATION"),
        { status: 400 }
      );
    }

    if (!body.newPassword || typeof body.newPassword !== "string" || body.newPassword.trim() === "") {
      return NextResponse.json(
        fail("New password is required. Please enter your new password.", "VALIDATION"),
        { status: 400 }
      );
    }

    // Validate with schema (using newPassword as confirmPassword since frontend validates separately)
    const parsed = ChangePasswordSchema.safeParse({
      currentPassword: body.currentPassword.trim(),
      newPassword: body.newPassword.trim(),
      confirmPassword: body.newPassword.trim(), // Frontend handles confirmation, so use same value here
    });

    if (!parsed.success) {
      // Extract user-friendly error messages from Zod validation
      const errors = parsed.error.issues;
      let errorMessage = "Please check your input and try again.";

      // Find the first meaningful error
      for (const issue of errors) {
        const path = issue.path.join(".");
        
        if (issue.code === "too_small" && path === "newPassword") {
          errorMessage = "Your new password must be at least 8 characters long.";
          break;
        } else if (issue.code === "too_small" && path === "currentPassword") {
          errorMessage = "Please enter your current password.";
          break;
        } else if (issue.message.includes("required")) {
          if (path === "currentPassword") {
            errorMessage = "Current password is required.";
          } else if (path === "newPassword") {
            errorMessage = "New password is required.";
          }
          break;
        } else if (issue.message.includes("match")) {
          errorMessage = "The new password and confirmation password do not match.";
          break;
        } else if (issue.message.includes("different")) {
          errorMessage = "Your new password must be different from your current password.";
          break;
        } else if (issue.message) {
          errorMessage = issue.message;
          break;
        }
      }

      return NextResponse.json(fail(errorMessage, "VALIDATION"), { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, passwordHash: true } as any,
    }) as { id: number; passwordHash: string } | null;

    if (!user) {
      return NextResponse.json(
        fail("We couldn't find your account. Please sign in again.", "USER_NOT_FOUND"),
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, (user as any).passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(fail("Current password is incorrect", "INVALID_PASSWORD"), { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
      } as any,
    });

    return NextResponse.json(ok({ message: "Password has been changed successfully" }), { status: 200 });
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json(fail(err.message || "Internal error", "SERVER_ERROR"), {
      status: 500,
    });
  }
}

