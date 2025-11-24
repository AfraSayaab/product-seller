import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getTokenFromReq, verifyJwt } from "@/lib/auth";
import { ok, fail } from "@/lib/responses";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const token = getTokenFromReq(req);
    if (!token) {
      return NextResponse.json(fail("Unauthorized. Please login to purchase a plan.", "UNAUTHORIZED"), {
        status: 401,
      });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json(fail("Invalid token. Please login again.", "INVALID_TOKEN"), {
        status: 401,
      });
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId || typeof planId !== "number") {
      return NextResponse.json(fail("Plan ID is required", "INVALID_PLAN_ID"), { status: 400 });
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      return NextResponse.json(fail("Plan not found or inactive", "PLAN_NOT_FOUND"), { status: 404 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      return NextResponse.json(fail("User not found", "USER_NOT_FOUND"), { status: 404 });
    }

    // Convert price to cents (Stripe uses smallest currency unit)
    // For PKR, we'll use the price as-is since Stripe supports PKR
    const amountInCents = Math.round(Number(plan.price) * 100);

    // Create order record first
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        type: "PLAN",
        status: "PENDING",
        amount: plan.price,
        currency: plan.currency,
        provider: "STRIPE",
        metadata: {
          planId: plan.id,
          planName: plan.name,
          durationDays: plan.durationDays,
        },
      },
    });

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout/cancel?order_id=${order.id}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.description || `${plan.durationDays} day subscription plan`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        orderId: order.id.toString(),
        userId: user.id.toString(),
        planId: plan.id.toString(),
      },
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        providerRef: session.id,
      },
    });

    return NextResponse.json(
      ok({
        sessionId: session.id,
        url: session.url,
        orderId: order.id,
      })
    );
  } catch (error: any) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      fail(error.message || "Failed to create checkout session", "CHECKOUT_ERROR"),
      { status: 500 }
    );
  }
}

