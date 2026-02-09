import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
const parseId = (s: string) => {
  const n = Number(s);
  if (!Number.isInteger(n) || n <= 0) throw new Error("Invalid id");
  return n;
};

function jsonSafe(value: any): any {
  if (value === null || value === undefined) return value;
  if (value?.constructor?.name === "Decimal") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (typeof value === "object") {
    const out: any = {};
    for (const k of Object.keys(value)) out[k] = jsonSafe(value[k]);
    return out;
  }
  return value;
}

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const userId = parseId(id);
    console.log("Fetching user with id:", userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        website: true,
        whatsapp: true,
        firstName: true,
        lastName: true,
        biography: true,
        publicAddress: true,
        facebook: true,
        instagram: true,
        twitter: true,
        linkedin: true,
        youtube: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: jsonSafe(user) });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Bad request" },
      { status: 400 }
    );
  }
}
