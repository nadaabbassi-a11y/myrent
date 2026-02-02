import fr from './fr.json'
import en from './en.json'

export type Language = 'fr' | 'en'

export const translations = {
  fr,
  en,
} as const

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.')
  let value: any = translations[lang]
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      // Fallback to French if translation is missing
      value = translations.fr
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey]
      }
      break
    }
  }
  
  return value || key
}

export function useTranslation(lang: Language) {
  return (key: string) => getTranslation(lang, key)
}



