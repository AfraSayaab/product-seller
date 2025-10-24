// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import { ProfileUpdateSchema } from "@/lib/validators";


export async function GET(req: NextRequest) {
    const token = getTokenFromReq(req);
    const payload = token && verifyJwt(token);
    if (!payload) return NextResponse.json(fail("Unauthorized"), { status: 401 });


    const me = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!me) return NextResponse.json(fail("Not found"), { status: 404 });
    const { passwordHash, ...safe } = me as any;
    return NextResponse.json(ok(safe));
}


export async function PATCH(req: NextRequest) {
    const token = getTokenFromReq(req);
    const payload = token && verifyJwt(token);
    if (!payload) return NextResponse.json(fail("Unauthorized"), { status: 401 });


    const body = await req.json().catch(() => null);
    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(fail("Invalid input", "VALIDATION"), { status: 400 });


    const updated = await prisma.user.update({ where: { id: payload.id }, data: parsed.data });
    const { passwordHash, ...safe } = updated as any;
    return NextResponse.json(ok(safe));
}