import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { avgRating, parseJsonArray } from "@/lib/utils";
import CategoryBar from "@/components/CategoryBar";
import ListingCard from "@/components/ListingCard";
import { SearchX, ShieldCheck, BadgePercent, KeyRound } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  category?: string;
  guests?: string;
  checkIn?: string;
  checkOut?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/");

  const sp = await searchParams;
  const listings = await db.listing.findMany({
    include: {
      reviews: { select: { rating: true } },
      bookings: {
        where: { status: { in: ["pending", "confirmed"] } },
        select: { checkIn: true, checkOut: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const q = sp.q?.trim().toLowerCase();
  const guests = sp.guests ? parseInt(sp.guests) : null;
  const checkIn = sp.checkIn ? new Date(sp.checkIn) : null;
  const checkOut = sp.checkOut ? new Date(sp.checkOut) : null;

  const filtered = listings.filter((l) => {
    if (sp.category && l.category !== sp.category) return false;
    if (q) {
      const hay = `${l.title} ${l.city} ${l.country}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (guests && l.guests < guests) return false;
    if (checkIn && checkOut && checkOut > checkIn) {
      const clash = l.bookings.some(
        (b) => b.checkIn < checkOut && b.checkOut > checkIn
      );
      if (clash) return false;
    }
    return true;
  });

  const hasFilters = !!(sp.q || sp.category || sp.guests || sp.checkIn);

  return (
    <div>
      {/* Hero */}
      {!hasFilters && (
        <section className="border-b border-gray-100 bg-gradient-to-b from-rose-50/80 via-rose-50/30 to-white">
          <div className="mx-auto max-w-screen-2xl px-4 pb-10 pt-12 text-center sm:px-6 lg:px-10">
            <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Find a place you&apos;ll{" "}
              <span className="bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
                love to stay
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Villas on the caldera, cabins in the pines, treehouses in the
              jungle — book unique homes from hosts around the world.
            </p>
            <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-brand" /> Verified hosts
              </span>
              <span className="flex items-center gap-2">
                <BadgePercent size={17} className="text-brand" /> No hidden fees
              </span>
              <span className="flex items-center gap-2">
                <KeyRound size={17} className="text-brand" /> Instant booking
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <div className="sticky top-20 z-30 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <Suspense>
            <CategoryBar />
          </Suspense>
        </div>
      </div>

      {/* Grid */}
      <section id="stays" className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
        {hasFilters && (
          <p className="mb-5 text-sm text-muted">
            <span className="font-bold text-ink">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "stay" : "stays"} found
            {sp.q ? (
              <>
                {" "}
                for “<span className="font-semibold text-ink">{sp.q}</span>”
              </>
            ) : null}{" "}
            ·{" "}
            <Link href="/" className="font-semibold text-ink underline">
              Clear filters
            </Link>
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <SearchX size={40} className="text-gray-300" />
            <h2 className="text-xl font-bold">No exact matches</h2>
            <p className="max-w-sm text-sm text-muted">
              Try changing your dates, removing filters, or searching a
              different destination.
            </p>
            <Link
              href="/"
              className="mt-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Show all stays
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((l, i) => (
              <ListingCard
                key={l.id}
                index={i}
                listing={{
                  id: l.id,
                  title: l.title,
                  city: l.city,
                  country: l.country,
                  price: l.price,
                  image: parseJsonArray(l.images)[0] ?? "",
                  rating: avgRating(l.reviews),
                  reviewCount: l.reviews.length,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
