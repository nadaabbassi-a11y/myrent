"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// Import dynamique pour éviter les erreurs SSR avec Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Coordonnées pour les quartiers de Montréal
const getCoordinates = (city: string, area: string): [number, number] => {
  const coordinates: Record<string, [number, number]> = {
    "Plateau Mont-Royal": [45.5236, -73.5850],
    "Plateau": [45.5236, -73.5850],
    "Ville-Marie": [45.5017, -73.5673],
    "Rosemont": [45.5450, -73.6000],
    "Outremont": [45.5167, -73.6167],
    "Westmount": [45.4833, -73.6000],
    "Villeray": [45.5400, -73.6200],
    "Hochelaga-Maisonneuve": [45.5400, -73.5500],
    "Hochelaga": [45.5400, -73.5500],
    "Verdun": [45.4500, -73.5667],
    "Mile-End": [45.5267, -73.6000],
    "Griffintown": [45.4900, -73.5600],
    "Montréal": [45.5017, -73.5673],
  };
  
  return coordinates[area] || coordinates[city] || [45.5017, -73.5673];
};

interface ListingMapProps {
  city: string;
  area: string;
  title: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function ListingMap({ city, area, title, latitude, longitude }: ListingMapProps) {
  // Utiliser latitude/longitude si disponibles, sinon utiliser getCoordinates
  const coordinates: [number, number] = 
    (latitude != null && longitude != null) 
      ? [latitude, longitude]
      : getCoordinates(city, area);

  useEffect(() => {
    // Fix pour les icônes Leaflet avec Next.js
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    }
  }, []);

  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden border-2 border-gray-200" style={{ zIndex: 1 }}>
      <MapContainer
        center={coordinates}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates}>
          <Popup>
            <div className="text-center">
              <MapPin className="h-4 w-4 text-violet-600 mx-auto mb-1" />
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="text-sm text-gray-600">{area}, {city}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

