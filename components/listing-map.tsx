"use client";

import { useEffect, useState } from "react";
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

// Composant pour forcer le recalcul de la taille et le rechargement des tuiles
function MapResizer() {
  const { useMap } = require("react-leaflet");
  const map = useMap();
  
  useEffect(() => {
    // Forcer le recalcul plusieurs fois pour s'assurer que ça fonctionne
    const timers = [
      setTimeout(() => {
        map.invalidateSize();
        map.eachLayer((layer: any) => {
          if (layer.redraw) {
            layer.redraw();
          }
        });
      }, 100),
      setTimeout(() => {
        map.invalidateSize();
        map.eachLayer((layer: any) => {
          if (layer.redraw) {
            layer.redraw();
          }
        });
      }, 300),
      setTimeout(() => {
        map.invalidateSize();
        map.eachLayer((layer: any) => {
          if (layer.redraw) {
            layer.redraw();
          }
        });
      }, 500),
      setTimeout(() => {
        map.invalidateSize();
        map.eachLayer((layer: any) => {
          if (layer.redraw) {
            layer.redraw();
          }
        });
      }, 1000),
    ];
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [map]);
  
  return null;
}

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
  const [isReady, setIsReady] = useState(false);
  
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
      
      // Attendre que le DOM soit prêt avant d'afficher la carte
      setTimeout(() => {
        setIsReady(true);
      }, 200);
    }
  }, []);

  if (!isReady) {
    return (
      <div 
        id="listing-map-container"
        className="relative w-full rounded-2xl overflow-hidden border-2 border-neutral-200 bg-neutral-100 flex items-center justify-center" 
        style={{ 
          height: '500px', 
          minHeight: '500px',
          maxHeight: '500px',
          width: '100%',
        }}
      >
        <div className="text-neutral-500">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div 
      id="listing-map-container"
      className="relative w-full rounded-2xl overflow-hidden border-2 border-neutral-200" 
      style={{ 
        height: '500px', 
        minHeight: '500px',
        maxHeight: '500px',
        width: '100%',
        zIndex: 0,
        position: 'relative',
        display: 'block'
      }}
    >
      <MapContainer
        key={`map-${coordinates[0]}-${coordinates[1]}`}
        center={coordinates}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full rounded-2xl"
        style={{ 
          height: '500px !important', 
          minHeight: '500px !important',
          maxHeight: '500px !important',
          width: '100% !important', 
          zIndex: 0,
          display: 'block'
        }}
      >
        <MapResizer />
        {/* Fond de carte au style plus proche de Google Maps (CARTO Light basemap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          updateWhenZooming={false}
          updateWhenIdle={true}
          keepBuffer={2}
        />
        <Marker position={coordinates}>
          <Popup>
            <div className="text-center p-2">
              <MapPin className="h-5 w-5 text-neutral-700 mx-auto mb-2" />
              <p className="font-light text-lg text-neutral-900 mb-1">{title}</p>
              <p className="text-base text-neutral-600">{area}, {city}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
