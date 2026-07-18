import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const INTERIORS = [
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600566753190-17f0baa2a6c3",
  "photo-1522708323590-d24dbb6b0267",
  "photo-1524758631624-e2822e304c36",
  "photo-1595526114035-0d45ed16cfbf",
  "photo-1560185007-cde436f6a4d0",
  "photo-1540518614846-7eded433c457",
  "photo-1598928506311-c55ded91a20c",
  "photo-1586023492125-27b2c045efd7",
  "photo-1615874959474-d609969a20ed",
  "photo-1616594039964-ae9021a400a0",
  "photo-1616486338812-3dadae4b4ace",
  "photo-1556228453-efd6c1ff04f6",
  "photo-1554995207-c18c203602cb",
  "photo-1584622650111-993a426fbf0a",
  "photo-1512918728675-ed5a9ecdebfd",
];

// deterministic-ish picker so every listing gets 4 varied interiors
function interiorSet(offset) {
  const out = [];
  for (let i = 0; i < 4; i++) out.push(img(INTERIORS[(offset * 3 + i * 2) % INTERIORS.length]));
  return out;
}

const LISTINGS = [
  {
    title: "Cliffside Villa with Infinity Pool",
    category: "Amazing views",
    city: "Oia, Santorini",
    country: "Greece",
    lat: 36.4618, lng: 25.3753,
    price: 420, guests: 6, bedrooms: 3, beds: 4, baths: 3,
    cover: "photo-1544984243-ec57ea16fe25",
    description:
      "Perched on the caldera cliffs of Oia, this whitewashed villa offers uninterrupted views of the Aegean Sea and Santorini's world-famous sunsets. Dive into the private infinity pool, sip local wine on the terrace, and fall asleep to the sound of the sea. A 5-minute walk brings you to Oia's boutiques and tavernas.",
    amenities: ["Infinity pool", "Sea view", "Wifi", "Kitchen", "Air conditioning", "Free parking", "Breakfast included", "Washer"],
  },
  {
    title: "Modern A-Frame Cabin in the Pines",
    category: "Cabins",
    city: "Lake Tahoe, California",
    country: "United States",
    lat: 39.0968, lng: -120.0324,
    price: 245, guests: 4, bedrooms: 2, beds: 3, baths: 2,
    cover: "photo-1518780664697-55e3ad937233",
    description:
      "A striking A-frame tucked into the pines, minutes from the lake and ski slopes. Floor-to-ceiling windows flood the living space with light, and the wood-burning fireplace makes snowy evenings unforgettable. Hot tub on the deck, board games inside, s'mores kit provided.",
    amenities: ["Hot tub", "Fireplace", "Wifi", "Kitchen", "Mountain view", "Free parking", "Heating", "BBQ grill"],
  },
  {
    title: "Sunset Beach House on the Sand",
    category: "Beachfront",
    city: "Malibu, California",
    country: "United States",
    lat: 34.0259, lng: -118.7798,
    price: 590, guests: 8, bedrooms: 4, beds: 5, baths: 3,
    cover: "photo-1499793983690-e29da59ef1c2",
    description:
      "Step straight from the deck onto the sand at this classic Malibu beach house. Wake to the sound of waves, surf world-class breaks out front, and end the day with a bonfire under the stars. The open-plan living room frames the Pacific like a painting.",
    amenities: ["Beachfront", "Ocean view", "Wifi", "Kitchen", "Deck", "Free parking", "Washer", "Surfboards included"],
  },
  {
    title: "Design Loft in the Historic Centre",
    category: "Design",
    city: "Barcelona",
    country: "Spain",
    lat: 41.3851, lng: 2.1734,
    price: 175, guests: 4, bedrooms: 2, beds: 2, baths: 2,
    cover: "photo-1493809842364-78817add7ffb",
    description:
      "An architect-renovated loft in the Gothic Quarter blending original stone walls with contemporary Spanish design. Soaring ceilings, curated art, and a juliet balcony over a quiet plaza. La Rambla, tapas bars, and the beach are all walkable.",
    amenities: ["Wifi", "Kitchen", "Air conditioning", "Washer", "Elevator", "City view", "Workspace", "Coffee machine"],
  },
  {
    title: "Overwater Bungalow Retreat",
    category: "Tropical",
    city: "Bora Bora",
    country: "French Polynesia",
    lat: -16.5004, lng: -151.7415,
    price: 780, guests: 2, bedrooms: 1, beds: 1, baths: 1,
    cover: "photo-1520250497591-112f2f40a3f4",
    description:
      "Your private bungalow stands on stilts above a turquoise lagoon. Snorkel from your deck, watch rays glide beneath the glass floor panel, and let breakfast arrive by canoe. Pure honeymoon magic in the heart of the South Pacific.",
    amenities: ["Overwater deck", "Lagoon access", "Glass floor", "Breakfast included", "Wifi", "Air conditioning", "Snorkel gear", "Kayaks"],
  },
  {
    title: "Cosy Alpine Chalet with Sauna",
    category: "Skiing",
    city: "Zermatt",
    country: "Switzerland",
    lat: 46.0207, lng: 7.7491,
    price: 385, guests: 6, bedrooms: 3, beds: 4, baths: 2,
    cover: "photo-1506905925346-21bda4d32df4",
    description:
      "A timber chalet with a postcard view of the Matterhorn. Ski-in access in winter, alpine hiking in summer, and a private sauna to soothe tired legs year-round. The fireplace lounge and fondue set make evenings as memorable as the slopes.",
    amenities: ["Sauna", "Matterhorn view", "Ski-in/ski-out", "Fireplace", "Wifi", "Kitchen", "Heating", "Boot warmers"],
  },
  {
    title: "Serene Machiya Townhouse",
    category: "Design",
    city: "Kyoto",
    country: "Japan",
    lat: 35.0116, lng: 135.7681,
    price: 210, guests: 4, bedrooms: 2, beds: 2, baths: 1,
    cover: "photo-1554995207-c18c203602cb",
    description:
      "A lovingly restored 100-year-old machiya with tatami rooms, a private moss garden, and a cypress soaking tub. Sleep on premium futons, take tea in the garden room, and wander to Gion's lantern-lit lanes in ten minutes.",
    amenities: ["Garden", "Soaking tub", "Wifi", "Kitchen", "Air conditioning", "Tea set", "Washer", "Bicycles"],
  },
  {
    title: "Treehouse Hideaway in the Canopy",
    category: "Treehouses",
    city: "Ubud, Bali",
    country: "Indonesia",
    lat: -8.5069, lng: 115.2625,
    price: 145, guests: 2, bedrooms: 1, beds: 1, baths: 1,
    cover: "photo-1587061949409-02df41d5e562",
    description:
      "A bamboo treehouse suspended in the jungle canopy above a river valley. Fall asleep to cicadas, wake to birdsong, and shower under the open sky. Daily yoga on the river deck and a five-minute scooter ride to Ubud's cafés.",
    amenities: ["Jungle view", "Outdoor shower", "Breakfast included", "Wifi", "Yoga deck", "River access", "Fan", "Mosquito nets"],
  },
  {
    title: "Georgian Townhouse near Hyde Park",
    category: "City",
    city: "London",
    country: "United Kingdom",
    lat: 51.5074, lng: -0.1657,
    price: 320, guests: 6, bedrooms: 3, beds: 3, baths: 2,
    cover: "photo-1523217582562-09d0def993a6",
    description:
      "An elegant Georgian townhouse on a leafy Notting Hill street. Period features meet modern comfort: marble bathrooms, a chef's kitchen, and a private patio garden. Portobello Market and Hyde Park are both a short stroll away.",
    amenities: ["Patio garden", "Wifi", "Chef's kitchen", "Washer", "Dryer", "Heating", "Workspace", "Crib available"],
  },
  {
    title: "Desert Dome under the Stars",
    category: "OMG!",
    city: "Joshua Tree, California",
    country: "United States",
    lat: 34.1347, lng: -116.3131,
    price: 190, guests: 2, bedrooms: 1, beds: 1, baths: 1,
    cover: "photo-1512917774080-9991f1c4c750",
    description:
      "A geodesic dome in the high desert with a skylight over the bed for stargazing. Cowboy pool, fire pit, and hammocks outside; record player and telescope inside. Ten minutes from the national park entrance.",
    amenities: ["Stargazing skylight", "Fire pit", "Cowboy pool", "Wifi", "Kitchen", "Air conditioning", "Telescope", "Free parking"],
  },
  {
    title: "Lakefront Cottage with Private Dock",
    category: "Lakefront",
    city: "Queenstown",
    country: "New Zealand",
    lat: -45.0312, lng: 168.6626,
    price: 265, guests: 5, bedrooms: 2, beds: 3, baths: 2,
    cover: "photo-1470770841072-f978cf4d019e",
    description:
      "A timber cottage on the shore of Lake Wakatipu with its own jetty and rowboat. Mountains rise straight from the water in every direction. Fish from the dock, barbecue on the lawn, and stargaze from the outdoor bath.",
    amenities: ["Private dock", "Rowboat", "Lake view", "Outdoor bath", "Wifi", "Kitchen", "Fireplace", "BBQ grill"],
  },
  {
    title: "Rooftop Riad in the Medina",
    category: "OMG!",
    city: "Marrakesh",
    country: "Morocco",
    lat: 31.6295, lng: -7.9811,
    price: 130, guests: 6, bedrooms: 3, beds: 4, baths: 3,
    cover: "photo-1583608205776-bfd35f0d9f83",
    description:
      "A traditional riad wrapped around a courtyard plunge pool, hidden behind an unassuming medina door. Hand-cut zellige tiles, carved cedar, and a rooftop terrace with Atlas Mountain views. Breakfast of msemen and mint tea included.",
    amenities: ["Plunge pool", "Rooftop terrace", "Breakfast included", "Wifi", "Air conditioning", "Courtyard", "Hammam nearby", "Airport transfer"],
  },
  {
    title: "Scandi Farmhouse in the Fjords",
    category: "Countryside",
    city: "Flåm",
    country: "Norway",
    lat: 60.8622, lng: 7.1129,
    price: 220, guests: 6, bedrooms: 3, beds: 4, baths: 2,
    cover: "photo-1449158743715-0a90ebb6d2d8",
    description:
      "A red-timber farmhouse at the head of Aurlandsfjord, surrounded by waterfalls and sheep pasture. Hike from the door, kayak the fjord, and chase the northern lights in winter. Wood-fired hot tub included.",
    amenities: ["Wood-fired hot tub", "Fjord view", "Wifi", "Kitchen", "Fireplace", "Free parking", "Kayaks", "Washer"],
  },
  {
    title: "Skyline Penthouse with Private Terrace",
    category: "City",
    city: "New York",
    country: "United States",
    lat: 40.7484, lng: -73.9857,
    price: 450, guests: 4, bedrooms: 2, beds: 2, baths: 2,
    cover: "photo-1522708323590-d24dbb6b0267",
    description:
      "A sun-drenched penthouse in NoMad with a wraparound terrace facing the Empire State Building. Floor-to-ceiling glass, a marble kitchen, and a soaking tub with a skyline view. Doorman building with gym access.",
    amenities: ["Private terrace", "Skyline view", "Gym", "Doorman", "Wifi", "Kitchen", "Air conditioning", "Washer"],
  },
];

