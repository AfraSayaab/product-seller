import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ok, fail } from "@/lib/responses";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";

function parseId(idStr: string) {
  const id = Number(idStr);
  if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid user id");
  }
  return id;
}

// GET - Get user's active subscription
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const token = getTokenFromReq(_req);
    const payload = token && verifyJwt(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(fail("Forbidden"), { status: 403 });
    }

    const { id: idStr } = await ctx.params;
    const userId = parseId(idStr);

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        endAt: {
          gte: new Date(),
        },
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            currency: true,
            durationDays: true,
          },
        },
      },
      orderBy: {
        endAt: "desc",
      },
    });

    return NextResponse.json(ok(subscription));
  } catch (e: any) {
    return NextResponse.json(fail(e?.message || "Bad request"), { status: 400 });
  }
}

// POST - Assign a new plan to user
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const token = getTokenFromReq(req);
    const payload = token && verifyJwt(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(fail("Forbidden"), { status: 403 });
    }

    const { id: idStr } = await ctx.params;
    const userId = parseId(idStr);

    const body = await req.json();
    const { planId, startAt, extendDays } = body;

    if (!planId || !Number.isInteger(Number(planId)) || Number(planId) <= 0) {
      return NextResponse.json(fail("Invalid planId"), { status: 400 });
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: Number(planId) },
    });

    if (!plan) {
      return NextResponse.json(fail("Plan not found"), { status: 404 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(fail("User not found"), { status: 404 });
    }

    // Calculate end date
    const startDate = startAt ? new Date(startAt) : new Date();
    const durationDays = extendDays ? Number(extendDays) : plan.durationDays;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    // Cancel existing active subscriptions
    await prisma.subscription.updateMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
      },
    });

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: Number(planId),
        status: "ACTIVE",
        startAt: startDate,
        endAt: endDate,
        remainingListings: plan.quotaListings,
        remainingBumps: plan.quotaBumps,
        remainingFeaturedDays: plan.quotaFeaturedDays,
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            currency: true,
            durationDays: true,
          },
        },
      },
    });

    return NextResponse.json(ok(subscription), { status: 201 });
  } catch (e: any) {
    console.error("POST /api/admin/users/[id]/subscription error:", e);
    return NextResponse.json(fail(e?.message || "Failed to assign plan"), { status: 400 });
  }
}

// PATCH - Update existing subscription
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const token = getTokenFromReq(req);
    const payload = token && verifyJwt(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(fail("Forbidden"), { status: 403 });
    }

    const { id: idStr } = await ctx.params;
    const userId = parseId(idStr);

    const body = await req.json();
    const { subscriptionId, planId, status, extendDays, endAt } = body;

    if (!subscriptionId || !Number.isInteger(Number(subscriptionId))) {
      return NextResponse.json(fail("Invalid subscriptionId"), { status: 400 });
    }

    // Get existing subscription
    const existing = await prisma.subscription.findUnique({
      where: { id: Number(subscriptionId) },
      include: { plan: true },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json(fail("Subscription not found"), { status: 404 });
    }

    const updateData: any = {};

    // Update plan if provided
    if (planId && Number.isInteger(Number(planId)) && Number(planId) > 0) {
      const plan = await prisma.plan.findUnique({
        where: { id: Number(planId) },
      });
      if (!plan) {
        return NextResponse.json(fail("Plan not found"), { status: 404 });
      }
      updateData.planId = Number(planId);
      updateData.remainingListings = plan.quotaListings;
      updateData.remainingBumps = plan.quotaBumps;
      updateData.remainingFeaturedDays = plan.quotaFeaturedDays;
    }

    // Update status if provided
    if (status && ["ACTIVE", "CANCELED", "EXPIRED", "PAST_DUE"].includes(status)) {
      updateData.status = status;
      if (status === "CANCELED" && !existing.canceledAt) {
        updateData.canceledAt = new Date();
      }
    }

    // Update end date
    if (endAt) {
      updateData.endAt = new Date(endAt);
    } else if (extendDays && Number.isInteger(Number(extendDays))) {
      const newEndDate = new Date(existing.endAt);
      newEndDate.setDate(newEndDate.getDate() + Number(extendDays));
      updateData.endAt = newEndDate;
    }

    const updated = await prisma.subscription.update({
      where: { id: Number(subscriptionId) },
      data: updateData,
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            currency: true,
            durationDays: true,
          },
        },
      },
    });

    return NextResponse.json(ok(updated));
  } catch (e: any) {
    console.error("PATCH /api/admin/users/[id]/subscription error:", e);
    return NextResponse.json(fail(e?.message || "Failed to update subscription"), { status: 400 });
  }
}

// DELETE - Cancel subscription
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const token = getTokenFromReq(req);
    const payload = token && verifyJwt(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(fail("Forbidden"), { status: 403 });
    }

    const { id: idStr } = await ctx.params;
    const userId = parseId(idStr);

    const url = new URL(req.url);
    const subscriptionId = url.searchParams.get("subscriptionId");

    if (!subscriptionId || !Number.isInteger(Number(subscriptionId))) {
      return NextResponse.json(fail("Invalid subscriptionId"), { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: Number(subscriptionId) },
    });

    if (!subscription || subscription.userId !== userId) {
      return NextResponse.json(fail("Subscription not found"), { status: 404 });
    }

    const updated = await prisma.subscription.update({
      where: { id: Number(subscriptionId) },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
      },
    });

    return NextResponse.json(ok({ canceled: true, subscription: updated }));
  } catch (e: any) {
    console.error("DELETE /api/admin/users/[id]/subscription error:", e);
    return NextResponse.json(fail(e?.message || "Failed to cancel subscription"), { status: 400 });
  }
}

