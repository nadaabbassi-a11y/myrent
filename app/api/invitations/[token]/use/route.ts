import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const useInvitationSchema = z.object({
  applicationId: z.string().optional().nullable(),
});

// POST - Utiliser une invitation (créer l'application si nécessaire)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { applicationId } = useInvitationSchema.parse(body);

    // Vérifier que l'utilisateur est connecté
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour utiliser cette invitation" },
        { status: 401 }
      );
    }

    if (user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Cette invitation est réservée aux locataires" },
        { status: 403 }
      );
    }

    // Récupérer l'invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        listing: {
          include: {
            landlord: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation introuvable" },
        { status: 404 }
      );
    }

    if (invitation.used) {
      return NextResponse.json(
        { error: "Cette invitation a déjà été utilisée" },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "Cette invitation a expiré" },
        { status: 400 }
      );
    }

    // Vérifier que l'email correspond
    if (invitation.email !== user.email) {
      return NextResponse.json(
        { error: "Cette invitation est destinée à un autre email" },
        { status: 403 }
      );
    }

    // Récupérer le profil locataire
    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      return NextResponse.json(
        { error: "Profil locataire introuvable" },
        { status: 404 }
      );
    }

    // Vérifier s'il y a déjà une application
    let application;
    if (applicationId) {
      application = await prisma.application.findUnique({
        where: { id: applicationId },
      });
    } else {
      application = await prisma.application.findFirst({
        where: {
          listingId: invitation.listingId,
          tenantId: tenantProfile.id,
        },
      });
    }

    // Si pas d'application, en créer une
    if (!application) {
      application = await prisma.application.create({
        data: {
          listingId: invitation.listingId,
          tenantId: tenantProfile.id,
          landlordId: invitation.landlordId,
          status: "DRAFT",
        },
      });
    }

    // Marquer l'invitation comme utilisée
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        used: true,
        usedAt: new Date(),
        applicationId: application.id,
      },
    });

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: "Invitation utilisée avec succès",
    });
  } catch (error: any) {
    console.error("[Use Invitation] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de l'utilisation de l'invitation" },
      { status: 500 }
    );
  }
}

