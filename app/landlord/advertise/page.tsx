"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Home,
  MessageSquare,
  CalendarCheck,
  Calendar,
  Megaphone,
  GitBranch,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { LandlordHubCard } from "@/components/landlord-hub-card";

export default function LandlordAdvertisePage() {
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
              {t("landlordNav.advertise")}
            </h1>
            <p className="text-neutral-600">{t("landlordNav.advertiseDesc")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LandlordHubCard
              href="/landlord/publish"
              icon={Megaphone}
              title={t("syndication.title")}
              description={t("syndication.subtitle")}
              highlight
            />
            <LandlordHubCard
              href="/landlord/pipeline"
              icon={GitBranch}
              title={t("pipeline.title")}
              description={t("pipeline.subtitle")}
            />
            <LandlordHubCard
              href="/landlord/listings/new"
              icon={Plus}
              title={t("landlordHub.createListing")}
              description={t("landlordHub.createListingDesc")}
            />
            <LandlordHubCard
              href="/landlord/listings"
              icon={Home}
              title={t("landlordHub.myListings")}
              description={t("landlordHub.myListingsDesc")}
            />
            <LandlordHubCard
              href="/landlord/messages"
              icon={MessageSquare}
              title={t("landlordHub.messages")}
              description={t("landlordHub.messagesDesc")}
              badge={notifications.messages}
            />
            <LandlordHubCard
              href="/landlord/visits"
              icon={CalendarCheck}
              title={t("landlordHub.visitRequests")}
              description={t("landlordHub.visitRequestsDesc")}
              badge={notifications.visitRequests}
            />
            <LandlordHubCard
              href="/landlord/appointments"
              icon={Calendar}
              title={t("landlordHub.appointments")}
              description={t("landlordHub.appointmentsDesc")}
            />
            <LandlordHubCard
              href="/landlord/availability"
              icon={Calendar}
              title={t("landlordHub.availability")}
              description={t("landlordHub.availabilityDesc")}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
