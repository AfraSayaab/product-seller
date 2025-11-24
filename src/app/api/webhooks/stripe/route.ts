import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get order from metadata
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        console.error("No orderId in session metadata");
        return NextResponse.json({ error: "No orderId found" }, { status: 400 });
      }

      // Find the order
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
        include: {
          user: true,
        },
      });

      if (!order) {
        console.error(`Order ${orderId} not found`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // If order is already paid, skip
      if (order.status === "PAID") {
        return NextResponse.json({ received: true });
      }

      // Get plan details from metadata or order
      const planId = session.metadata?.planId || (order.metadata as any)?.planId;
      if (!planId) {
        console.error("No planId found in order metadata");
        return NextResponse.json({ error: "No planId found" }, { status: 400 });
      }

      const plan = await prisma.plan.findUnique({
        where: { id: Number(planId) },
      });

      if (!plan) {
        console.error(`Plan ${planId} not found`);
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      // Start transaction to create subscription and update order
      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            providerRef: session.id,
            metadata: {
              ...(order.metadata as any),
              stripeSessionId: session.id,
              paymentIntentId: session.payment_intent,
              completedAt: new Date().toISOString(),
            },
          },
        });

        // Calculate subscription end date
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationDays);

        // Cancel any existing active subscriptions for this user
        await tx.subscription.updateMany({
          where: {
            userId: order.userId,
            status: "ACTIVE",
          },
          data: {
            status: "CANCELED",
            canceledAt: new Date(),
          },
        });

        // Create new subscription
        const subscription = await tx.subscription.create({
          data: {
            userId: order.userId,
            planId: plan.id,
            status: "ACTIVE",
            startAt: startDate,
            endAt: endDate,
            remainingListings: plan.quotaListings,
            remainingBumps: plan.quotaBumps,
            remainingFeaturedDays: plan.quotaFeaturedDays,
          },
        });

        // Link subscription to order
        await tx.order.update({
          where: { id: order.id },
          data: {
            subscriptionId: subscription.id,
          },
        });
      });

      return NextResponse.json({ received: true });
    }

    // Handle payment_intent.succeeded as backup
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // You can add additional handling here if needed
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Configure route to handle raw body
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

