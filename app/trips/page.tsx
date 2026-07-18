import { redirect } from "next/navigation";
import Link from "next/link";
import { PartyPopper, Luggage } from "lucide-react";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { parseJsonArray } from "@/lib/utils";
import TripCard from "@/components/TripCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "My trips — StayBnB" };

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/trips");
  const sp = await searchParams;

  const bookings = await db.booking.findMany({
    where: { userId },
    include: { listing: true, review: true },
    orderBy: { checkIn: "desc" },
  });

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => b.status !== "cancelled" && b.checkOut >= now
  );
  const past = bookings.filter(
    (b) => b.status !== "cancelled" && b.checkOut < now
  );
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const toCard = (b: (typeof bookings)[number]) => ({
    id: b.id,
    status: b.status,
    checkIn: b.checkIn.toISOString(),
    checkOut: b.checkOut.toISOString(),
    guests: b.guests,
    totalPrice: b.totalPrice,
    hasReview: !!b.review,
    listing: {
      id: b.listing.id,
      title: b.listing.title,
      city: b.listing.city,
      country: b.listing.country,
      image: parseJsonArray(b.listing.images)[0] ?? "",
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Trips</h1>

      {sp.booked && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
          <PartyPopper size={22} className="shrink-0 text-green-600" />
          <div>
            <p className="font-bold text-green-800">Booking confirmed!</p>
            <p className="text-sm text-green-700">
              Your payment went through and your stay is locked in. Have a great
              trip!
            </p>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Luggage size={44} className="text-gray-300" />
          <h2 className="text-xl font-bold">No trips yet</h2>
          <p className="max-w-sm text-sm text-muted">
            Time to dust off your bags and start planning your next adventure.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-full bg-gradient-to-r from-brand to-brand-dark px-6 py-3 text-sm font-bold text-white"
          >
            Start searching
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold">Upcoming</h2>
              <div className="space-y-4">
                {upcoming.map((b) => (
                  <TripCard key={b.id} trip={toCard(b)} kind="upcoming" />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold">Where you&apos;ve been</h2>
              <div className="space-y-4">
                {past.map((b) => (
                  <TripCard key={b.id} trip={toCard(b)} kind="past" />
                ))}
              </div>
            </section>
          )}
          {cancelled.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-muted">Cancelled</h2>
              <div className="space-y-4 opacity-70">
                {cancelled.map((b) => (
                  <TripCard key={b.id} trip={toCard(b)} kind="cancelled" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
