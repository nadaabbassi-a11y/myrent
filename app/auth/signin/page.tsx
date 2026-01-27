"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguageContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setShowSuccess(true);
      // Masquer le message après 5 secondes
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("errors.errorOccurred"));
        setIsLoading(false);
        return;
      }

      // Rediriger selon le rôle de l'utilisateur
      if (data.user.role === "TENANT") {
        router.push("/tenant/dashboard");
      } else {
        router.push("/landlord/dashboard");
      }
    } catch (err) {
      setError(t("errors.errorOccurred") + ". " + t("errors.tryAgain"));
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
                <CardTitle className="text-2xl font-bold">{t("auth.signin.title")}</CardTitle>
                <p className="text-white/90 text-sm mt-2">{t("auth.signin.subtitle")}</p>
              </CardHeader>
              <CardContent className="p-6">
                {showSuccess && (
                  <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">{t("errors.accountCreatedSuccess")}</p>
                  </div>
                )}

                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("auth.signin.email")}
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
                      {t("auth.signin.password")}
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
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" className="rounded" />
                      {t("auth.signin.rememberMe")}
                    </label>
                    <Link href="#" className="text-sm text-violet-600 hover:text-violet-700">
                      {t("auth.signin.forgotPassword")}
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-6 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? t("common.loading") : t("auth.signin.title")}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {t("auth.signin.noAccount")}{" "}
                    <Link href="/auth/signup" className="text-violet-600 hover:text-violet-700 font-semibold">
                      {t("auth.signin.signup")}
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

