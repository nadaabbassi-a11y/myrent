"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Input } from "@/components/ui/input";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { AlertCircle, CheckCircle } from "lucide-react";

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

  const inputClass =
    "h-11 border-neutral-200 focus-visible:ring-ink/20 focus-visible:border-ink";

  return (
    <AuthShell title={t("auth.signup.title")} subtitle={t("auth.signup.subtitle")}>
      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2.5">
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">{t("errors.accountCreated")}</p>
            <p className="text-sm text-green-700 mt-0.5">{t("errors.redirecting")}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
            {t("auth.signup.name")}
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
            {t("auth.signup.email")}
          </label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
            {t("auth.signup.password")}
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={inputClass}
            required
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1.5">
            {t("auth.signup.confirmPassword")}
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            {t("auth.signup.role")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["TENANT", "LANDLORD"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData({ ...formData, role })}
                className={`px-3 py-2.5 rounded-md border text-sm font-medium transition-colors ${
                  formData.role === role
                    ? "border-ink bg-ink text-white"
                    : "border-neutral-200 bg-white text-ink-muted hover:border-neutral-300"
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
          className="w-full h-11 bg-ink hover:bg-ink/90 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors mt-2"
        >
          {isLoading ? t("common.loading") : t("auth.signup.createAccount")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        {t("auth.signup.hasAccount")}{" "}
        <Link href="/auth/signin" className="text-ink font-medium hover:underline">
          {t("auth.signup.signin")}
        </Link>
      </p>
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-sm text-ink-muted">Chargement…</p>
        </div>
      }
    >
      <SignUpPageContent />
    </Suspense>
  );
}
