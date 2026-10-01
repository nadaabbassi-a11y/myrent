"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Globe, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguageContext } from "@/contexts/LanguageContext";

export default function LanguageSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { language: currentLanguage, changeLanguage } = useLanguageContext();
  const router = useRouter();
  const [language, setLanguage] = useState("fr");
  const [currency, setCurrency] = useState("CAD");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    } else {
      // Récupérer les préférences depuis localStorage
      const savedLanguage = currentLanguage || localStorage.getItem("myrent_language") || "fr";
      const savedCurrency = localStorage.getItem("myrent_currency") || "CAD";
      setLanguage(savedLanguage);
      setCurrency(savedCurrency);
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Sauvegarder dans localStorage
      if (language === "fr" || language === "en") {
        changeLanguage(language);
      }
      localStorage.setItem("myrent_currency", currency);
      
      // TODO: Sauvegarder dans la base de données
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">Chargement...</div>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux paramètres
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
              <Globe className="h-8 w-8 text-violet-600" />
              Langues et devise
            </h1>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                Préférences enregistrées avec succès !
              </div>
            )}

            <div className="space-y-6">
              {/* Langue */}
              <Card>
                <CardHeader>
                  <CardTitle>Langue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-lg font-light">
                    <button
                      type="button"
                      onClick={() => setLanguage("fr")}
                      className={language === "fr" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-700"}
                    >
                      FR
                    </button>
                    <span className="text-neutral-300">/</span>
                    <button
                      type="button"
                      onClick={() => setLanguage("en")}
                      className={language === "en" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-700"}
                    >
                      EN
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Devise */}
              <Card>
                <CardHeader>
                  <CardTitle>Devise</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAD">
                        <div className="flex items-center gap-2">
                          <span>CAD</span>
                          <span className="text-gray-500">- Dollar canadien</span>
                          {currency === "CAD" && <Check className="h-4 w-4 ml-auto text-violet-600" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="USD">
                        <div className="flex items-center gap-2">
                          <span>USD</span>
                          <span className="text-gray-500">- Dollar américain</span>
                          {currency === "USD" && <Check className="h-4 w-4 ml-auto text-violet-600" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="EUR">
                        <div className="flex items-center gap-2">
                          <span>EUR</span>
                          <span className="text-gray-500">- Euro</span>
                          {currency === "EUR" && <Check className="h-4 w-4 ml-auto text-violet-600" />}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">
                    Choisissez la devise pour afficher les prix
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Link href="/settings">
                  <Button type="button" variant="ghost">
                    Annuler
                  </Button>
                </Link>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}



