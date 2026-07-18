import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: { listing: { select: { title: true, city: true, country: true } } },
  });
  if (!booking || booking.userId !== userId) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status === "confirmed") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "This booking was cancelled." }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (stripeKey) {
    // Real Stripe Checkout (test mode) — used when a key is configured in .env
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(stripeKey);
    const origin = req.headers.get("origin") ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: booking.totalPrice * 100,
            product_data: {
              name: booking.listing.title,
              description: `${booking.nights} nights in ${booking.listing.city}, ${booking.listing.country}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/api/payments/confirm?session_id={CHECKOUT_SESSION_ID}&bookingId=${booking.id}`,
      cancel_url: `${origin}/checkout/${booking.id}`,
      metadata: { bookingId: booking.id },
    });
    return NextResponse.json({ url: session.url });
  }

  // Mock payment processor (default) — simulates a successful charge
  await db.booking.update({
    where: { id },
    data: {
      status: "confirmed",
      paymentRef: `mock_${Math.random().toString(36).slice(2, 12)}`,
    },
  });
  return NextResponse.json({ ok: true });
}
