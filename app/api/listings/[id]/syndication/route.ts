import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/types";
import {
  getListingSyndicationState,
  updateListingSyndication,
} from "@/lib/syndication/service";
import { getPlatformById, QuebecPlatformId } from "@/lib/syndication/platforms";

function getBaseUrl(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    request.nextUrl.origin
  );
}

async function assertListingOwnership(listingId: string, userId: string) {
  const landlordProfile = await prisma.landlordProfile.findUnique({
    where: { userId },
  });

  if (!landlordProfile) {
    return { error: "Profil propriétaire non trouvé", status: 404 as const };
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, landlordId: landlordProfile.id },
  });

  if (!listing) {
    return { error: "Annonce non trouvée", status: 404 as const };
  }

  return { listing };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, Role.LANDLORD);
    const ownership = await assertListingOwnership(params.id, user.id);

    if ("error" in ownership) {
      return NextResponse.json(
        { error: ownership.error },
        { status: ownership.status }
      );
    }

    const state = await getListingSyndicationState(
      params.id,
      getBaseUrl(request)
    );

    return NextResponse.json(state);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("GET syndication:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

const updateSchema = z.object({
  platform: z.string(),
  status: z.enum(["pending", "published"]),
  externalUrl: z
    .union([z.string().url(), z.literal(""), z.null()])
    .optional()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, Role.LANDLORD);
    const ownership = await assertListingOwnership(params.id, user.id);

    if ("error" in ownership) {
      return NextResponse.json(
        { error: ownership.error },
        { status: ownership.status }
      );
    }

    const body = updateSchema.parse(await request.json());
    const platform = getPlatformById(body.platform);

    if (!platform) {
      return NextResponse.json(
        { error: "Plateforme invalide" },
        { status: 400 }
      );
    }

    if (platform.brokerOnly) {
      return NextResponse.json(
        { error: "Cette plateforme nécessite un courtier" },
        { status: 400 }
      );
    }

    await updateListingSyndication(params.id, platform.id as QuebecPlatformId, {
      status: body.status,
      externalUrl: body.externalUrl,
    });

    const state = await getListingSyndicationState(
      params.id,
      getBaseUrl(request)
    );

    return NextResponse.json(state);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("PUT syndication:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
