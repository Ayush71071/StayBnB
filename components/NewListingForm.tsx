"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wand2, Minus, Plus } from "lucide-react";
import ListingMap from "./ListingMap";

const CATEGORIES = [
  "Amazing views",
  "Cabins",
  "Beachfront",
  "Design",
  "Tropical",
  "Skiing",
  "Treehouses",
  "City",
  "OMG!",
  "Lakefront",
  "Countryside",
];

const AMENITY_OPTIONS = [
  "Wifi",
  "Kitchen",
  "Free parking",
  "Air conditioning",
  "Heating",
  "Washer",
  "TV",
  "Pool",
  "Hot tub",
  "Fireplace",
  "Workspace",
  "BBQ grill",
  "Gym",
  "Breakfast included",
];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
];

export default function NewListingForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    city: "",
    country: "",
    price: 150,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
  });
  const [amenities, setAmenities] = useState<string[]>(["Wifi", "Kitchen"]);
  const [imagesText, setImagesText] = useState("");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAmenity(a: string) {
    setAmenities((list) =>
      list.includes(a) ? list.filter((x) => x !== a) : [...list, a]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pin) {
      setError("Click the map to drop a pin on your location.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: pin.lat,
          lng: pin.lng,
          amenities,
          images: imagesText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create listing.");
      router.push("/host");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create listing.");
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-ink";

  return (
    <form onSubmit={submit} className="space-y-8">
      <Section title="The basics">
        <div>
          <Label>Listing title</Label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            placeholder="Cosy cabin with lake views"
            className={input}
          />
        </div>
        <div>
          <Label>Description</Label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            required
            rows={4}
            placeholder="What makes your place special?"
            className={input}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Category</Label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={input}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Price per night (USD)</Label>
            <input
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => set("price", parseInt(e.target.value) || 0)}
              required
              className={input}
            />
          </div>
        </div>
      </Section>

      <Section title="Capacity">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              ["guests", "Guests"],
              ["bedrooms", "Bedrooms"],
              ["beds", "Beds"],
              ["baths", "Baths"],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className="rounded-xl border border-gray-300 px-3 py-2.5 text-center"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                {label}
              </p>
              <div className="mt-1 flex items-center justify-center gap-3">
                <Stepper onClick={() => set(key, Math.max(key === "bedrooms" ? 0 : 1, form[key] - 1))}>
                  <Minus size={13} />
                </Stepper>
                <span className="w-6 text-lg font-extrabold">{form[key]}</span>
                <Stepper onClick={() => set(key, Math.min(30, form[key] + 1))}>
                  <Plus size={13} />
                </Stepper>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>City</Label>
            <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              required
              placeholder="Lisbon"
              className={input}
            />
          </div>
          <div>
            <Label>Country</Label>
            <input
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              required
              placeholder="Portugal"
              className={input}
            />
          </div>
        </div>
        <div>
          <Label>
            Drop a pin{" "}
            <span className="font-normal text-muted">
              — click the map where your place is
            </span>
          </Label>
          <div className="h-72 overflow-hidden rounded-2xl border border-gray-200">
            <ListingMap
              lat={pin?.lat ?? 20}
              lng={pin?.lng ?? 0}
              zoom={pin ? 10 : 2}
              onPick={(lat, lng) => setPin({ lat, lng })}
            />
          </div>
          {pin && (
            <p className="mt-1.5 text-xs text-muted">
              Pinned at {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
            </p>
          )}
        </div>
      </Section>

      <Section title="Amenities">
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                amenities.includes(a)
                  ? "border-ink bg-ink text-white"
                  : "border-gray-300 hover:border-ink"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Photos">
        <div>
          <div className="flex items-center justify-between">
            <Label>Image URLs (one per line)</Label>
            <button
              type="button"
              onClick={() => setImagesText(SAMPLE_IMAGES.join("\n"))}
              className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-brand-dark transition hover:bg-rose-100"
            >
              <Wand2 size={12} /> Use sample photos
            </button>
          </div>
          <textarea
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            rows={5}
            placeholder={"https://…/photo1.jpg\nhttps://…/photo2.jpg"}
            className={`${input} mt-1 font-mono text-xs`}
          />
        </div>
      </Section>

      {error && <p className="text-sm font-semibold text-brand-dark">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark py-4 text-base font-bold text-white transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        Publish listing
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-gray-200 p-6">
      <legend className="px-2 text-sm font-extrabold uppercase tracking-wide text-muted">
        {title}
      </legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-semibold">{children}</label>;
}

function Stepper({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-full border border-gray-300 transition hover:border-ink"
    >
      {children}
    </button>
  );
}
