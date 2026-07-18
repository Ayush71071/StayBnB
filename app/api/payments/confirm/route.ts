import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Stripe Checkout success redirect lands here; verify the session then confirm.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const bookingId = url.searchParams.get("bookingId");
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!sessionId || !bookingId || !stripeKey) {
    return NextResponse.redirect(new URL("/trips", url.origin));
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (
    session.payment_status === "paid" &&
    session.metadata?.bookingId === bookingId
  ) {
    await db.booking.update({
      where: { id: bookingId },
      data: { status: "confirmed", paymentRef: sessionId },
    });
    return NextResponse.redirect(new URL("/trips?booked=1", url.origin));
  }

  return NextResponse.redirect(new URL(`/checkout/${bookingId}`, url.origin));
}
