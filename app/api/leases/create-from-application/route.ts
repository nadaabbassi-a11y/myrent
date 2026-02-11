import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Role } from "@/lib/types";

const createLeaseFromApplicationSchema = z.object({
  applicationId: z.string().min(1, "L'ID de l'application est requis"),
  startDate: z.string().datetime("Date de début invalide"),
  endDate: z.string().datetime("Date de fin invalide"),
  monthlyRent: z.number().positive("Le loyer mensuel doit être positif"),
  deposit: z.number().min(0, "La caution ne peut pas être négative"),
  terms: z.string().min(1, "Les conditions sont requises"),
});

// POST - Créer un bail directement depuis une application acceptée
export async function POST(request: NextRequest) {
  try {
    const landlord = await requireRole(request, Role.LANDLORD);

    const body = await request.json();
    const validatedData = createLeaseFromApplicationSchema.parse(body);

    // Récupérer l'application
    const application = await prisma.application.findUnique({
      where: { id: validatedData.applicationId },
      include: {
        listing: {
          include: {
            landlord: {
              include: {
                user: true,
              },
            },
          },
        },
        tenant: { include: { user: true } },
        lease: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'application appartient au propriétaire
    if (application.listing.landlord.user.id !== landlord.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Vérifier que l'application est acceptée
    if (application.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "L'application doit être acceptée pour créer un bail" },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un bail pour cette application
    if (application.lease) {
      return NextResponse.json(
        { 
          error: "Un bail existe déjà pour cette application",
          leaseId: application.lease.id,
        },
        { status: 400 }
      );
    }

    // Créer le bail
    const lease = await prisma.lease.create({
      data: {
        applicationId: validatedData.applicationId,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        monthlyRent: validatedData.monthlyRent,
        deposit: validatedData.deposit,
        terms: validatedData.terms,
        status: "DRAFT",
        // Pré-remplir les informations depuis l'application
        landlordInfo: {
          name: application.listing.landlord.user.name || "",
          email: application.listing.landlord.user.email,
          phone: application.listing.landlord.phone || "",
        },
        propertyInfo: {
          address: application.listing.address || "",
          city: application.listing.city,
          area: application.listing.area || "",
          postalCode: application.listing.postalCode || "",
        },
        leaseTerms: {
          monthlyRent: validatedData.monthlyRent,
          deposit: validatedData.deposit,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
        },
      },
      include: {
        application: {
          include: {
            tenant: { include: { user: true } },
            listing: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      lease: {
        id: lease.id,
        status: lease.status,
        applicationId: lease.applicationId,
        leaseUrl: `/landlord/leases/${lease.id}`,
      },
    });
  } catch (error: any) {
    console.error("[Create Lease From Application] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de la création du bail" },
      { status: 500 }
    );
  }
}

