import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { activeBookingFilter, nightsBetween, priceBreakdown } from "@/lib/utils";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const { listingId, checkIn, checkOut, guests } = await req.json().catch(() => ({}));
  const inDate = checkIn ? new Date(checkIn) : null;
  const outDate = checkOut ? new Date(checkOut) : null;

  if (!listingId || !inDate || !outDate || isNaN(+inDate) || isNaN(+outDate)) {
    return NextResponse.json({ error: "Invalid booking details." }, { status: 400 });
  }
  if (outDate <= inDate) {
    return NextResponse.json(
      { error: "Checkout must be after check-in." },
      { status: 400 }
    );
  }

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (listing.hostId === userId) {
    return NextResponse.json(
      { error: "You can't book your own listing." },
      { status: 400 }
    );
  }
  const numGuests = Math.max(1, parseInt(guests) || 1);
  if (numGuests > listing.guests) {
    return NextResponse.json(
      { error: `This place fits a maximum of ${listing.guests} guests.` },
      { status: 400 }
    );
  }

  const nights = nightsBetween(inDate, outDate);
  const { total } = priceBreakdown(listing.price, nights);

  // Check-then-insert must be atomic, otherwise two concurrent requests for
  // overlapping dates could both pass the availability check and both get
  // created — a real double-booking.
  try {
    const booking = await db.$transaction(async (tx) => {
      const clash = await tx.booking.findFirst({
        where: {
          listingId,
          checkIn: { lt: outDate },
          checkOut: { gt: inDate },
          ...activeBookingFilter(),
        },
      });
      if (clash) {
        throw new Error("UNAVAILABLE");
      }
      return tx.booking.create({
        data: {
          listingId,
          userId,
          checkIn: inDate,
          checkOut: outDate,
          guests: numGuests,
          nights,
          totalPrice: total,
          status: "pending",
        },
      });
    });
    return NextResponse.json({ id: booking.id });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAVAILABLE") {
      return NextResponse.json(
        { error: "Those dates are no longer available." },
        { status: 409 }
      );
    }
    throw e;
  }
}
