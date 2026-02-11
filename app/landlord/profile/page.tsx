"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { User, Phone, Building, Save, ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
      <main className="min-h-screen bg-neutral-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/landlord/dashboard"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-light">Retour au tableau de bord</span>
            </Link>

            <div className="mb-12">
              <h1 className="text-4xl font-light text-neutral-900 mb-2">Mon profil</h1>
              <p className="text-neutral-500 text-sm font-light">Gérez vos informations personnelles et professionnelles</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-light">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 flex items-center gap-3"
              >
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-light">Profil mis à jour avec succès !</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-6 pb-8 border-b border-neutral-200"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-3xl font-light text-neutral-600">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "P"}
                </div>
                <div>
                  <h2 className="text-2xl font-light text-neutral-900 mb-1">
                    {formData.name || "Propriétaire"}
                  </h2>
                  <p className="text-neutral-500 text-sm font-light">{formData.email}</p>
                </div>
              </motion.div>

              {/* Informations personnelles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl font-light text-neutral-900">
                      <div className="p-2 rounded-lg bg-neutral-100">
                        <User className="h-5 w-5 text-neutral-600" />
                      </div>
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-neutral-700 block">
                        Nom complet
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Votre nom"
                        className="h-12 border-neutral-200 rounded-xl focus:border-neutral-400 focus:ring-neutral-400 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-neutral-700 block flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="h-12 border-neutral-200 rounded-xl bg-neutral-50 text-neutral-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-neutral-400 font-light">L'email ne peut pas être modifié</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-neutral-700 block flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                        className="h-12 border-neutral-200 rounded-xl focus:border-neutral-400 focus:ring-neutral-400 transition-colors"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Informations professionnelles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl font-light text-neutral-900">
                      <div className="p-2 rounded-lg bg-neutral-100">
                        <Building className="h-5 w-5 text-neutral-600" />
                      </div>
                      Informations professionnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-medium text-neutral-700 block">
                        Nom de l'entreprise <span className="text-neutral-400 font-light">(optionnel)</span>
                      </label>
                      <Input
                        id="company"
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Nom de votre entreprise"
                        className="h-12 border-neutral-200 rounded-xl focus:border-neutral-400 focus:ring-neutral-400 transition-colors"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-end gap-4 pt-6 border-t border-neutral-200"
              >
                <Link href="/landlord/dashboard">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 px-6 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl font-light"
                  >
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-12 px-8 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-light shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Enregistrement...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Enregistrer les modifications
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </main>
    </>
  );
}


