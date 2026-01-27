"use client";

import { useState, useEffect } from "react";

export type Language = "fr" | "en";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    // Récupérer la langue depuis localStorage
    const savedLanguage = localStorage.getItem("myrent_language") as Language;
    if (savedLanguage === "fr" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("myrent_language", newLanguage);
  };

  return { language, changeLanguage };
}


