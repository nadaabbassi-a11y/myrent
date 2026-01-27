"use client";

import { useEffect, useState } from "react";

export function HtmlLang() {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  
  useEffect(() => {
    setMounted(true);
    
    // Récupérer la langue depuis localStorage
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("myrent_language") as "fr" | "en";
      if (savedLanguage === "fr" || savedLanguage === "en") {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  // Écouter les changements de langue depuis localStorage
  useEffect(() => {
    if (!mounted) return;
    
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        const savedLanguage = localStorage.getItem("myrent_language") as "fr" | "en";
        if (savedLanguage === "fr" || savedLanguage === "en") {
          setLanguage(savedLanguage);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [mounted]);

  return null;
}


