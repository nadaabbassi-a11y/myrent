"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/marketing/auth-layout";
import { useLanguageContext } from "@/contexts/LanguageContext";

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "LANDLORD" || roleParam === "TENANT") {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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
        headers: { "Content-Type": "application/json" },
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
      } catch {
        setError("Une erreur est survenue. Veuillez réessayer.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        let errorMessage = data?.error || t("errors.errorOccurred");
        if (data?.details && Array.isArray(data.details)) {
          const validationErrors = data.details
            .map((err: { path?: string[]; message: string }) =>
              `${err.path?.join(".") || "champ"}: ${err.message}`
            )
            .join(", ");
          if (validationErrors) errorMessage = `Erreur de validation: ${validationErrors}`;
        }
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/signin?registered=true"), 2000);
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : t("errors.errorOccurred")) +
          ". " +
          t("errors.tryAgain")
      );
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout backLabel={t("backToHome")}>
      <h1 className="text-4xl md:text-5xl font-light text-neutral-900 tracking-tight">
        {t("auth.signup.title")}
      </h1>
      <p className="text-neutral-500 text-xl font-light mt-2 mb-10">
        {t("auth.signup.subtitle")}
      </p>

      {error && <p className="mb-6 text-sm font-light text-red-700">{error}</p>}

      {success && (
        <p className="mb-6 text-sm font-light text-neutral-700">
          {t("errors.accountCreated")} {t("errors.redirecting")}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-light text-neutral-600 mb-2">
            {t("auth.signup.name")}
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-12 px-0 bg-transparent border-0 border-b border-neutral-300 text-neutral-900 text-lg font-light focus:outline-none focus:border-neutral-900"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-light text-neutral-600 mb-2">
            {t("auth.signup.email")}
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-12 px-0 bg-transparent border-0 border-b border-neutral-300 text-neutral-900 text-lg font-light focus:outline-none focus:border-neutral-900"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-light text-neutral-600 mb-2">
            {t("auth.signup.password")}
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full h-12 px-0 bg-transparent border-0 border-b border-neutral-300 text-neutral-900 text-lg font-light focus:outline-none focus:border-neutral-900"
            required
            minLength={6}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-light text-neutral-600 mb-2">
            {t("auth.signup.confirmPassword")}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full h-12 px-0 bg-transparent border-0 border-b border-neutral-300 text-neutral-900 text-lg font-light focus:outline-none focus:border-neutral-900"
            required
          />
        </div>
        <div>
          <p className="block text-sm font-light text-neutral-600 mb-3">
            {t("auth.signup.role")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["TENANT", "LANDLORD"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData({ ...formData, role })}
                className={`py-3 rounded-xl border text-base font-light transition-colors ${
                  formData.role === role
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
              >
                {t(role === "TENANT" ? "auth.signup.tenant" : "auth.signup.landlord")}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 mt-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-lg font-medium rounded-xl transition-colors"
        >
          {isLoading ? t("common.loading") : t("auth.signup.createAccount")}
        </button>
      </form>

      <p className="mt-8 text-sm font-light text-neutral-500">
        {t("auth.signup.hasAccount")}{" "}
        <Link href="/auth/signin" className="text-neutral-900 hover:underline">
          {t("auth.signup.signin")}
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <p className="text-neutral-500">Chargement…</p>
        </div>
      }
    >
      <SignUpPageContent />
    </Suspense>
  );
}
