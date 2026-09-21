export type LandlordPillar = "advertise" | "paperwork" | "management";

export interface LandlordPillarConfig {
  id: LandlordPillar;
  href: string;
  labelKey: string;
  descriptionKey: string;
}

export const LANDLORD_PILLARS: LandlordPillarConfig[] = [
  {
    id: "advertise",
    href: "/landlord/advertise",
    labelKey: "landlordNav.advertise",
    descriptionKey: "landlordNav.advertiseDesc",
  },
  {
    id: "paperwork",
    href: "/landlord/paperwork",
    labelKey: "landlordNav.paperwork",
    descriptionKey: "landlordNav.paperworkDesc",
  },
  {
    id: "management",
    href: "/landlord/management",
    labelKey: "landlordNav.management",
    descriptionKey: "landlordNav.managementDesc",
  },
];

const PILLAR_PATHS: Record<LandlordPillar, string[]> = {
  advertise: [
    "/landlord/advertise",
    "/landlord/publish",
    "/landlord/pipeline",
    "/landlord/listings",
    "/landlord/visits",
    "/landlord/appointments",
    "/landlord/availability",
    "/landlord/messages",
  ],
  paperwork: [
    "/landlord/paperwork",
    "/landlord/applications",
    "/landlord/leases",
    "/landlord/quick-actions",
  ],
  management: [
    "/landlord/management",
    "/landlord/rent-management",
  ],
};

export function getActiveLandlordPillar(pathname: string): LandlordPillar | null {
  if (pathname === "/landlord/dashboard") return "advertise";

  for (const [pillar, paths] of Object.entries(PILLAR_PATHS) as [
    LandlordPillar,
    string[],
  ][]) {
    if (paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return pillar;
    }
  }

  return null;
}

export function shouldShowLandlordNav(pathname: string): boolean {
  if (!pathname.startsWith("/landlord")) return false;
  // Profil public propriétaire : /landlord/[uuid]
  if (/^\/landlord\/[a-f0-9-]{36}$/i.test(pathname)) return false;
  return (
    getActiveLandlordPillar(pathname) !== null ||
    pathname === "/landlord/profile" ||
    pathname === "/landlord/dashboard"
  );
}
