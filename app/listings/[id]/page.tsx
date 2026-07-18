import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, MapPin, Award, Users, BedDouble, Bed, Bath } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { activeBookingFilter, avgRating, parseJsonArray, formatDate } from "@/lib/utils";
import Gallery from "@/components/Gallery";
import AmenityIcon from "@/components/AmenityIcon";
import BookingWidget from "@/components/BookingWidget";
import ListingMap from "@/components/ListingMap";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, user] = await Promise.all([
    db.listing.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, name: true, avatar: true, createdAt: true } },
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
        },
        bookings: {
          where: {
            checkOut: { gte: new Date() },
            ...activeBookingFilter(),
          },
          select: { checkIn: true, checkOut: true },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!listing) notFound();

  const images = parseJsonArray(listing.images);
  const amenities = parseJsonArray(listing.amenities);
  const rating = avgRating(listing.reviews);
  const hostYears = Math.max(
    1,
    new Date().getFullYear() - listing.host.createdAt.getFullYear()
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
      {/* Title */}
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-[27px]">
        {listing.title}
      </h1>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {rating !== null && (
          <span className="flex items-center gap-1 font-semibold">
            <Star size={14} className="fill-current" /> {rating.toFixed(2)}
            <span className="font-normal text-muted">
              · {listing.reviews.length} reviews
            </span>
          </span>
        )}
        <span className="flex items-center gap-1 font-semibold underline">
          <MapPin size={14} />
          {listing.city}, {listing.country}
        </span>
      </div>

      {/* Gallery */}
      <div className="mt-5">
        <Gallery images={images} title={listing.title} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {/* Host row */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-xl font-bold">
                {listing.category} hosted by {listing.host.name}
              </h2>
              <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <Users size={14} /> {listing.guests} guests
                </span>
                <span className="flex items-center gap-1">
                  <BedDouble size={14} /> {listing.bedrooms} bedrooms
                </span>
                <span className="flex items-center gap-1">
                  <Bed size={14} /> {listing.beds} beds
                </span>
                <span className="flex items-center gap-1">
                  <Bath size={14} /> {listing.baths} baths
                </span>
              </p>
            </div>
            {listing.host.avatar && (
              <Image
                src={listing.host.avatar}
                alt={listing.host.name}
                width={52}
                height={52}
                className="rounded-full"
              />
            )}
          </div>

          {/* Superhost badge */}
          <div className="flex items-center gap-4 border-b border-gray-200 py-6">
            <Award size={28} className="shrink-0 text-brand" />
            <div>
              <p className="font-bold">{listing.host.name} is a Superhost</p>
              <p className="text-sm text-muted">
                Superhosts are experienced, highly rated hosts. Hosting for{" "}
                {hostYears}+ {hostYears === 1 ? "year" : "years"}.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="border-b border-gray-200 py-6">
            <p className="whitespace-pre-line leading-7 text-gray-700">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="border-b border-gray-200 py-6">
            <h2 className="mb-4 text-xl font-bold">What this place offers</h2>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {amenities.map((a) => (
                <li key={a} className="flex items-center gap-3.5 text-gray-700">
                  <AmenityIcon name={a} />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Map */}
          <div className="border-b border-gray-200 py-6">
            <h2 className="mb-1 text-xl font-bold">Where you&apos;ll be</h2>
            <p className="mb-4 text-sm text-muted">
              {listing.city}, {listing.country}
            </p>
            <div className="h-[380px] overflow-hidden rounded-2xl">
              <ListingMap
                lat={listing.lat}
                lng={listing.lng}
                popupText={listing.title}
              />
            </div>
          </div>

          {/* Reviews */}
          <div className="py-6" id="reviews">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold">
              <Star size={19} className="fill-current" />
              {rating !== null ? rating.toFixed(2) : "New"} ·{" "}
              {listing.reviews.length} reviews
            </h2>
            {listing.reviews.length === 0 ? (
              <p className="text-sm text-muted">
                No reviews yet — be the first to stay here.
              </p>
            ) : (
              <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {listing.reviews.map((r) => (
                  <div key={r.id}>
                    <div className="flex items-center gap-3">
                      {r.user.avatar ? (
                        <Image
                          src={r.user.avatar}
                          alt={r.user.name}
                          width={42}
                          height={42}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="grid h-[42px] w-[42px] place-items-center rounded-full bg-gray-200 font-bold">
                          {r.user.name[0]}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-bold">{r.user.name}</p>
                        <p className="text-xs text-muted">
                          {formatDate(r.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < r.rating
                              ? "fill-current text-ink"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-[15px] leading-6 text-gray-700">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking widget */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <BookingWidget
            listingId={listing.id}
            price={listing.price}
            maxGuests={listing.guests}
            rating={rating}
            reviewCount={listing.reviews.length}
            isLoggedIn={!!user}
            bookedRanges={listing.bookings.map((b) => ({
              from: b.checkIn.toISOString(),
              to: b.checkOut.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
