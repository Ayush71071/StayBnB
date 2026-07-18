import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const { bookingId, rating, comment } = await req.json().catch(() => ({}));
  const stars = parseInt(rating);

  if (!bookingId || !stars || stars < 1 || stars > 5 || !comment?.trim()) {
    return NextResponse.json(
      { error: "A star rating and a comment are required." },
      { status: 400 }
    );
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });
  if (!booking || booking.userId !== userId) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status !== "confirmed" || booking.checkOut > new Date()) {
    return NextResponse.json(
      { error: "You can review a stay after it's completed." },
      { status: 400 }
    );
  }
  if (booking.review) {
    return NextResponse.json(
      { error: "You already reviewed this stay." },
      { status: 409 }
    );
  }

  await db.review.create({
    data: {
      bookingId,
      listingId: booking.listingId,
      userId,
      rating: stars,
      comment: comment.trim(),
    },
  });

  return NextResponse.json({ ok: true });
}
