// File: app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({ where: { id: Number(params.id) } });
  if (!user) return NextResponse.json(fail("Not found"), { status: 404 });
  return NextResponse.json(ok(user));
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromReq(req);
  const payload = token && verifyJwt(token);
  if (!payload || payload.role !== "ADMIN") return NextResponse.json(fail("Forbidden"), { status: 403 });

  const id = Number(params.id);
  const body = await req.json();
  const { password, ...rest } = body || {};

  const data: any = { ...rest };
  // if (password) {
  //   const bcrypt = null // await import("bcryptjs");
  //   data.passwordHash = await bcrypt.hash(password, 10);
  // }

  try {
    const updated = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(ok(updated));
  } catch (e: any) {
    return NextResponse.json(fail(e?.message || "Update failed"), { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromReq(req);
  const payload = token && verifyJwt(token);
  if (!payload || payload.role !== "ADMIN") return NextResponse.json(fail("Forbidden"), { status: 403 });

  const id = Number(params.id);
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json(ok({ id }));
  } catch (e: any) {
    return NextResponse.json(fail(e?.message || "Delete failed"), { status: 400 });
  }
}