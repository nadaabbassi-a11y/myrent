"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, FileText, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { LandlordHubCard } from "@/components/landlord-hub-card";

export default function LandlordPaperworkPage() {
  const { user, isLoading } = useAuth();
  const { notifications } = useNotifications();
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-medium text-neutral-900 mb-2 tracking-tight">
              {t("landlordNav.paperwork")}
            </h1>
            <p className="text-neutral-600">{t("landlordNav.paperworkDesc")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LandlordHubCard
              href="/landlord/applications"
              icon={Users}
              title={t("landlordHub.applications")}
              description={t("landlordHub.applicationsDesc")}
              badge={notifications.applications}
            />
            <LandlordHubCard
              href="/landlord/leases"
              icon={FileText}
              title={t("landlordHub.leases")}
              description={t("landlordHub.leasesDesc")}
            />
            <LandlordHubCard
              href="/landlord/quick-actions"
              icon={Zap}
              title={t("landlordHub.quickActions")}
              description={t("landlordHub.quickActionsDesc")}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
