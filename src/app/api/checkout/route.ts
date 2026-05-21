import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { priceId } = (await req.json()) as { priceId: string };
  const origin = req.headers.get("origin") ?? "https://offhand.vercel.app";

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "payment",
    return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
