import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateInvitationToken } from "@/lib/email-invitation";
import { sendCoApplicantInvitation } from "@/lib/email-co-applicant";

// Schéma pour créer plusieurs co-applicants en batch
const batchCoApplicantsSchema = z.object({
  coApplicants: z.array(
    z.object({
      name: z.string().min(1, "Le nom est requis"),
      email: z.string().email("Email invalide"),
      role: z.enum(["CO_TENANT", "GUARANTOR", "OTHER"]).default("CO_TENANT"),
    })
  ),
});

// POST - Créer plusieurs co-applicants en batch (depuis le formulaire d'application)
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
    const validatedData = batchCoApplicantsSchema.parse(body);

    // Vérifier que l'application existe et que l'utilisateur est le locataire principal
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        tenant: { include: { user: true } },
        listing: true,
        coApplicants: true, // Récupérer les co-applicants existants
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

    // Supprimer les co-applicants existants pour cette application (pour permettre la mise à jour)
    await prisma.coApplicant.deleteMany({
      where: { applicationId },
    });

    // Créer les nouveaux co-applicants
    const createdCoApplicants = [];

    for (const coAppData of validatedData.coApplicants) {
      // Vérifier qu'il n'y a pas déjà un co-applicant avec cet email
      const existing = await prisma.coApplicant.findFirst({
        where: {
          applicationId,
          email: coAppData.email,
        },
      });

      if (existing) {
        continue; // Skip si déjà existant
      }

      // Générer un token d'invitation
      const invitationToken = generateInvitationToken();

      const coApplicant = await prisma.coApplicant.create({
        data: {
          applicationId,
          name: coAppData.name,
          email: coAppData.email,
          role: coAppData.role,
          status: "INVITED",
          invitationToken,
          filledByPrimary: false,
        },
      });

      createdCoApplicants.push(coApplicant);

      // Envoyer l'email d'invitation
      await sendCoApplicantInvitation({
        email: coAppData.email,
        coApplicantName: coAppData.name,
        primaryTenantName: application.tenant.user.name || "Le locataire principal",
        listingTitle: application.listing.title,
        invitationToken: invitationToken,
        applicationId: applicationId,
      });
    }

    return NextResponse.json({
      success: true,
      coApplicants: createdCoApplicants,
      message: `${createdCoApplicants.length} invitation(s) envoyée(s)`,
    });
  } catch (error: any) {
    console.error("[Batch Create Co-Applicants] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de la création des co-applicants" },
      { status: 500 }
    );
  }
}

