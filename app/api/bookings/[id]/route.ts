import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }
  const { id } = await params;

  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== userId) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json({ ok: true });
  }
  if (booking.checkIn <= new Date()) {
    return NextResponse.json(
      { error: "This stay has already started and can't be cancelled." },
      { status: 400 }
    );
  }

  await db.booking.update({ where: { id }, data: { status: "cancelled" } });
  return NextResponse.json({ ok: true });
}
