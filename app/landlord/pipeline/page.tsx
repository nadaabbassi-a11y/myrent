"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GitBranch } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { ListingPipelineBoard } from "@/components/listing-pipeline-board";

export default function LandlordPipelinePage() {
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
    <main className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-medium text-neutral-900 tracking-tight">
                {t("pipeline.title")}
              </h1>
            </div>
            <p className="text-neutral-600 ml-[52px]">{t("pipeline.subtitle")}</p>
          </div>

          <ListingPipelineBoard />
        </div>
      </div>
    </main>
  );
}
