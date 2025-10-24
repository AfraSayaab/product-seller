// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";


export async function GET(req: NextRequest) {
    const token = getTokenFromReq(req);
    const payload = token && verifyJwt(token);
    console.log(payload)
    if (!payload || payload.role !== "ADMIN") return NextResponse.json(fail("Forbidden"), { status: 403 });


    const users = await prisma.user.findMany({
        select: { id: true, username: true, email: true, phone: true, role: true, isVerified: true, isFirstLogin: true, lastLogin: true, createdAt: true },
        orderBy: { createdAt: "desc" },
    });


    return NextResponse.json(ok(users));
}