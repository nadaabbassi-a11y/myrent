"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone, FileStack, Wallet } from "lucide-react";
import { useLanguageContext } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  getActiveLandlordPillar,
  LANDLORD_PILLARS,
  type LandlordPillar,
} from "@/lib/landlord-nav";
import { cn } from "@/lib/utils";

const PILLAR_ICONS: Record<LandlordPillar, typeof Megaphone> = {
  advertise: Megaphone,
  paperwork: FileStack,
  management: Wallet,
};

function getPillarBadgeCount(
  pillar: LandlordPillar,
  notifications: { messages: number; visitRequests: number; applications: number }
): number {
  switch (pillar) {
    case "advertise":
      return notifications.messages + notifications.visitRequests;
    case "paperwork":
      return notifications.applications;
    case "management":
      return 0;
  }
}

export function LandlordNav() {
  const pathname = usePathname();
  const { t } = useLanguageContext();
  const { notifications } = useNotifications();
  const activePillar = getActiveLandlordPillar(pathname);

  return (
    <div className="border-b border-neutral-200 bg-neutral-50/80">
      <div className="container mx-auto px-6">
        <nav className="flex gap-1 max-w-4xl" aria-label={t("landlordNav.ariaLabel")}>
          {LANDLORD_PILLARS.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.id];
            const isActive = activePillar === pillar.id;
            const badgeCount = getPillarBadgeCount(pillar.id, notifications);

            return (
              <Link
                key={pillar.id}
                href={pillar.href}
                className={cn(
                  "relative flex items-center gap-2.5 px-5 py-4 text-sm font-medium transition-colors border-b-2 -mb-px",
                  isActive
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{t(pillar.labelKey)}</span>
                {badgeCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
