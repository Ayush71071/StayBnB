import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Wallet,
  CalendarCheck,
  Home,
  Star,
  Plus,
  CalendarDays,
} from "lucide-react";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import {
  avgRating,
  formatDateShort,
  formatMoney,
  parseJsonArray,
} from "@/lib/utils";
import HostListingCard from "@/components/HostListingCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Host dashboard — StayBnB" };

export default async function HostPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/host");

  const listings = await db.listing.findMany({
    where: { hostId: userId },
    include: {
      reviews: { select: { rating: true } },
      bookings: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { checkIn: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const allBookings = listings.flatMap((l) =>
    l.bookings.map((b) => ({ ...b, listingTitle: l.title }))
  );
  const confirmed = allBookings.filter((b) => b.status === "confirmed");
  const earnings = confirmed.reduce((a, b) => a + b.totalPrice, 0);
  const now = new Date();
  const upcoming = confirmed
    .filter((b) => b.checkOut >= now)
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());
  const allRatings = listings.flatMap((l) => l.reviews);
  const rating = avgRating(allRatings);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Host dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Your listings, reservations and earnings at a glance.
          </p>
        </div>
        <Link
          href="/host/listings/new"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-dark px-5 py-3 text-sm font-bold text-white transition hover:brightness-105"
        >
          <Plus size={16} strokeWidth={3} /> Create listing
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Wallet size={19} />}
          label="Total earnings"
          value={formatMoney(earnings)}
          tint="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={<CalendarCheck size={19} />}
          label="Upcoming stays"
          value={String(upcoming.length)}
          tint="bg-sky-50 text-sky-600"
        />
        <StatCard
          icon={<Home size={19} />}
          label="Active listings"
          value={String(listings.length)}
          tint="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={<Star size={19} />}
          label="Overall rating"
          value={rating !== null ? `${rating.toFixed(2)} ★` : "—"}
          tint="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Upcoming reservations */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold">Upcoming reservations</h2>
        {upcoming.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-6 py-8 text-sm text-muted">
            <CalendarDays size={20} />
            No upcoming reservations yet — they&apos;ll appear here once guests
            book.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Guest</th>
                  <th className="px-5 py-3.5 font-bold">Listing</th>
                  <th className="px-5 py-3.5 font-bold">Dates</th>
                  <th className="px-5 py-3.5 font-bold">Guests</th>
                  <th className="px-5 py-3.5 text-right font-bold">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcoming.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2.5">
                        {b.user.avatar && (
                          <Image
                            src={b.user.avatar}
                            alt={b.user.name}
                            width={30}
                            height={30}
                            className="rounded-full"
                          />
                        )}
                        <span className="font-semibold">{b.user.name}</span>
                      </span>
                    </td>
                    <td className="max-w-52 truncate px-5 py-3.5 text-gray-700">
                      {b.listingTitle}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-700">
                      {formatDateShort(b.checkIn)} – {formatDateShort(b.checkOut)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{b.guests}</td>
                    <td className="px-5 py-3.5 text-right font-bold">
                      {formatMoney(b.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Listings */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold">Your listings</h2>
        {listings.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-gray-300 px-6 py-10">
            <p className="font-bold">You haven&apos;t listed anything yet</p>
            <p className="text-sm text-muted">
              Share your space and start earning — it only takes a few minutes.
            </p>
            <Link
              href="/host/listings/new"
              className="mt-1 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-black"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <HostListingCard
                key={l.id}
                listing={{
                  id: l.id,
                  title: l.title,
                  city: l.city,
                  country: l.country,
                  price: l.price,
                  image: parseJsonArray(l.images)[0] ?? "",
                  rating: avgRating(l.reviews),
                  reviewCount: l.reviews.length,
                  bookingCount: l.bookings.filter((b) => b.status === "confirmed")
                    .length,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 transition hover:shadow-md">
      <span className={`inline-grid h-10 w-10 place-items-center rounded-xl ${tint}`}>
        {icon}
      </span>
      <p className="mt-3 text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
    </div>
  );
}
