// src/server/admin-only.ts
import { NextRequest, NextResponse } from "next/server";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import { fail } from "@/lib/responses";

export function getAuthPayload(req: NextRequest) {
  const token = getTokenFromReq(req);
  return token && verifyJwt(token);
}

export function assertAdmin(req: NextRequest) {
  const payload = getAuthPayload(req);
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json(fail("Forbidden"), { status: 403 });
  }
  return null;
}
