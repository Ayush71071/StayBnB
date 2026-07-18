"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

const pin = divIcon({
  className: "staybnb-pin",
  html: `<svg width="38" height="38" viewBox="0 0 24 24" fill="#ff385c" stroke="white" stroke-width="1.2" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,.35))"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.3 6.4 11.2 7.3 12a1 1 0 0 0 1.4 0C13.6 21.2 20 15.3 20 10c0-4.4-3.6-8-8-8z"/><circle cx="12" cy="10" r="3.2" fill="white" stroke="none"/></svg>`,
  iconSize: [38, 38],
  iconAnchor: [19, 36],
  popupAnchor: [0, -34],
});

function ClickCatcher({ onPick }: { onPick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView({
  lat,
  lng,
  zoom = 12,
  popupText,
  onPick,
  height = "100%",
}: {
  lat: number;
  lng: number;
  zoom?: number;
  popupText?: string;
  onPick?: (lat: number, lng: number) => void;
  height?: string;
}) {
  return (
    <MapContainer
      key={`${lat.toFixed(3)}-${lng.toFixed(3)}`}
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={pin}>
        {popupText && <Popup>{popupText}</Popup>}
      </Marker>
      {onPick && <ClickCatcher onPick={onPick} />}
    </MapContainer>
  );
}
