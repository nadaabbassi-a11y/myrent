"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/marketing/auth-layout";
import { useLanguageContext } from "@/contexts/LanguageContext";

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

      router.push(data.user.role === "TENANT" ? "/tenant" : "/landlord");
    } catch {
      setError(t("errors.errorOccurred") + ". " + t("errors.tryAgain"));
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout backLabel={t("backToHome")}>
      <h1 className="text-4xl md:text-5xl font-light text-neutral-900 tracking-tight">
        {t("auth.signin.title")}
      </h1>
      <p className="text-neutral-500 text-xl font-light mt-2 mb-10">
        {t("auth.signin.subtitle")}
      </p>

      {showSuccess && (
        <p className="mb-6 text-sm font-light text-neutral-700">
          {t("errors.accountCreatedSuccess")}
        </p>
      )}

      {error && (
        <p className="mb-6 text-sm font-light text-red-700">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-light text-neutral-600 mb-2">
            {t("auth.signin.email")}
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-12 px-0 bg-transparent border-0 border-b border-neutral-300 text-neutral-900 text-lg font-light placeholder:text-neutral-300 focus:outline-none focus:border-neutral-900"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-light text-neutral-600 mb-2">
            {t("auth.signin.password")}
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full h-12 px-0 bg-transparent border-0 border-b border-neutral-300 text-neutral-900 text-lg font-light focus:outline-none focus:border-neutral-900"
            required
          />
        </div>
        <div className="flex items-center justify-between text-sm font-light pt-1">
          <label className="flex items-center gap-2 text-neutral-500">
            <input type="checkbox" className="rounded accent-neutral-900" />
            {t("auth.signin.rememberMe")}
          </label>
          <Link href="#" className="text-neutral-400 hover:text-neutral-900">
            {t("auth.signin.forgotPassword")}
          </Link>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 mt-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-lg font-medium rounded-xl transition-colors"
        >
          {isLoading ? t("common.loading") : t("common.login")}
        </button>
      </form>

      <p className="mt-8 text-sm font-light text-neutral-500">
        {t("auth.signin.noAccount")}{" "}
        <Link href="/auth/signup" className="text-neutral-900 hover:underline">
          {t("auth.signin.signup")}
        </Link>
      </p>

      <div className="mt-10 pt-8 border-t border-neutral-100 flex flex-wrap gap-x-5 gap-y-2 text-sm font-light text-neutral-400">
        <button
          type="button"
          className="hover:text-neutral-900"
          onClick={() =>
            setFormData({ email: "marie.proprio@myrent.test", password: "Demo1234" })
          }
        >
          {t("auth.signin.demoLandlord")}
        </button>
        <button
          type="button"
          className="hover:text-neutral-900"
          onClick={() =>
            setFormData({ email: "alex.locataire@myrent.test", password: "Demo1234" })
          }
        >
          {t("auth.signin.demoTenant")}
        </button>
      </div>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-neutral-400 font-light">Chargement…</p>
        </div>
      }
    >
      <SignInPageContent />
    </Suspense>
  );
}
