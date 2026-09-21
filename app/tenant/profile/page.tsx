"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { User, Phone, DollarSign, TrendingUp, Save, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TenantProfile {
  id: string;
  phone: string | null;
  budgetMax: number | null;
  monthlyIncomeRange: string | null;
  incomeConsent: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
}

export default function TenantProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const { t } = useLanguageContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    budgetMax: "",
    monthlyIncomeRange: "",
    incomeConsent: false,
  });

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push("/auth/signin");
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (authUser && authUser.role === "TENANT") {
      fetchProfile();
    }
  }, [authUser]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tenant/profile");
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du profil");
      }

      const data = await response.json();
      setProfile(data.profile);
      setFormData({
        name: data.profile.user.name || "",
        email: data.profile.user.email || "",
        phone: data.profile.phone || "",
        budgetMax: data.profile.budgetMax?.toString() || "",
        monthlyIncomeRange: data.profile.monthlyIncomeRange || "",
        incomeConsent: data.profile.incomeConsent || false,
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
      const response = await fetch("/api/tenant/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name || undefined,
          phone: formData.phone || null,
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
          monthlyIncomeRange: formData.monthlyIncomeRange || null,
          incomeConsent: formData.incomeConsent,
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
      setProfile(data.profile);
      
      // Mettre à jour les données du formulaire avec les données retournées
      if (data.profile) {
        setFormData({
          name: data.profile.user.name || "",
          email: data.profile.user.email || "",
          phone: data.profile.phone || "",
          budgetMax: data.profile.budgetMax?.toString() || "",
          monthlyIncomeRange: data.profile.monthlyIncomeRange || "",
          incomeConsent: data.profile.incomeConsent || false,
        });
      }
      
      // Mettre à jour localStorage pour le budget/income
      if (formData.budgetMax || formData.monthlyIncomeRange) {
        localStorage.setItem(
          "myrent_budget_income",
          JSON.stringify({
            budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
            incomeRange: formData.monthlyIncomeRange || undefined,
            incomeConsent: formData.incomeConsent,
          })
        );
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
            <div className="text-center">{t("common.loading")}</div>
          </div>
        </main>
      </>
    );
  }

  if (!authUser || authUser.role !== "TENANT") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/tenant/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToDashboard")}
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-gray-900">{t("profile.title")}</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Profil mis à jour avec succès !</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-violet-600" />
                    {t("profile.personalInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("profile.name")}
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
                      {t("profile.email")}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t("profile.emailCannotChange")}</p>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      {t("profile.phone")}
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

              {/* Budget et revenus */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-violet-600" />
                    {t("profile.budget")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("profile.maxBudget")}
                    </label>
                    <Input
                      id="budgetMax"
                      type="number"
                      min="0"
                      step="50"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                      placeholder="1500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("profile.maxBudgetDesc")}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="monthlyIncomeRange" className="block text-sm font-medium text-gray-700 mb-2">
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                      {t("profile.monthlyIncome")}
                    </label>
                    <Select
                      value={formData.monthlyIncomeRange || "NONE"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          monthlyIncomeRange: value === "NONE" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.monthlyIncome")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">{t("common.cancel")}</SelectItem>
                        <SelectItem value="< 2,000">&lt; 2,000 $</SelectItem>
                        <SelectItem value="2,000 – 3,000">2,000 – 3,000 $</SelectItem>
                        <SelectItem value="3,000 – 4,500">3,000 – 4,500 $</SelectItem>
                        <SelectItem value="4,500 – 6,000">4,500 – 6,000 $</SelectItem>
                        <SelectItem value="6,000+">6,000+ $</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("profile.incomeDesc")}
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-violet-50 rounded-lg border border-violet-200">
                    <input
                      type="checkbox"
                      id="incomeConsent"
                      checked={formData.incomeConsent}
                      onChange={(e) => setFormData({ ...formData, incomeConsent: e.target.checked })}
                      className="mt-1"
                    />
                    <label htmlFor="incomeConsent" className="text-sm text-gray-700 cursor-pointer">
                      {t("profile.incomeConsent")} {t("profile.incomeDesc")}
                    </label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Link href="/tenant/dashboard">
                  <Button type="button" variant="ghost">
                    {t("common.cancel")}
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
                      {t("common.loading")}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t("profile.saveChanges")}
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

