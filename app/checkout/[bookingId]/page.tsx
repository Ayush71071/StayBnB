import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Star } from "lucide-react";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import {
  avgRating,
  formatDateShort,
  formatMoney,
  parseJsonArray,
  priceBreakdown,
} from "@/lib/utils";
import PaymentForm from "@/components/PaymentForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const userId = await getSessionUserId();
  if (!userId) redirect(`/login?next=/checkout/${bookingId}`);

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { include: { reviews: { select: { rating: true } } } },
    },
  });

  if (!booking || booking.userId !== userId) notFound();
  if (booking.status === "confirmed") redirect("/trips?booked=1");
  if (booking.status === "cancelled") redirect("/trips");

  const listing = booking.listing;
  const rating = avgRating(listing.reviews);
  const breakdown = priceBreakdown(listing.price, booking.nights);
  const image = parseJsonArray(listing.images)[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/listings/${listing.id}`}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100"
          aria-label="Back to listing"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Confirm and pay
        </h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        {/* Left: trip + payment */}
        <div>
          <section className="border-b border-gray-200 pb-6">
            <h2 className="mb-4 text-lg font-bold">Your trip</h2>
            <dl className="space-y-3 text-[15px]">
              <div className="flex justify-between">
                <dt className="font-semibold">Dates</dt>
                <dd className="text-gray-700">
                  {formatDateShort(booking.checkIn)} –{" "}
                  {formatDateShort(booking.checkOut)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Guests</dt>
                <dd className="text-gray-700">
                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="pt-6">
            <h2 className="mb-4 text-lg font-bold">Pay with</h2>
            <PaymentForm bookingId={booking.id} total={booking.totalPrice} />
          </section>
        </div>

        {/* Right: summary */}
        <aside className="order-first lg:order-none">
          <div className="rounded-2xl border border-gray-200 p-6 lg:sticky lg:top-28">
            <div className="flex gap-4 border-b border-gray-200 pb-5">
              {image && (
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl">
                  <Image src={image} alt={listing.title} fill sizes="112px" className="object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-muted">{listing.category}</p>
                <p className="truncate text-sm font-semibold">{listing.title}</p>
                <p className="text-xs text-muted">
                  {listing.city}, {listing.country}
                </p>
                {rating !== null && (
                  <p className="mt-1 flex items-center gap-1 text-xs">
                    <Star size={11} className="fill-current" />
                    <span className="font-semibold">{rating.toFixed(2)}</span>
                    <span className="text-muted">
                      ({listing.reviews.length} reviews)
                    </span>
                  </p>
                )}
              </div>
            </div>

            <h3 className="pt-5 text-lg font-bold">Price details</h3>
            <div className="mt-3 space-y-2.5 text-[15px] text-gray-700">
              <div className="flex justify-between">
                <span>
                  {formatMoney(listing.price)} × {booking.nights} nights
                </span>
                <span>{formatMoney(breakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleaning fee</span>
                <span>{formatMoney(breakdown.cleaningFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>StayBnB service fee</span>
                <span>{formatMoney(breakdown.serviceFee)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-ink">
                <span>Total (USD)</span>
                <span>{formatMoney(booking.totalPrice)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
