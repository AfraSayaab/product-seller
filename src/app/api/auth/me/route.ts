// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";


export async function GET(req: NextRequest) {
    const token = getTokenFromReq(req);
    if (!token) return NextResponse.json(fail("Unauthorized", "NO_TOKEN"), { status: 401 });
    const payload = verifyJwt(token);
    if (!payload) return NextResponse.json(fail("Unauthorized", "BAD_TOKEN"), { status: 401 });


    const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
            id: true, username: true, email: true, phone: true, role: true,
            firstName: true, lastName: true, nickname: true, displayPublicAs: true,
            website: true, whatsapp: true, biography: true, publicAddress: true,
            facebook: true, twitter: true, linkedin: true, pinterest: true,
            behance: true, dribbble: true, instagram: true, youtube: true,
            vimeo: true, flickr: true, isVerified: true, isFirstLogin: true, lastLogin: true,
            createdAt: true,
        },
    });


    if (!user) return NextResponse.json(fail("Not found"), { status: 404 });
    return NextResponse.json(ok(user));
}