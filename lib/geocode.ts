/**
 * Service de géocodification pour convertir une adresse en coordonnées GPS
 * Utilise l'API Nominatim (OpenStreetMap) - gratuite et sans clé API
 */

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(
  address: string,
  city?: string | null,
  area?: string | null,
  postalCode?: string | null
): Promise<GeocodeResult | null> {
  try {
    // Construire la requête de recherche
    // Priorité: code postal > adresse complète > ville/quartier
    let searchQuery = '';
    
    if (postalCode && postalCode.trim()) {
      // Si on a un code postal, l'utiliser en priorité (plus précis)
      searchQuery = `${postalCode}, Canada`;
    } else {
      // Sinon, construire avec l'adresse, le quartier et la ville
      if (address && address.trim()) {
        searchQuery = address;
      }
      if (area && area.trim()) {
        searchQuery += searchQuery ? `, ${area}` : area;
      }
      if (city && city.trim()) {
        searchQuery += searchQuery ? `, ${city}` : city;
      }
      searchQuery += searchQuery ? ', Canada' : 'Canada';
    }

    // Encoder l'URL
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`;

    // Faire la requête avec un User-Agent (requis par Nominatim)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MyRent/1.0 (contact@myrent.com)', // Nominatim exige un User-Agent
      },
    });

    if (!response.ok) {
      console.error('Erreur lors de la géocodification:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn('Aucun résultat de géocodification pour:', searchQuery);
      return null;
    }

    const result = data[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);
    
    // Valider que les coordonnées sont dans la plage du Canada
    // Latitude: 41.7 à 83.1, Longitude: -141.0 à -52.6
    if (
      latitude >= 41.7 && latitude <= 83.1 &&
      longitude >= -141.0 && longitude <= -52.6
    ) {
      return {
        latitude,
        longitude,
      };
    } else {
      console.warn(`Coordonnées hors du Canada: ${latitude}, ${longitude}`);
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la géocodification:', error);
    return null;
  }
}

/**
 * Géocode une adresse avec retry et fallback
 */
export async function geocodeAddressWithFallback(
  address: string,
  city?: string | null,
  area?: string | null,
  postalCode?: string | null
): Promise<GeocodeResult | null> {
  // Essayer d'abord avec le code postal (le plus précis)
  let result = postalCode ? await geocodeAddress('', city, area, postalCode) : null;
  
  // Si ça échoue, essayer avec l'adresse complète
  if (!result) {
    result = await geocodeAddress(address, city, area, postalCode);
  }
  
  // Si ça échoue, essayer avec juste la ville et le quartier
  if (!result && (city || area)) {
    result = await geocodeAddress('', city, area);
  }
  
  // Si ça échoue encore, essayer avec juste la ville
  if (!result && city) {
    result = await geocodeAddress('', city);
  }

  return result;
}

