"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
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

      if (data.user.role === "TENANT") {
        router.push("/tenant/dashboard");
      } else {
        router.push("/landlord/advertise");
      }
    } catch {
      setError(t("errors.errorOccurred") + ". " + t("errors.tryAgain"));
      setIsLoading(false);
    }
  };

  return (
    <AuthShell title={t("auth.signin.title")} subtitle={t("auth.signin.subtitle")}>
      {showSuccess && (
        <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2.5">
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{t("errors.accountCreatedSuccess")}</p>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
            {t("auth.signin.email")}
          </label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-11 border-neutral-200 focus-visible:ring-ink/20 focus-visible:border-ink"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
            {t("auth.signin.password")}
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="h-11 border-neutral-200 focus-visible:ring-ink/20 focus-visible:border-ink"
            required
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 accent-ink"
            />
            {t("auth.signin.rememberMe")}
          </label>
          <Link href="#" className="text-sm text-ink-muted hover:text-ink">
            {t("auth.signin.forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-ink hover:bg-ink/90 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors mt-2"
        >
          {isLoading ? t("common.loading") : t("auth.signin.title")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        {t("auth.signin.noAccount")}{" "}
        <Link href="/auth/signup" className="text-ink font-medium hover:underline">
          {t("auth.signin.signup")}
        </Link>
      </p>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-sm text-ink-muted">Chargement…</p>
        </div>
      }
    >
      <SignInPageContent />
    </Suspense>
  );
}
