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

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(searchParams.get("pageSize") || "10", 10)));
    const q = (searchParams.get("q") || "").trim();
    const sort = searchParams.get("sort") || "createdAt:desc";

    // (Optional) whitelist to avoid bad field names crashing Prisma
    const ALLOWED_SORT_FIELDS = new Set([
        "createdAt", "updatedAt", "email", "username", "phone", "firstName", "lastName", "role", "isVerified", "lastLogin"
    ]);
    let [sortField, sortDir] = sort.split(":");
    if (!ALLOWED_SORT_FIELDS.has(sortField)) sortField = "createdAt";
    if (sortDir !== "asc" && sortDir !== "desc") sortDir = "desc";
    const orderBy: any = { [sortField]: sortDir };

    const like = (field: string) => ({ [field]: { contains: q } });

    const where: any =
        q
            ? { OR: ["username", "email", "phone", "firstName", "lastName"].map(like) }
            : undefined;

    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                role: true,
                isVerified: true,
                isFirstLogin: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                firstName: true,
                lastName: true,
            },
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
    ]);

    return NextResponse.json(
        ok({
            items: users,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.max(1, Math.ceil(total / pageSize)),
            },
            sort: `${sortField}:${sortDir}`,
            q,
        })
    );
}


// export async function POST(req: NextRequest) {
//   const token = getTokenFromReq(req);
//   const payload = token && verifyJwt(token);
//   if (!payload || payload.role !== "ADMIN") return NextResponse.json(fail("Forbidden"), { status: 403 });

//   const body = await req.json();
//   const {
//     username,
//     email,
//     phone,
//     password,
//     role = "USER",
//     firstName,
//     lastName,
//     isVerified = false,
//   } = body || {};

//   if (!username || !email || !phone || !password)
//     return NextResponse.json(fail("Missing required fields"), { status: 400 });

//   // Hash password
//   const bcrypt = await import("bcryptjs");
//   const passwordHash = await bcrypt.hash(password, 10);

//   try {
//     const created = await prisma.user.create({
//       data: {
//         username,
//         email,
//         phone,
//         passwordHash,
//         role,
//         firstName,
//         lastName,
//         isVerified,
//       },
//       select: {
//         id: true,
//         username: true,
//         email: true,
//         phone: true,
//         role: true,
//         isVerified: true,
//         createdAt: true,
//       },
//     });

//     return NextResponse.json(ok(created), { status: 201 });
//   } catch (e: any) {
//     return NextResponse.json(fail(e?.message || "Failed to create user"), { status: 400 });
//   }
// }




