"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Loader2 } from "lucide-react";
import { formatDateShort, formatMoney } from "@/lib/utils";

type Trip = {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  hasReview: boolean;
  listing: {
    id: string;
    title: string;
    city: string;
    country: string;
    image: string;
  };
};

export default function TripCard({
  trip,
  kind,
}: {
  trip: Trip;
  kind: "upcoming" | "past" | "cancelled";
}) {
  const router = useRouter();
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    if (!confirm("Cancel this trip? This can't be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/bookings/${trip.id}`, { method: "PATCH" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not cancel.");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: trip.id, rating, comment }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not submit review.");
      setBusy(false);
      return;
    }
    setShowReview(false);
    router.refresh();
  }

  const badge =
    trip.status === "confirmed"
      ? kind === "past"
        ? ["bg-gray-100 text-gray-600", "Completed"]
        : ["bg-green-100 text-green-700", "Confirmed"]
      : trip.status === "pending"
        ? ["bg-amber-100 text-amber-700", "Payment pending"]
        : ["bg-gray-200 text-gray-600", "Cancelled"];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 transition hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/listings/${trip.listing.id}`}
          className="relative h-44 w-full shrink-0 sm:h-auto sm:w-56"
        >
          {trip.listing.image && (
            <Image
              src={trip.listing.image}
              alt={trip.listing.title}
              fill
              sizes="(max-width: 640px) 100vw, 224px"
              className="object-cover"
            />
          )}
        </Link>
        <div className="flex flex-1 flex-col gap-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                href={`/listings/${trip.listing.id}`}
                className="font-bold hover:underline"
              >
                {trip.listing.title}
              </Link>
              <p className="text-sm text-muted">
                {trip.listing.city}, {trip.listing.country}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${badge[0]}`}
            >
              {badge[1]}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-700">
            {formatDateShort(trip.checkIn)} – {formatDateShort(trip.checkOut)} ·{" "}
            {trip.guests} {trip.guests === 1 ? "guest" : "guests"} ·{" "}
            <span className="font-semibold">{formatMoney(trip.totalPrice)}</span>
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
            {kind === "upcoming" && trip.status === "pending" && (
              <Link
                href={`/checkout/${trip.id}`}
                className="rounded-full bg-gradient-to-r from-brand to-brand-dark px-4 py-2 text-xs font-bold text-white"
              >
                Complete payment
              </Link>
            )}
            {kind === "upcoming" && (
              <button
                onClick={cancel}
                disabled={busy}
                className="rounded-full border border-gray-300 px-4 py-2 text-xs font-bold hover:border-ink disabled:opacity-50"
              >
                Cancel trip
              </button>
            )}
            {kind === "past" && !trip.hasReview && (
              <button
                onClick={() => setShowReview((v) => !v)}
                className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-black"
              >
                <Star size={12} className="fill-current" /> Leave a review
              </button>
            )}
            {kind === "past" && trip.hasReview && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                <Star size={12} className="fill-current" /> Review submitted —
                thank you!
              </span>
            )}
            {error && (
              <span className="text-xs font-semibold text-brand-dark">{error}</span>
            )}
          </div>

          {showReview && (
            <form
              onSubmit={submitReview}
              className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <p className="text-sm font-bold">How was your stay?</p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    aria-label={`${n} stars`}
                  >
                    <Star
                      size={24}
                      className={
                        n <= (hover || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                placeholder="Share what you loved (or didn't)…"
                className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-dark px-5 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {busy && <Loader2 size={12} className="animate-spin" />}
                  Submit review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReview(false)}
                  className="rounded-full px-4 py-2 text-xs font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
