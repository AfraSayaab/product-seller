import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const token = getTokenFromReq(req);
    const payload = token && verifyJwt(token);
    if (!payload || payload.role !== "ADMIN") {
        return NextResponse.json(fail("Forbidden"), { status: 403 });
    }



    const totalUser = await prisma.user.count()
    const totalCategory = await prisma.category.count()

    return NextResponse.json(
        ok({
            totalUser,
            totalProducts: 300,
            totalCategory,
            planPurchased: 80,
        })
    );
}