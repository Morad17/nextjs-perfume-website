import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Idempotency — skip if we already processed this session
    const existing = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    });
    if (existing) {
      return NextResponse.json({ received: true });
    }

    const basketItems: { productId: string; size: number; quantity: number }[] =
      JSON.parse(session.metadata?.basketItems ?? "[]");

    if (basketItems.length === 0) {
      return NextResponse.json({ received: true });
    }

    // Re-fetch prices for order record
    const productIds = [...new Set(basketItems.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const customerDetails = session.customer_details;
    const address = customerDetails?.address;

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          stripeSessionId: session.id,
          customerEmail: customerDetails?.email ?? "",
          customerName: customerDetails?.name ?? "",
          status: "PAID",
          total: session.amount_total ?? 0,
          shippingAddress: address
            ? {
                line1: address.line1 ?? "",
                line2: address.line2 ?? "",
                city: address.city ?? "",
                postalCode: address.postal_code ?? "",
                country: address.country ?? "",
              }
            : {},
        },
      });

      for (const item of basketItems) {
        const product = productMap.get(item.productId);
        if (!product) continue;

        const sizes = product.sizes as { ml: number; price: number }[];
        const sizeData = sizes.find((s) => s.ml === item.size);
        const unitPrice = sizeData ? sizeData.price : product.price;

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: unitPrice,
            size: item.size,
          },
        });

        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });
  }

  return NextResponse.json({ received: true });
}
