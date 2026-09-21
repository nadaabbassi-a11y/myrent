"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useLanguageContext } from "@/contexts/LanguageContext";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  const { t } = useLanguageContext();

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panneau gauche — desktop */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12">
        <Link href="/">
          <Logo variant="light" size="md" />
        </Link>
        <div>
          <p className="text-3xl font-semibold tracking-tight leading-snug max-w-sm">
            {t("home.heroTitle")}
            <br />
            <span className="text-neutral-500">{t("home.heroTitleAccent")}</span>
          </p>
          <p className="mt-4 text-sm text-neutral-400 max-w-sm leading-relaxed">
            {t("home.heroSubtitle")}
          </p>
        </div>
        <p className="text-xs text-neutral-600">© MyRent · Québec</p>
      </div>

      {/* Formulaire */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 bg-white">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-8">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>

          <h1 className="text-2xl font-semibold text-ink tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>
          )}

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs text-ink-subtle hover:text-ink transition-colors"
            >
              ← {t("backToHome")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
