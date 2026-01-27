"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "@/hooks/useLanguage";
import { useTranslation } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Récupérer la langue depuis localStorage uniquement côté client
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("myrent_language") as Language;
      if (savedLanguage === "fr" || savedLanguage === "en") {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("myrent_language", newLanguage);
    }
  };

  const t = useTranslation(language);

  // Toujours fournir le contexte, même pendant l'hydratation
  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageProvider");
  }
  return context;
}

