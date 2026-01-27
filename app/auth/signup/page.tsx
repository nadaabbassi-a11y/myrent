"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { t } = useLanguageContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "TENANT" as "TENANT" | "LANDLORD",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t("errors.passwordTooShort"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError);
        setError("Une erreur est survenue. Veuillez réessayer.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        let errorMessage = data?.error || t("errors.errorOccurred");
        
        // Afficher les détails de validation si disponibles
        if (data?.details && Array.isArray(data.details)) {
          const validationErrors = data.details.map((err: any) => 
            `${err.path?.join('.') || 'champ'}: ${err.message}`
          ).join(', ');
          if (validationErrors) {
            errorMessage = `Erreur de validation: ${validationErrors}`;
          }
        }
        
        setError(errorMessage);
        setIsLoading(false);
        console.error("Erreur API:", data);
        return;
      }

      setSuccess(true);
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push("/auth/signin?registered=true");
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("errors.errorOccurred");
      setError(errorMessage + ". " + t("errors.tryAgain"));
      console.error("Erreur lors de l'inscription:", err);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-violet-600 mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              {t("backToHome")}
            </Link>

            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold">{t("auth.signup.title")}</CardTitle>
                <p className="text-white/90 text-sm mt-2">{t("auth.signup.subtitle")}</p>
              </CardHeader>
              <CardContent className="p-6">
                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">{t("errors.accountCreated")}</p>
                      <p className="text-sm text-green-700 mt-1">{t("errors.redirecting")}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("auth.signup.name")}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder={t("auth.signup.name")}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("auth.signup.email")}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("auth.signup.password")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("auth.signup.confirmPassword")}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t("auth.signup.role")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "TENANT" })}
                        className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                          formData.role === "TENANT"
                            ? "border-violet-600 bg-violet-50 text-violet-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-violet-300"
                        }`}
                      >
                        {t("auth.signup.tenant")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "LANDLORD" })}
                        className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                          formData.role === "LANDLORD"
                            ? "border-violet-600 bg-violet-50 text-violet-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-violet-300"
                        }`}
                      >
                        {t("auth.signup.landlord")}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-6 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? t("common.loading") : t("auth.signup.createAccount")}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {t("auth.signup.hasAccount")}{" "}
                    <Link href="/auth/signin" className="text-violet-600 hover:text-violet-700 font-semibold">
                      {t("auth.signup.signin")}
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

