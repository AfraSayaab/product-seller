// File: app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import bcrypt from "bcrypt";
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  if (!id) return NextResponse.json(fail("please send the id"), { status: 404 });
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) return NextResponse.json(fail("Not found"), { status: 404 });
  return NextResponse.json(ok(user));
}



const ALLOWED_FIELDS: (keyof PartialUserUpdate)[] = [
  "username",
  "email",
  "phone",
  "role",
  "firstName",
  "lastName",
  "nickname",
  "displayPublicAs",
  "website",
  "whatsapp",
  "biography",
  "publicAddress",
  "facebook",
  "twitter",
  "linkedin",
  "pinterest",
  "behance",
  "dribbble",
  "instagram",
  "youtube",
  "vimeo",
  "flickr",
  "isVerified",
  "isFirstLogin",
  "lastLogin",
  // special handling: password (string) → will map to passwordHash if provided & non-empty
  "password",
];

type PartialUserUpdate = {
  username?: string;
  email?: string;
  phone?: string;
  role?: "ADMIN" | "USER" | string;
  firstName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
  displayPublicAs?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  biography?: string | null;
  publicAddress?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  pinterest?: string | null;
  behance?: string | null;
  dribbble?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  vimeo?: string | null;
  flickr?: string | null;
  isVerified?: boolean;
  isFirstLogin?: boolean;
  lastLogin?: string | Date | null;
  password?: string; // incoming only; not persisted as-is
};

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function trimOpt(s?: string | null) {
  return isString(s) ? s.trim() : s ?? null;
}

function normalizeInput(body: any): { ok: true; data: PartialUserUpdate } | { ok: false; msg: string } {
  if (!body || typeof body !== "object") return { ok: false, msg: "Invalid input" };

  // Only accept whitelisted fields
  const data: PartialUserUpdate = {};
  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      // strings: trim; booleans & dates: pass-through (light touch)
      const v = body[key];
      if (["isVerified", "isFirstLogin"].includes(key)) {
        (data as any)[key] = typeof v === "boolean" ? v : Boolean(v);
      } else if (key === "lastLogin") {
        (data as any)[key] = v ? new Date(v) : null;
      } else if (typeof v === "string") {
        (data as any)[key] = v.trim();
      } else {
        (data as any)[key] = v;
      }
    }
  }

  // Basic pragmatic checks (optional: extend as needed)
  if (data.username && (data.username.length < 3 || data.username.length > 32)) {
    return { ok: false, msg: "Username must be 3–32 characters" };
  }
  if (data.username && !/^[a-zA-Z0-9_]+$/.test(data.username)) {
    return { ok: false, msg: "Username can only contain letters, numbers, and _" };
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, msg: "Invalid email" };
  }
  if (data.phone && (data.phone.length < 7 || data.phone.length > 20)) {
    return { ok: false, msg: "Phone must be 7–20 characters" };
  }
  if (data.password !== undefined && data.password !== "" && data.password.length < 8) {
    return { ok: false, msg: "Password must be at least 8 characters" };
  }

  return { ok: true, data };
}

async function ensureNotDuplicate(id: number, data: PartialUserUpdate) {
  // Check only fields that are present
  const dup = await prisma.user.findFirst({
    where: {
      AND: [
        { id: { not: id } },
        {
          OR: [
            data.email ? { email: data.email } : undefined,
            data.username ? { username: data.username } : undefined,
            data.phone ? { phone: data.phone } : undefined,
          ].filter(Boolean) as any[],
        },
      ],
    },
    select: { id: true, email: true, username: true, phone: true },
  });

  if (!dup) return null;

  if (data.email && dup.email === data.email) {
    return { msg: "Email is already registered", code: "EMAIL_TAKEN" as const };
  }
  if (data.username && dup.username === data.username) {
    return { msg: "Username is already taken", code: "USERNAME_TAKEN" as const };
  }
  if (data.phone && dup.phone === data.phone) {
    return { msg: "Phone number is already linked to another account", code: "PHONE_TAKEN" as const };
  }
  return { msg: "Duplicate value", code: "DUPLICATE" as const };
}



// ---- PATCH -----------------------------------------------------------------
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const headers = new Headers();

  try {
    // AuthZ
    const token = req.headers.get("cookie") || "";
    const jwt = token.split(";").find(c => c.trim().startsWith("auth_token="))?.split("=")[1];
    const payload = jwt ? verifyJwt(jwt) : null;
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(fail("Forbidden", "FORBIDDEN"), { status: 403, headers });
    }

    // ID
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(fail("Invalid user id", "BAD_ID"), { status: 400, headers });
    }

    // Must exist
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(fail("User not found", "NOT_FOUND"), { status: 404, headers });
    }

    // Body & validation
    const raw = await req.json().catch(() => null);
    const norm = normalizeInput(raw);
    if (!norm.ok) {
      return NextResponse.json(fail(norm.msg, "VALIDATION"), { status: 400, headers });
    }
    const dataIn = norm.data;

    // Duplicate checks only for provided fields
    const duplicate = await ensureNotDuplicate(id, dataIn);
    if (duplicate) {
      return NextResponse.json(fail(duplicate.msg, duplicate.code), { status: 409, headers });
    }

    // Build Prisma data (strip `password`, map to `passwordHash` if provided & non-empty)
    const { password, ...rest } = dataIn;

    const prismaData: any = { ...rest };

    if (isString(password) && password.trim().length > 0) {
      prismaData.passwordHash = await bcrypt.hash(password, 12);
    }
    // else: keep current passwordHash by simply not including it

    // Update
    const updated = await prisma.user.update({
      where: { id },
      data: prismaData,
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        nickname: true,
        displayPublicAs: true,
        website: true,
        whatsapp: true,
        biography: true,
        publicAddress: true,
        facebook: true,
        twitter: true,
        linkedin: true,
        pinterest: true,
        behance: true,
        dribbble: true,
        instagram: true,
        youtube: true,
        vimeo: true,
        flickr: true,
        isVerified: true,
        isFirstLogin: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(ok(updated), { status: 200, headers });
  } catch (e: any) {
    // Prisma known request errors get their message surfaced; otherwise generic
    const msg = typeof e?.message === "string" ? e.message : "Update failed";
    return NextResponse.json(fail(msg, "SERVER_ERROR"), { status: 400, headers });
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