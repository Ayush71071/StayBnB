"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full animate-pulse place-items-center rounded-2xl bg-gray-100 text-sm text-muted">
      Loading map…
    </div>
  ),
});

export default function ListingMap(props: {
  lat: number;
  lng: number;
  zoom?: number;
  popupText?: string;
  onPick?: (lat: number, lng: number) => void;
}) {
  return <MapView {...props} />;
}
