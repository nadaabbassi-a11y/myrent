export interface ListingForAd {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  area: string | null;
  address: string | null;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  petAllowed: boolean;
  deposit: number;
  minTerm: number;
  wifiIncluded: boolean;
  heatingIncluded: boolean;
  hotWaterIncluded: boolean;
  electricityIncluded: boolean;
  parkingIncluded: boolean;
}

function includedServices(listing: ListingForAd): string[] {
  const services: string[] = [];
  if (listing.heatingIncluded) services.push("Chauffage");
  if (listing.hotWaterIncluded) services.push("Eau chaude");
  if (listing.electricityIncluded) services.push("Électricité");
  if (listing.wifiIncluded) services.push("Wi-Fi");
  if (listing.parkingIncluded) services.push("Stationnement");
  return services;
}

export function formatListingAd(
  listing: ListingForAd,
  baseUrl: string
): string {
  const myrentLink = `${baseUrl.replace(/\/$/, "")}/listings/${listing.id}`;
  const location = [listing.address, listing.area, listing.city]
    .filter(Boolean)
    .join(", ");
  const services = includedServices(listing);

  const lines = [
    listing.title,
    "",
    `💰 ${listing.price.toLocaleString("fr-CA")} $ / mois`,
    `🛏 ${listing.bedrooms} chambre${listing.bedrooms > 1 ? "s" : ""} · 🚿 ${listing.bathrooms} salle${listing.bathrooms > 1 ? "s" : ""} de bain`,
    location ? `📍 ${location}` : null,
    listing.furnished ? "✅ Meublé" : null,
    listing.petAllowed ? "✅ Animaux acceptés" : "❌ Animaux non acceptés",
    listing.deposit > 0
      ? `Dépôt : ${listing.deposit.toLocaleString("fr-CA")} $`
      : null,
    `Bail minimum : ${listing.minTerm} mois`,
    services.length > 0 ? `Inclus : ${services.join(", ")}` : null,
    "",
    listing.description.trim(),
    "",
    "—",
    "📸 Photos, visite en ligne et candidature sur MyRent :",
    myrentLink,
  ];

  return lines.filter((line) => line !== null).join("\n");
}

export function formatListingTitle(listing: ListingForAd): string {
  const location = listing.area || listing.city;
  return `${listing.bedrooms} ½ - ${location} - ${listing.price.toLocaleString("fr-CA")} $/mois`;
}
