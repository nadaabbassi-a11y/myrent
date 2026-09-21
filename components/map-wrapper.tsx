"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix pour les icônes Leaflet et création d'icône personnalisée simple
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Créer une icône épurée style minimaliste - fond noir avec prix blanc
const createCustomIcon = (price: number) => {
  // Formater le prix avec un espace comme séparateur de milliers
  const formattedPrice = price.toLocaleString('fr-CA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background: #1e293b;
      border-radius: 12px;
      padding: 6px 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      border: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    ">
      <span style="
        font-weight: 300;
        font-size: 13px;
        color: #ffffff;
        letter-spacing: -0.1px;
      ">${formattedPrice} $</span>
    </div>`,
    iconSize: [100, 50] as [number, number],
    iconAnchor: [0, 0],
    popupAnchor: [0, -10],
  });
};

interface MapWrapperProps {
  listings: Array<{
    id: string;
    title: string;
    price: number;
    city: string;
    area: string;
    latitude?: number | null;
    longitude?: number | null;
  }>;
  getCoordinates: (listing: { city: string; area: string; latitude?: number | null; longitude?: number | null }) => [number, number];
}

export default function MapWrapper({ listings, getCoordinates }: MapWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Créer une icône pour chaque listing avec son prix
  const listingIcons = listings.reduce((acc, listing) => {
    acc[listing.id] = createCustomIcon(listing.price);
    return acc;
  }, {} as Record<string, L.DivIcon>);

  // Calculer le centre optimal basé sur tous les listings
  const mapCenter = listings.length > 0 
    ? getCoordinates(listings[0])
    : [45.5017, -73.5673] as [number, number];

  if (!mounted) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        /* Style épuré pour les popups */
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
          padding: 0;
          border: none;
        }
        .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .leaflet-popup-tip {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .leaflet-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #fafafa;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #222222 !important;
          border: none !important;
          width: 40px !important;
          height: 40px !important;
          line-height: 40px !important;
          font-size: 20px !important;
          font-weight: 300 !important;
          transition: all 0.2s !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f7f7f7 !important;
          color: #222222 !important;
        }
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(4px);
          border-radius: 0;
          padding: 4px 8px;
          font-size: 10px;
          color: #666 !important;
        }
        .leaflet-control-attribution a {
          color: #666 !important;
        }
        /* Style pour les marqueurs personnalisés - épuré */
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-marker div {
          transition: all 0.15s ease;
          min-width: fit-content !important;
          width: auto !important;
          height: auto !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .custom-marker:hover div {
          box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
          transform: scale(1.08);
          background: #0f172a !important;
        }
        /* Style Google Maps exact */
        .leaflet-tile-container img {
          filter: brightness(1.0) contrast(1.0) saturate(1.0);
        }
        .leaflet-container {
          background: #e5e3df;
        }
        .leaflet-tile-pane {
          opacity: 1;
        }
        /* Style Google Maps pour les contrôles */
        .leaflet-control-zoom {
          border: 1px solid rgba(0,0,0,0.2) !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3) !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #333 !important;
          border-bottom: 1px solid #ccc !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f5f5f5 !important;
        }
      `}</style>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={listings.length > 0 ? 12 : 10}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: "600px", width: "100%", zIndex: 1 }}
        zoomControl={true}
        key={`map-${listings.length}`}
      >
        {/* Fond de carte au style plus proche de Google Maps (CARTO Light basemap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {listings.map((listing) => {
          const baseCoords = getCoordinates(listing);
          
          // Trouver combien de listings sont très proches (même coordonnées exactes)
          const sameCoordsListings = listings.filter(l => {
            const lCoords = getCoordinates(l);
            return Math.abs(lCoords[0] - baseCoords[0]) < 0.0001 && 
                   Math.abs(lCoords[1] - baseCoords[1]) < 0.0001;
          });
          const sameCoordsIndex = sameCoordsListings.findIndex(l => l.id === listing.id);
          
          // Espacement en cercle pour les listings aux mêmes coordonnées
          let finalCoords: [number, number] = baseCoords;
          if (sameCoordsListings.length > 1) {
            const angle = (sameCoordsIndex * 2 * Math.PI) / sameCoordsListings.length;
            const radius = 0.003;
            const offsetLat = radius * Math.cos(angle);
            const offsetLng = radius * Math.sin(angle);
            finalCoords = [
              baseCoords[0] + offsetLat,
              baseCoords[1] + offsetLng
            ];
          }
          
          return (
            <Marker key={listing.id} position={finalCoords} icon={listingIcons[listing.id]}>
              <Popup closeButton={true} className="custom-popup">
                <div className="p-4 min-w-[240px]">
                  <div className="mb-3">
                    <h3 className="font-light text-neutral-900 text-base mb-1 line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-neutral-600 flex items-center gap-1 font-light">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                      {listing.area}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-4 pt-3 border-t border-neutral-100">
                    <span className="text-2xl font-light text-neutral-900">
                      {listing.price.toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $
                    </span>
                    <span className="text-sm text-neutral-500 font-light">/mois</span>
                  </div>
                  <Link href={`/listings/${listing.id}`}>
                    <button className="w-full px-4 py-2.5 text-sm font-light bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors">
                      Voir les détails
                    </button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      </div>
    </>
  );
}

