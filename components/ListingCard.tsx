import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import WishlistHeart from "./WishlistHeart";

export type ListingCardData = {
  id: string;
  title: string;
  city: string;
  country: string;
  price: number;
  image: string;
  rating: number | null;
  reviewCount: number;
};

export default function ListingCard({
  listing,
  index = 0,
}: {
  listing: ListingCardData;
  index?: number;
}) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group fade-up block"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <div className="relative aspect-[20/19] overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <WishlistHeart />
      </div>
      <div className="mt-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[15px] font-semibold">
            {listing.city}, {listing.country}
          </p>
          {listing.rating !== null && (
            <span className="flex shrink-0 items-center gap-1 text-sm">
              <Star size={13} className="fill-current" />
              {listing.rating.toFixed(2)}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-muted">{listing.title}</p>
        <p className="mt-1 text-[15px]">
          <span className="font-bold">{formatMoney(listing.price)}</span>{" "}
          <span className="text-muted">night</span>
        </p>
      </div>
    </Link>
  );
}
