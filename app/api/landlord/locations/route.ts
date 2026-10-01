import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/types";
import { z } from "zod";
import { buildPipeline } from "@/lib/location-pipeline";

const createLocationSchema = z.object({
  address: z.string().min(3, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  postalCode: z.string().optional(),
  rent: z.number().positive("Le loyer doit être positif"),
  bedrooms: z.number().int().min(0).optional().default(2),
  bathrooms: z.number().int().min(1).optional().default(1),
  deposit: z.number().min(0).optional(),
});

function serializeLocation(listing: {
  id: string;
  title: string;
  address: string | null;
  city: string;
  postalCode: string | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  deposit: number;
  applications: Array<{
    id: string;
    status: string;
    createdAt: Date;
    steps: { stepKey: string; isComplete: boolean }[];
    consents: { type: string }[];
    creditCheck: { status: string } | null;
    lease: { id: string; status: string } | null;
    payments: { status: string }[];
    tenant: { user: { name: string | null; email: string } };
  }>;
}) {
  const application = listing.applications[0] ?? null;
  return {
    id: listing.id,
    title: listing.title,
    address: listing.address,
    city: listing.city,
    postalCode: listing.postalCode,
    rent: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    deposit: listing.deposit,
    tenant: application
      ? {
          name: application.tenant.user.name,
          email: application.tenant.user.email,
        }
      : null,
    applicationId: application?.id ?? null,
    applicationStatus: application?.status ?? null,
    pipeline: buildPipeline({ application }),
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.LANDLORD);
    const profile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ locations: [] });
    }

    const listings = await prisma.listing.findMany({
      where: { landlordId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            steps: true,
            consents: true,
            creditCheck: true,
            lease: { include: { payments: true } },
            tenant: { include: { user: { select: { name: true, email: true } } } },
          },
        },
      },
    });

    return NextResponse.json({
      locations: listings.map((listing) =>
        serializeLocation({
          ...listing,
          applications: listing.applications.map((app) => ({
            ...app,
            payments: app.lease?.payments ?? [],
          })),
        })
      ),
    });
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[locations GET]", error);
    return NextResponse.json({ error: "Impossible de charger les locations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.LANDLORD);
    const body = createLocationSchema.parse(await request.json());

    let profile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.landlordProfile.create({
        data: { userId: user.id },
      });
    }

    const title = `${body.bedrooms === 0 ? "Studio" : `${body.bedrooms} 1/2`} · ${body.city}`;
    const listing = await prisma.listing.create({
      data: {
        title,
        description: `Logement situé au ${body.address}, ${body.city}.`,
        price: body.rent,
        city: body.city,
        address: body.address,
        postalCode: body.postalCode || null,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        deposit: body.deposit ?? body.rent,
        landlordId: profile.id,
        status: "active",
      },
    });

    return NextResponse.json({
      location: {
        id: listing.id,
        title: listing.title,
        address: listing.address,
        city: listing.city,
        rent: listing.price,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }
    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("[locations POST]", error);
    return NextResponse.json({ error: "Impossible de créer le logement" }, { status: 500 });
  }
}
