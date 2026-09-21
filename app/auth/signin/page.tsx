"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/marketing/auth-layout";
import { Input } from "@/components/ui/input";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { CheckCircle, AlertCircle } from "lucide-react";

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguageContext();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setShowSuccess(true);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("errors.errorOccurred"));
        setIsLoading(false);
        return;
      }

      router.push(data.user.role === "TENANT" ? "/tenant/dashboard" : "/landlord/advertise");
    } catch {
      setError(t("errors.errorOccurred") + ". " + t("errors.tryAgain"));
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout backLabel={t("backToHome")}>
      <h1 className="text-2xl font-medium text-neutral-900 tracking-tight">
        {t("auth.signin.title")}
      </h1>
      <p className="text-neutral-500 text-sm mt-1 mb-6">{t("auth.signin.subtitle")}</p>

      {showSuccess && (
        <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2.5">
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{t("errors.accountCreatedSuccess")}</p>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
            {t("auth.signin.email")}
          </label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-11 bg-white"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
            {t("auth.signin.password")}
          </label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="h-11 bg-white"
            required
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-neutral-600">
            <input type="checkbox" className="rounded accent-neutral-900" />
            {t("auth.signin.rememberMe")}
          </label>
          <Link href="#" className="text-neutral-500 hover:text-neutral-900">
            {t("auth.signin.forgotPassword")}
          </Link>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {isLoading ? t("common.loading") : t("auth.signin.title")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        {t("auth.signin.noAccount")}{" "}
        <Link href="/auth/signup" className="text-neutral-900 font-medium hover:underline">
          {t("auth.signin.signup")}
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <p className="text-neutral-500">Chargement…</p>
        </div>
      }
    >
      <SignInPageContent />
    </Suspense>
  );
}
