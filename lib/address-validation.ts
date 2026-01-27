/**
 * Validation des adresses canadiennes
 * Format du code postal canadien: A1A 1A1 (lettre-chiffre-lettre espace chiffre-lettre-chiffre)
 */

/**
 * Valide le format d'un code postal canadien
 * Format: A1A 1A1 (avec ou sans espace)
 * @param postalCode - Le code postal à valider
 * @returns true si le format est valide
 */
export function isValidCanadianPostalCode(postalCode: string): boolean {
  if (!postalCode || postalCode.trim() === '') {
    return false;
  }

  // Format canadien: A1A 1A1 (lettre-chiffre-lettre espace chiffre-lettre-chiffre)
  // Accepter avec ou sans espace
  const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][\s-]?\d[A-Za-z]\d$/;
  
  // Normaliser: enlever les espaces et tirets, puis vérifier
  const normalized = postalCode.replace(/[\s-]/g, '').toUpperCase();
  
  if (normalized.length !== 6) {
    return false;
  }

  // Vérifier le format exact
  return canadianPostalCodeRegex.test(postalCode);
}

/**
 * Normalise un code postal canadien (enlève les espaces, met en majuscules)
 * @param postalCode - Le code postal à normaliser
 * @returns Le code postal normalisé (A1A1A1) ou null si invalide
 */
export function normalizePostalCode(postalCode: string): string | null {
  if (!postalCode || postalCode.trim() === '') {
    return null;
  }

  const normalized = postalCode.replace(/[\s-]/g, '').toUpperCase();
  
  if (!isValidCanadianPostalCode(postalCode)) {
    return null;
  }

  return normalized;
}

/**
 * Formate un code postal canadien avec un espace (A1A 1A1)
 * @param postalCode - Le code postal à formater
 * @returns Le code postal formaté ou null si invalide
 */
export function formatPostalCode(postalCode: string): string | null {
  const normalized = normalizePostalCode(postalCode);
  if (!normalized) {
    return null;
  }

  // Insérer un espace après le 3ème caractère
  return `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
}

/**
 * Valide qu'une adresse a au moins une information de localisation valide
 * (ville OU région/quartier OU code postal)
 * @param city - La ville
 * @param area - Le quartier/région
 * @param postalCode - Le code postal
 * @returns true si au moins une information de localisation est fournie
 */
export function hasValidLocation(city?: string | null, area?: string | null, postalCode?: string | null): boolean {
  const hasCity = city && city.trim().length > 0;
  const hasArea = area && area.trim().length > 0;
  const hasPostalCode = postalCode && isValidCanadianPostalCode(postalCode);

  return hasCity || hasArea || hasPostalCode || false;
}

/**
 * Valide une adresse complète pour le géocodage
 * @param address - L'adresse de rue
 * @param city - La ville
 * @param area - Le quartier/région
 * @param postalCode - Le code postal
 * @returns Un objet avec isValid et un message d'erreur si invalide
 */
export function validateAddressForGeocoding(
  address?: string | null,
  city?: string | null,
  area?: string | null,
  postalCode?: string | null
): { isValid: boolean; error?: string } {
  // Au minimum, on doit avoir une ville OU un code postal
  if (!hasValidLocation(city, area, postalCode)) {
    return {
      isValid: false,
      error: 'Veuillez fournir au moins une ville ou un code postal valide pour localiser l\'adresse sur la carte.',
    };
  }

  // Si un code postal est fourni, il doit être valide
  if (postalCode && postalCode.trim() !== '' && !isValidCanadianPostalCode(postalCode)) {
    return {
      isValid: false,
      error: 'Le code postal doit être au format canadien (ex: A1A 1A1).',
    };
  }

  return { isValid: true };
}

