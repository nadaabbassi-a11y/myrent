"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  address?: {
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    state?: string;
    country?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, latitude: number, longitude: number, postalCode?: string, area?: string, city?: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  city?: string;
  area?: string;
  postalCode?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Rechercher une adresse...",
  required = false,
  className = "",
  city,
  area,
  postalCode,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  
  // Synchroniser query avec value si value change de l'extérieur
  useEffect(() => {
    if (value !== undefined && value !== null && value !== query) {
      setQuery(value);
    }
  }, [value, query]);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Rechercher des adresses avec debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        // Construire la requête de recherche
        let searchQuery = query;
        
        // Ajouter le code postal si disponible
        if (postalCode && postalCode.trim()) {
          searchQuery = `${query}, ${postalCode}`;
        }
        // Ajouter le quartier si disponible
        else if (area && area.trim()) {
          searchQuery = `${query}, ${area}`;
        }
        // Ajouter la ville si disponible
        if (city && city.trim()) {
          searchQuery = `${searchQuery}, ${city}`;
        }
        
        searchQuery += ", Canada";

        const encodedQuery = encodeURIComponent(searchQuery);
        const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=10&addressdetails=1&countrycodes=ca`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'MyRent/1.0 (contact@myrent.com)',
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la recherche d'adresses");
        }

        const data: AddressSuggestion[] = await response.json();
        
        // Filtrer pour ne garder que les résultats au Canada
        const canadianResults = data.filter((item) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          return (
            lat >= 41.7 && lat <= 83.1 &&
            lon >= -141.0 && lon <= -52.6
          );
        });

        setSuggestions(canadianResults);
        setShowSuggestions(canadianResults.length > 0);
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresses:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Debounce de 500ms

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, city, area, postalCode]);

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.display_name);
    setSelectedAddress(suggestion);
    setShowSuggestions(false);
    
    // Extraire le code postal si disponible
    const extractedPostalCode = suggestion.address?.postcode || '';
    let formattedPostalCode: string | undefined;
    
    if (extractedPostalCode) {
      // Formater le code postal canadien (A1A 1A1)
      const normalized = extractedPostalCode.toUpperCase().replace(/[\s-]/g, '');
      if (normalized.length === 6) {
        formattedPostalCode = `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
      } else {
        formattedPostalCode = extractedPostalCode.toUpperCase();
      }
    }
    
    // Extraire le quartier (priorité: neighbourhood > suburb > quarter)
    const extractedArea = 
      suggestion.address?.neighbourhood || 
      suggestion.address?.suburb || 
      suggestion.address?.quarter || 
      undefined;
    
    // Extraire la ville (priorité: city > town > village)
    const extractedCity = 
      suggestion.address?.city || 
      suggestion.address?.town || 
      suggestion.address?.village || 
      undefined;
    
    // Appeler onChange avec l'adresse complète, les coordonnées, le code postal, le quartier et la ville
    onChange(
      suggestion.display_name,
      parseFloat(suggestion.lat),
      parseFloat(suggestion.lon),
      formattedPostalCode,
      extractedArea,
      extractedCity
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedAddress(null);
    
    // Si l'utilisateur efface la sélection, réinitialiser
    if (!newValue) {
      onChange("", 0, 0, undefined, undefined, undefined);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-500 z-10" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:outline-none text-gray-900 transition-all duration-300 bg-white/80 backdrop-blur-sm"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-500 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
          {suggestions.map((suggestion) => {
            // Extraire le code postal si disponible
            const extractedPostalCode = suggestion.address?.postcode || '';
            const formattedPostalCode = extractedPostalCode 
              ? extractedPostalCode.toUpperCase().replace(/([A-Z0-9]{3})([A-Z0-9]{3})/, '$1 $2')
              : '';
            
            return (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-violet-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {suggestion.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {suggestion.display_name.split(',').slice(1).join(',').trim()}
                    </p>
                    {formattedPostalCode && (
                      <p className="text-xs text-violet-600 font-semibold mt-1">
                        📮 {formattedPostalCode}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedAddress && (
        <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Adresse sélectionnée avec coordonnées précises
        </p>
      )}
    </div>
  );
}

