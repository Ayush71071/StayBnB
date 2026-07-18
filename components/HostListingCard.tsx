"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/utils";

type HostListing = {
  id: string;
  title: string;
  city: string;
  country: string;
  price: number;
  image: string;
  rating: number | null;
  reviewCount: number;
  bookingCount: number;
};

export default function HostListingCard({ listing }: { listing: HostListing }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (
      !confirm(
        `Delete "${listing.title}"? All its bookings and reviews will be removed too.`
      )
    )
      return;
    setBusy(true);
    const res = await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not delete listing.");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 transition hover:shadow-md">
      <div className="relative aspect-[16/10] bg-gray-100">
        {listing.image && (
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
        {listing.rating !== null && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold shadow">
            <Star size={11} className="fill-current" />
            {listing.rating.toFixed(2)} ({listing.reviewCount})
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="truncate font-bold">{listing.title}</p>
        <p className="text-sm text-muted">
          {listing.city}, {listing.country}
        </p>
        <p className="mt-1.5 text-sm">
          <span className="font-bold">{formatMoney(listing.price)}</span>{" "}
          <span className="text-muted">night</span>
          <span className="text-muted">
            {" "}
            · {listing.bookingCount} booking{listing.bookingCount === 1 ? "" : "s"}
          </span>
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            href={`/listings/${listing.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-300 py-2 text-xs font-bold transition hover:border-ink"
          >
            <ExternalLink size={12} /> View
          </Link>
          <button
            onClick={remove}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
