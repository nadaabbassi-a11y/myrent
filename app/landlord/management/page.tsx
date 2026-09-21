"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, MessageSquare, Receipt } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { LandlordHubCard } from "@/components/landlord-hub-card";

export default function LandlordManagementPage() {
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-medium text-neutral-900 mb-2 tracking-tight">
              {t("landlordNav.management")}
            </h1>
            <p className="text-neutral-600">{t("landlordNav.managementDesc")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LandlordHubCard
              href="/landlord/rent-management"
              icon={DollarSign}
              title={t("landlordHub.rentManagement")}
              description={t("landlordHub.rentManagementDesc")}
            />
            <LandlordHubCard
              href="/landlord/messages"
              icon={MessageSquare}
              title={t("landlordHub.tenantCommunications")}
              description={t("landlordHub.tenantCommunicationsDesc")}
            />
            <LandlordHubCard
              href="/landlord/management"
              icon={Receipt}
              title={t("landlordHub.expenses")}
              description={t("landlordHub.expensesDesc")}
            />
          </div>

          <p className="mt-8 text-sm text-neutral-400 text-center">
            {t("landlordHub.expensesComingSoon")}
          </p>
        </div>
      </div>
    </div>
  );
}
