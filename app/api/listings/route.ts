import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    title,
    description,
    category,
    city,
    country,
    lat,
    lng,
    price,
    guests,
    bedrooms,
    beds,
    baths,
    amenities,
    images,
  } = body;

  if (!title?.trim() || !description?.trim() || !category || !city?.trim() || !country?.trim()) {
    return NextResponse.json(
      { error: "Title, description, category and location are required." },
      { status: 400 }
    );
  }
  const priceNum = parseInt(price);
  if (!priceNum || priceNum < 1) {
    return NextResponse.json({ error: "Enter a nightly price." }, { status: 400 });
  }
  const imgList = Array.isArray(images)
    ? images.filter((u: string) => typeof u === "string" && u.startsWith("http"))
    : [];
  if (imgList.length === 0) {
    return NextResponse.json(
      { error: "Add at least one image URL." },
      { status: 400 }
    );
  }
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) {
    return NextResponse.json(
      { error: "Pick the location on the map." },
      { status: 400 }
    );
  }

  const listing = await db.listing.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      category,
      city: city.trim(),
      country: country.trim(),
      lat: latNum,
      lng: lngNum,
      price: priceNum,
      guests: Math.max(1, parseInt(guests) || 1),
      bedrooms: Math.max(0, parseInt(bedrooms) || 1),
      beds: Math.max(1, parseInt(beds) || 1),
      baths: Math.max(1, parseInt(baths) || 1),
      amenities: JSON.stringify(
        Array.isArray(amenities) ? amenities.filter(Boolean) : []
      ),
      images: JSON.stringify(imgList),
      hostId: userId,
    },
  });

  return NextResponse.json({ id: listing.id });
}
