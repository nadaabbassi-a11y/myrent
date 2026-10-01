"use client";

import { useEffect } from "react";
import { useLanguageContext } from "@/contexts/LanguageContext";

export function HtmlLang() {
  const { language } = useLanguageContext();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
