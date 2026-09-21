"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { MARKETING_IMAGES } from "@/components/marketing/page-hero";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  backLabel: string;
}

export function AuthLayout({ children, backLabel }: AuthLayoutProps) {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">
        <div className="relative hidden lg:block min-h-[480px]">
          <Image
            src={MARKETING_IMAGES.auth}
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 bg-stone-50">
          <div className="w-full max-w-md mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
