import { prisma } from "@/lib/prisma";
import {
  QUEBEC_PLATFORMS,
  QuebecPlatformId,
  SyndicationStatus,
} from "@/lib/syndication/platforms";
import { formatListingAd } from "@/lib/syndication/format-ad";

const FACEBOOK_PLATFORM: QuebecPlatformId = "facebook_marketplace";

export interface PlatformSyndicationState {
  platform: QuebecPlatformId;
  status: SyndicationStatus;
  externalUrl: string | null;
  publishedAt: string | null;
}

function listingToAdInput(listing: {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  area: string | null;
  address: string | null;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  petAllowed: boolean;
  deposit: number;
  minTerm: number;
  wifiIncluded: boolean;
  heatingIncluded: boolean;
  hotWaterIncluded: boolean;
  electricityIncluded: boolean;
  parkingIncluded: boolean;
}) {
  return listing;
}

export async function getListingSyndicationState(
  listingId: string,
  baseUrl: string
) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { syndications: true },
  });

  if (!listing) return null;

  const recordMap = new Map(
    listing.syndications.map((s) => [s.platform, s])
  );

  const platforms: PlatformSyndicationState[] = QUEBEC_PLATFORMS.map(
    (platform) => {
      const record = recordMap.get(platform.id);

      if (platform.id === FACEBOOK_PLATFORM && listing.marketplaceUrl) {
        return {
          platform: platform.id,
          status: "published" as SyndicationStatus,
          externalUrl: listing.marketplaceUrl,
          publishedAt:
            record?.publishedAt?.toISOString() ??
            listing.updatedAt.toISOString(),
        };
      }

      return {
        platform: platform.id,
        status: (record?.status as SyndicationStatus) ?? "pending",
        externalUrl: record?.externalUrl ?? null,
        publishedAt: record?.publishedAt?.toISOString() ?? null,
      };
    }
  );

  const publishedCount = platforms.filter((p) => p.status === "published").length;

  return {
    listing: {
      id: listing.id,
      title: listing.title,
      city: listing.city,
      area: listing.area,
      price: listing.price,
      status: listing.status,
    },
    adText: formatListingAd(listingToAdInput(listing), baseUrl),
    myrentUrl: `${baseUrl.replace(/\/$/, "")}/listings/${listing.id}`,
    platforms,
    publishedCount,
    totalPlatforms: QUEBEC_PLATFORMS.filter((p) => !p.brokerOnly).length,
  };
}

export async function updateListingSyndication(
  listingId: string,
  platformId: QuebecPlatformId,
  data: { status: SyndicationStatus; externalUrl?: string | null }
) {
  const now = data.status === "published" ? new Date() : null;

  const syndication = await prisma.listingSyndication.upsert({
    where: {
      listingId_platform: { listingId, platform: platformId },
    },
    create: {
      listingId,
      platform: platformId,
      status: data.status,
      externalUrl: data.externalUrl ?? null,
      publishedAt: now,
    },
    update: {
      status: data.status,
      externalUrl: data.externalUrl ?? null,
      publishedAt: now,
    },
  });

  if (platformId === FACEBOOK_PLATFORM && data.externalUrl !== undefined) {
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        marketplaceUrl: data.externalUrl,
        marketplaceAutoReplyEnabled: data.status === "published",
      },
    });
  }

  return syndication;
}
