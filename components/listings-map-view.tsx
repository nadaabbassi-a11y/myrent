"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

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

// Import dynamique de toute la carte
const DynamicMap = dynamic(
  () => import("./map-wrapper"),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    )
  }
);

interface ListingsMapViewProps {
  listings: Array<{
    id: string;
    title: string;
    price: number;
    city: string;
    area: string;
    latitude?: number | null;
    longitude?: number | null;
  }>;
}

export function ListingsMapView({ listings }: ListingsMapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fonction améliorée qui utilise latitude/longitude si disponibles
  const getCoordinatesForListing = (listing: { city: string; area: string; latitude?: number | null; longitude?: number | null }): [number, number] => {
    // Si latitude et longitude sont disponibles, les utiliser
    if (listing.latitude != null && listing.longitude != null) {
      return [listing.latitude, listing.longitude];
    }
    // Sinon, utiliser la fonction de fallback basée sur city/area
    return getCoordinates(listing.city, listing.area);
  };

  if (!mounted) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full rounded-lg overflow-hidden bg-gray-50" style={{ minHeight: '600px' }}>
      <DynamicMap listings={listings} getCoordinates={getCoordinatesForListing} />
    </div>
  );
}