const REVIEW_POOL = [
  [5, "Absolutely magical stay. The photos don't do it justice — we're already planning our return trip!"],
  [5, "Immaculate, beautifully designed, and the host thought of everything. Best place we've ever booked."],
  [4, "Wonderful location and a really comfortable space. Check-in instructions could be a little clearer, but the host responded within minutes."],
  [5, "The view alone is worth every penny. Waking up here every morning felt unreal."],
  [5, "Spotlessly clean, stylish, and even better than the listing suggests. Highly recommend."],
  [4, "Great stay overall! The neighbourhood is fantastic and the bed is incredibly comfortable."],
  [5, "Our favourite trip ever. The host's local recommendations were spot on — don't skip them."],
  [5, "Perfect for our family. Tons of space, great kitchen, and the kids didn't want to leave."],
  [4, "Beautiful home in a perfect spot. Wifi was fast enough for a few work calls too."],
  [5, "10/10. Seamless check-in, gorgeous interiors, and the most helpful host we've encountered."],
];

async function main() {
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash("password123", 10);

  const host = await prisma.user.create({
    data: { name: "Sofia Laurent", email: "host@staybnb.com", password: pw, avatar: "https://i.pravatar.cc/150?img=47" },
  });
  const host2 = await prisma.user.create({
    data: { name: "Marco Ribeiro", email: "marco@staybnb.com", password: pw, avatar: "https://i.pravatar.cc/150?img=12" },
  });
  const guest = await prisma.user.create({
    data: { name: "Ayush Prabhavale", email: "guest@staybnb.com", password: pw, avatar: "https://i.pravatar.cc/150?img=68" },
  });
  const extraGuests = [];
  const guestNames = [
    ["Amelia Chen", 32], ["Noah Patel", 15], ["Lena Fischer", 45],
    ["Diego Alvarez", 53], ["Priya Sharma", 26], ["Tom Becker", 59],
  ];
  for (const [name, imgN] of guestNames) {
    extraGuests.push(
      await prisma.user.create({
        data: {
          name,
          email: `${name.split(" ")[0].toLowerCase()}@example.com`,
          password: pw,
          avatar: `https://i.pravatar.cc/150?img=${imgN}`,
        },
      })
    );
  }

  const listings = [];
  for (let i = 0; i < LISTINGS.length; i++) {
    const l = LISTINGS[i];
    const listing = await prisma.listing.create({
      data: {
        title: l.title,
        description: l.description,
        category: l.category,
        city: l.city,
        country: l.country,
        lat: l.lat,
        lng: l.lng,
        price: l.price,
        guests: l.guests,
        bedrooms: l.bedrooms,
        beds: l.beds,
        baths: l.baths,
        amenities: JSON.stringify(l.amenities),
        images: JSON.stringify([img(l.cover, 1600), ...interiorSet(i)]),
        hostId: i % 3 === 2 ? host2.id : host.id,
      },
    });
    listings.push(listing);
  }

  // Past bookings + reviews (so ratings feel real)
  let reviewIdx = 0;
  const now = new Date();
  for (const listing of listings) {
    const reviewers = [...extraGuests].slice(0, 3 + (listing.title.length % 3));
    let daysAgo = 30;
    for (const reviewer of reviewers) {
      const nights = 3 + (reviewIdx % 4);
      const checkOut = new Date(now.getTime() - daysAgo * 86400000);
      const checkIn = new Date(checkOut.getTime() - nights * 86400000);
      const booking = await prisma.booking.create({
        data: {
          listingId: listing.id,
          userId: reviewer.id,
          checkIn,
          checkOut,
          guests: 2,
          nights,
          totalPrice: nights * listing.price,
          status: "confirmed",
          paymentRef: `mock_${Math.random().toString(36).slice(2, 10)}`,
        },
      });
      const [rating, comment] = REVIEW_POOL[reviewIdx % REVIEW_POOL.length];
      await prisma.review.create({
        data: {
          listingId: listing.id,
          userId: reviewer.id,
          bookingId: booking.id,
          rating,
          comment,
          createdAt: checkOut,
        },
      });
      reviewIdx++;
      daysAgo += 25 + (reviewIdx % 20);
    }
  }

  // One upcoming trip + one past unreviewed trip for the demo guest
  const santorini = listings[0];
  const tahoe = listings[1];
  await prisma.booking.create({
    data: {
      listingId: santorini.id,
      userId: guest.id,
      checkIn: new Date(now.getTime() + 14 * 86400000),
      checkOut: new Date(now.getTime() + 19 * 86400000),
      guests: 2,
      nights: 5,
      totalPrice: 5 * santorini.price,
      status: "confirmed",
      paymentRef: "mock_upcoming1",
    },
  });
  await prisma.booking.create({
    data: {
      listingId: tahoe.id,
      userId: guest.id,
      checkIn: new Date(now.getTime() - 12 * 86400000),
      checkOut: new Date(now.getTime() - 9 * 86400000),
      guests: 3,
      nights: 3,
      totalPrice: 3 * tahoe.price,
      status: "confirmed",
      paymentRef: "mock_past1",
    },
  });

  console.log(`Seeded ${listings.length} listings, users, bookings and reviews.`);
  console.log("Demo accounts: host@staybnb.com / guest@staybnb.com (password: password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
