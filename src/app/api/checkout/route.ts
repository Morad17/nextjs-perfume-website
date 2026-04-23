import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type { BasketItem } from "@/types/basket";

export async function POST(req: NextRequest) {
  try {
    const { items }: { items: BasketItem[] } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Basket is empty" }, { status: 400 });
    }

    // Re-fetch product prices from DB — never trust client prices
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const lineItems: {
      price_data: {
        currency: string;
        product_data: { name: string; images: string[] };
        unit_amount: number;
      };
      quantity: number;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      // Find the size-specific price from the product's sizes JSON
      const sizes = product.sizes as { ml: number; price: number }[];
      const sizeData = sizes.find((s) => s.ml === item.size);
      const unitAmount = sizeData ? sizeData.price : product.price;

      lineItems.push({
        price_data: {
          currency: "gbp",
          product_data: {
            name: `${product.name} — ${item.size}ml`,
            images: [product.imageUrl],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["GB", "US", "CA", "AU", "FR", "DE", "IT", "ES"],
      },
      success_url: `${baseUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: {
        basketItems: JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
          }))
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
