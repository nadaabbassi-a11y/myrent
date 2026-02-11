import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateInvitationToken } from "@/lib/email-invitation";
import { sendCoApplicantInvitation } from "@/lib/email-co-applicant";

// Schéma pour ajouter un co-applicant
const addCoApplicantSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional().nullable(),
  role: z.enum(["CO_TENANT", "GUARANTOR", "OTHER"]).default("CO_TENANT"),
  fillForThem: z.boolean().default(false), // Option pour remplir les infos à leur place
});

// GET - Lister les co-applicants d'une application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'application existe et que l'utilisateur y a accès
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        tenant: { include: { user: true } },
        listing: { include: { landlord: { include: { user: true } } } },
        coApplicants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application introuvable" },
        { status: 404 }
      );
    }

    // Vérifier l'accès : soit le locataire principal, soit le propriétaire
    const isTenant = application.tenant.userId === user.id;
    const isLandlord = application.listing.landlord.userId === user.id;

    if (!isTenant && !isLandlord) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      coApplicants: application.coApplicants,
    });
  } catch (error: any) {
    console.error("[Get Co-Applicants] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des co-applicants" },
      { status: 500 }
    );
  }
}

// POST - Ajouter un co-applicant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = addCoApplicantSchema.parse(body);

    // Vérifier que l'application existe et que l'utilisateur est le locataire principal
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        tenant: { include: { user: true } },
        listing: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application introuvable" },
        { status: 404 }
      );
    }

    if (application.tenant.userId !== user.id) {
      return NextResponse.json(
        { error: "Seul le locataire principal peut ajouter des co-applicants" },
        { status: 403 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un co-applicant avec cet email (si email fourni)
    if (validatedData.email) {
      const existing = await prisma.coApplicant.findFirst({
        where: {
          applicationId,
          email: validatedData.email,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Un co-applicant avec cet email existe déjà" },
          { status: 400 }
        );
      }
    }

    // Créer le co-applicant
    let invitationToken: string | null = null;
    let status: "PENDING" | "INVITED" | "FILLED_BY_PRIMARY" = "PENDING";

    if (validatedData.fillForThem) {
      // Mode "remplir pour eux" - pas d'invitation, statut FILLED_BY_PRIMARY
      status = "FILLED_BY_PRIMARY";
    } else if (validatedData.email) {
      // Mode invitation - générer un token et envoyer un email
      invitationToken = generateInvitationToken();
      status = "INVITED";
    }

    const coApplicant = await prisma.coApplicant.create({
      data: {
        applicationId,
        name: validatedData.name,
        email: validatedData.email || null,
        role: validatedData.role,
        status,
        invitationToken,
        filledByPrimary: validatedData.fillForThem,
      },
      include: {
        application: {
          include: {
            listing: true,
            tenant: { include: { user: true } },
          },
        },
      },
    });

    // Envoyer l'email d'invitation si nécessaire
    if (validatedData.email && !validatedData.fillForThem && invitationToken) {
      await sendCoApplicantInvitation({
        email: validatedData.email,
        coApplicantName: validatedData.name,
        primaryTenantName: application.tenant.user.name || "Le locataire principal",
        listingTitle: application.listing.title,
        invitationToken: invitationToken,
        applicationId: applicationId,
      });
    } else if (validatedData.email && validatedData.fillForThem) {
      // Même si rempli par le principal, envoyer un email de vérification
      if (invitationToken) {
        // Générer un token pour la vérification
        invitationToken = generateInvitationToken();
        await prisma.coApplicant.update({
          where: { id: coApplicant.id },
          data: { invitationToken },
        });

        await sendCoApplicantInvitation({
          email: validatedData.email,
          coApplicantName: validatedData.name,
          primaryTenantName: application.tenant.user.name || "Le locataire principal",
          listingTitle: application.listing.title,
          invitationToken: invitationToken,
          applicationId: applicationId,
          isVerification: true, // Indique que c'est pour vérifier les infos remplies par le principal
        });
      }
    }

    return NextResponse.json({
      success: true,
      coApplicant,
      message: validatedData.fillForThem
        ? "Co-applicant ajouté. Un email de vérification sera envoyé."
        : validatedData.email
        ? "Invitation envoyée au co-applicant"
        : "Co-applicant ajouté (email requis pour l'invitation)",
    });
  } catch (error: any) {
    console.error("[Add Co-Applicant] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de l'ajout du co-applicant" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un co-applicant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const coApplicantId = searchParams.get("coApplicantId");

    if (!coApplicantId) {
      return NextResponse.json(
        { error: "ID du co-applicant requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'application existe et que l'utilisateur est le locataire principal
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        tenant: { include: { user: true } },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application introuvable" },
        { status: 404 }
      );
    }

    if (application.tenant.userId !== user.id) {
      return NextResponse.json(
        { error: "Seul le locataire principal peut supprimer des co-applicants" },
        { status: 403 }
      );
    }

    // Supprimer le co-applicant
    await prisma.coApplicant.delete({
      where: { id: coApplicantId },
    });

    return NextResponse.json({
      success: true,
      message: "Co-applicant supprimé",
    });
  } catch (error: any) {
    console.error("[Delete Co-Applicant] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du co-applicant" },
      { status: 500 }
    );
  }
}

