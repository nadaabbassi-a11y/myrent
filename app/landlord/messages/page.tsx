"use client";

import { Suspense } from "react";
import { MessagesInbox } from "@/components/messages-inbox";
import { useLanguageContext } from "@/contexts/LanguageContext";

export default function LandlordMessagesPage() {
  const { t } = useLanguageContext();

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4 text-center">{t("common.loading")}</div>
        </main>
      }
    >
      <MessagesInbox variant="landlord" />
    </Suspense>
  );
}
