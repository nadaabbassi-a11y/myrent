"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Globe, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LanguageSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
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
      const savedLanguage = localStorage.getItem("myrent_language") || "fr";
      const savedCurrency = localStorage.getItem("myrent_currency") || "CAD";
      setLanguage(savedLanguage);
      setCurrency(savedCurrency);
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem("myrent_language", language);
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
        <div className="py-10">
          <div className="container mx-auto px-4">
            <div className="text-center">Chargement...</div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 text-ink-muted hover:text-ink mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux paramètres
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-ink flex items-center gap-3">
              <Globe className="h-8 w-8 text-ink" />
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
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">
                        <div className="flex items-center gap-2">
                          <span>🇫🇷</span>
                          <span>Français</span>
                          {language === "fr" && <Check className="h-4 w-4 ml-auto text-ink" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <span>🇬🇧</span>
                          <span>English</span>
                          {language === "en" && <Check className="h-4 w-4 ml-auto text-ink" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="es">
                        <div className="flex items-center gap-2">
                          <span>🇪🇸</span>
                          <span>Español</span>
                          {language === "es" && <Check className="h-4 w-4 ml-auto text-ink" />}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">
                    Choisissez votre langue préférée pour l'interface
                  </p>
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
                          {currency === "CAD" && <Check className="h-4 w-4 ml-auto text-ink" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="USD">
                        <div className="flex items-center gap-2">
                          <span>USD</span>
                          <span className="text-gray-500">- Dollar américain</span>
                          {currency === "USD" && <Check className="h-4 w-4 ml-auto text-ink" />}
                        </div>
                      </SelectItem>
                      <SelectItem value="EUR">
                        <div className="flex items-center gap-2">
                          <span>EUR</span>
                          <span className="text-gray-500">- Euro</span>
                          {currency === "EUR" && <Check className="h-4 w-4 ml-auto text-ink" />}
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
                  className="bg-ink hover:bg-ink/90 text-white"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



