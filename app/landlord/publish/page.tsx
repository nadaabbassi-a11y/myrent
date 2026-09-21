"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { PublishEverywherePanel } from "@/components/publish-everywhere-panel";

function PublishPageContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listing") ?? undefined;

  return <PublishEverywherePanel initialListingId={listingId} />;
}

export default function LandlordPublishPage() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguageContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mb-4" />
          <p className="text-neutral-600">{t("common.loading")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-6">
        <Suspense
          fallback={
            <div className="text-center py-16 text-neutral-500">
              {t("common.loading")}
            </div>
          }
        >
          <PublishPageContent />
        </Suspense>
      </div>
    </main>
  );
}
