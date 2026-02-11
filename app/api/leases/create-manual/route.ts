import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Role } from "@/lib/types";

const createManualLeaseSchema = z.object({
  listingId: z.string().min(1, "L'ID de l'annonce est requis"),
  tenantEmail: z.string().email("Email invalide"),
  tenantId: z.string().optional(),
  startDate: z.string().datetime("Date de début invalide"),
  endDate: z.string().datetime("Date de fin invalide"),
  monthlyRent: z.number().positive("Le loyer mensuel doit être positif"),
  deposit: z.number().min(0, "La caution ne peut pas être négative"),
  terms: z.string().min(1, "Les conditions sont requises"),
});

// POST - Créer un bail manuellement sans application (pour baux existants importés)
export async function POST(request: NextRequest) {
  try {
    const landlord = await requireRole(request, Role.LANDLORD);

    const body = await request.json();
    const validatedData = createManualLeaseSchema.parse(body);

    // Vérifier que l'annonce appartient au propriétaire
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
      include: {
        landlord: { include: { user: true } },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce introuvable" },
        { status: 404 }
      );
    }

    if (listing.landlord.userId !== landlord.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Trouver le locataire
    let tenant;
    if (validatedData.tenantId) {
      tenant = await prisma.tenantProfile.findUnique({
        where: { id: validatedData.tenantId },
        include: { user: true },
      });
    } else {
      const user = await prisma.user.findUnique({
        where: { email: validatedData.tenantEmail },
        include: { tenantProfile: true },
      });

      if (!user || user.role !== "TENANT") {
        return NextResponse.json(
          {
            error: "Locataire introuvable. Veuillez inviter le locataire à créer un compte d'abord.",
            requiresSignup: true,
          },
          { status: 404 }
        );
      }

      tenant = user.tenantProfile;
    }

    if (!tenant) {
      return NextResponse.json(
        { error: "Profil locataire introuvable" },
        { status: 404 }
      );
    }

    // Créer une application minimale pour le bail (optionnel mais utile pour la cohérence)
    const application = await prisma.application.create({
      data: {
        listingId: validatedData.listingId,
        tenantId: tenant.id,
        landlordId: listing.landlordId,
        status: "ACCEPTED", // Directement acceptée car le bail existe déjà
        // Pas d'appointmentId - bail manuel
      },
    });

    // Créer le bail
    const lease = await prisma.lease.create({
      data: {
        applicationId: application.id,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        monthlyRent: validatedData.monthlyRent,
        deposit: validatedData.deposit,
        terms: validatedData.terms,
        status: "FINALIZED", // Bail déjà finalisé si importé
        landlordInfo: {
          name: listing.landlord.user.name || "",
          email: listing.landlord.user.email,
          phone: listing.landlord.phone || "",
        },
        propertyInfo: {
          address: listing.address || "",
          city: listing.city,
          area: listing.area || "",
          postalCode: listing.postalCode || "",
        },
        leaseTerms: {
          monthlyRent: validatedData.monthlyRent,
          deposit: validatedData.deposit,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
        },
        finalizedAt: new Date(), // Bail déjà finalisé
      },
    });

    return NextResponse.json({
      success: true,
      lease: {
        id: lease.id,
        status: lease.status,
        applicationId: application.id,
        leaseUrl: `/landlord/leases/${lease.id}`,
        rentManagementUrl: `/landlord/rent-management/${lease.id}`,
      },
    });
  } catch (error: any) {
    console.error("[Create Manual Lease] Error:", error);

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

