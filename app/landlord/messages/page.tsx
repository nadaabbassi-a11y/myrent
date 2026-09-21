"use client";

import { Suspense } from "react";
import { MessagesInbox } from "@/components/messages-inbox";
import { useLanguageContext } from "@/contexts/LanguageContext";

export default function LandlordMessagesPage() {
  const { t } = useLanguageContext();

  return (
    <Suspense
      fallback={
        <div className="py-10">
          <div className="container mx-auto px-4 text-center">{t("common.loading")}</div>
        </div>
      }
    >
      <MessagesInbox variant="landlord" />
    </Suspense>
  );
}
