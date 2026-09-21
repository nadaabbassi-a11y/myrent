"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { PublishEverywherePanel } from "@/components/publish-everywhere-panel";

export default function LandlordPublishListingPage() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguageContext();
  const router = useRouter();
  const params = useParams();
  const listingId = params.listingId as string;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="py-10">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mb-4" />
          <p className="text-neutral-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container mx-auto px-6">
        <PublishEverywherePanel initialListingId={listingId} />
      </div>
    </div>
  );
}
