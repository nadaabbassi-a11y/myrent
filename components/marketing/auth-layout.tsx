"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { MARKETING_IMAGES } from "@/components/marketing/page-hero";
import { IconChevronLeft } from "@/components/marketing/icons";
import { useLanguageContext } from "@/contexts/LanguageContext";

interface AuthLayoutProps {
  children: React.ReactNode;
  backLabel: string;
}

export function AuthLayout({ children, backLabel }: AuthLayoutProps) {
  const { t } = useLanguageContext();

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 grid lg:grid-cols-2 min-h-0">
        <div className="relative hidden lg:block">
          <Image
            src={MARKETING_IMAGES.auth}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
            <p className="text-white text-4xl xl:text-5xl font-light tracking-tight leading-tight">
              MyRent.
            </p>
            <p className="text-white/80 text-xl xl:text-2xl font-light mt-2">
              {t("auth.signin.photoLine")}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center px-6 py-14 sm:px-14 bg-white overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-900 mb-10 text-sm font-light transition-colors"
            >
              <IconChevronLeft className="h-4 w-4" />
              {backLabel}
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
