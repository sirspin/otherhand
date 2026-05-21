import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "missing session_id" }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return NextResponse.json({
    status: session.status,
    customerEmail: session.customer_details?.email,
  });
}
