import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { activeBookingFilter } from "@/lib/utils";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }
  const { id } = await params;

  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing || listing.hostId !== userId) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const upcomingBooking = await db.booking.findFirst({
    where: {
      listingId: id,
      checkOut: { gte: new Date() },
      ...activeBookingFilter(),
    },
  });
  if (upcomingBooking) {
    return NextResponse.json(
      {
        error:
          "This listing has upcoming reservations and can't be deleted. It will delete automatically once those stays are completed or cancelled.",
      },
      { status: 409 }
    );
  }

  await db.listing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
