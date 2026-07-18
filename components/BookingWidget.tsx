"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { Star, Loader2 } from "lucide-react";
import { formatMoney, priceBreakdown, nightsBetween } from "@/lib/utils";

type Props = {
  listingId: string;
  price: number;
  maxGuests: number;
  rating: number | null;
  reviewCount: number;
  isLoggedIn: boolean;
  bookedRanges: { from: string; to: string }[];
};

export default function BookingWidget({
  listingId,
  price,
  maxGuests,
  rating,
  reviewCount,
  isLoggedIn,
  bookedRanges,
}: Props) {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [showCal, setShowCal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(
    () => [
      { before: new Date() },
      // Exclude the checkout day itself: the backend allows a new guest to
      // check in the same day a previous guest checks out (same-day
      // turnover), so the calendar shouldn't be stricter than that.
      ...bookedRanges.map((r) => ({
        from: new Date(r.from),
        to: new Date(new Date(r.to).getTime() - 86400000),
      })),
    ],
    [bookedRanges]
  );

  const nights =
    range?.from && range?.to ? nightsBetween(range.from, range.to) : 0;
  const breakdown = nights > 0 ? priceBreakdown(price, nights) : null;

  async function reserve() {
    if (!isLoggedIn) {
      router.push(`/login?next=/listings/${listingId}`);
      return;
    }
    if (!range?.from || !range?.to || nights < 1) {
      setShowCal(true);
      setError("Select your check-in and checkout dates first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          checkIn: range.from.toISOString(),
          checkOut: range.to.toISOString(),
          guests,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(`/checkout/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  const fmt = (d?: Date) =>
    d
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Add date";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.10)]">
      <div className="flex items-end justify-between">
        <p>
          <span className="text-2xl font-extrabold">{formatMoney(price)}</span>{" "}
          <span className="text-muted">night</span>
        </p>
        {rating !== null && (
          <span className="flex items-center gap-1 text-sm">
            <Star size={13} className="fill-current" />
            <span className="font-semibold">{rating.toFixed(2)}</span>
            <span className="text-muted">· {reviewCount} reviews</span>
          </span>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-300">
        <button
          onClick={() => setShowCal((v) => !v)}
          className="grid w-full grid-cols-2 divide-x divide-gray-300 text-left"
        >
          <span className="px-3.5 py-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wide">
              Check-in
            </span>
            <span className={`text-sm ${range?.from ? "" : "text-gray-400"}`}>
              {fmt(range?.from)}
            </span>
          </span>
          <span className="px-3.5 py-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wide">
              Checkout
            </span>
            <span className={`text-sm ${range?.to ? "" : "text-gray-400"}`}>
              {fmt(range?.to)}
            </span>
          </span>
        </button>
        <div className="border-t border-gray-300 px-3.5 py-2.5">
          <span className="block text-[10px] font-bold uppercase tracking-wide">
            Guests
          </span>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full bg-transparent text-sm outline-none"
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showCal && (
        <div className="mt-3 flex justify-center rounded-xl border border-gray-200 p-2">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(r) => {
              setRange(r);
              setError(null);
              if (r?.from && r?.to && r.from.getTime() !== r.to.getTime())
                setShowCal(false);
            }}
            disabled={disabled}
            numberOfMonths={1}
          />
        </div>
      )}

      <button
        onClick={reserve}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3.5 font-bold text-white transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
      >
        {loading && <Loader2 size={17} className="animate-spin" />}
        {isLoggedIn ? "Reserve" : "Log in to reserve"}
      </button>
      {error && <p className="mt-2 text-center text-sm text-brand-dark">{error}</p>}
      {!breakdown && !error && (
        <p className="mt-2 text-center text-xs text-muted">
          You won&apos;t be charged yet
        </p>
      )}

      {breakdown && (
        <div className="mt-4 space-y-2.5 text-[15px]">
          <Row
            label={`${formatMoney(price)} × ${nights} night${nights > 1 ? "s" : ""}`}
            value={formatMoney(breakdown.subtotal)}
          />
          <Row label="Cleaning fee" value={formatMoney(breakdown.cleaningFee)} />
          <Row label="StayBnB service fee" value={formatMoney(breakdown.serviceFee)} />
          <div className="flex justify-between border-t border-gray-200 pt-3 font-bold">
            <span>Total before taxes</span>
            <span>{formatMoney(breakdown.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-700">
      <span className="underline decoration-gray-300 underline-offset-2">{label}</span>
      <span>{value}</span>
    </div>
  );
}
