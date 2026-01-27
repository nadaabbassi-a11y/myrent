"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { User, Phone, Building, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LandlordProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    } else if (user && user.role === "LANDLORD") {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/landlord/profile");
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du profil");
      }

      const data = await response.json();
      setFormData({
        name: data.profile.user.name || "",
        email: data.profile.user.email || "",
        phone: data.profile.phone || "",
        company: data.profile.company || "",
      });
    } catch (err) {
      setError("Erreur lors du chargement du profil");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);

    try {
      const response = await fetch("/api/landlord/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name || undefined,
          phone: formData.phone || null,
          company: formData.company || null,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        setError("Une erreur est survenue. Veuillez réessayer.");
        setIsSaving(false);
        console.error("Erreur de parsing JSON:", parseError);
        return;
      }

      if (!response.ok) {
        let errorMessage = data?.error || "Erreur lors de la sauvegarde";
        if (data?.details && Array.isArray(data.details)) {
          const validationErrors = data.details.map((err: any) => 
            `${err.path?.join('.') || 'champ'}: ${err.message}`
          ).join(', ');
          if (validationErrors) {
            errorMessage = `Erreur de validation: ${validationErrors}`;
          }
        }
        setError(errorMessage);
        setIsSaving(false);
        console.error("Erreur API:", data);
        return;
      }
      
      setSuccess(true);
      
      // Mettre à jour les données du formulaire avec les données retournées
      if (data.profile) {
        setFormData({
          name: data.profile.user.name || "",
          email: data.profile.user.email || "",
          phone: data.profile.phone || "",
          company: data.profile.company || "",
        });
      }
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
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

  if (!user || user.role !== "LANDLORD") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/landlord/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-gray-900">Mon profil</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                Profil mis à jour avec succès !
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-violet-600" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Téléphone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informations professionnelles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-violet-600" />
                    Informations professionnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise (optionnel)
                    </label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Link href="/landlord/dashboard">
                  <Button type="button" variant="ghost">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}


