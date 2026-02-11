import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Utiliser une invitation de co-applicant (lier le compte utilisateur)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
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

    // Récupérer le co-applicant
    const coApplicant = await prisma.coApplicant.findUnique({
      where: { invitationToken: token },
      include: {
        application: {
          include: {
            listing: true,
          },
        },
      },
    });

    if (!coApplicant) {
      return NextResponse.json(
        { error: "Invitation introuvable" },
        { status: 404 }
      );
    }

    if (coApplicant.status === "COMPLETED" || coApplicant.status === "VERIFIED") {
      return NextResponse.json(
        { error: "Cette invitation a déjà été utilisée" },
        { status: 400 }
      );
    }

    // Vérifier l'expiration (7 jours)
    const createdAt = new Date(coApplicant.createdAt);
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + 7);

    if (new Date() > expiresAt) {
      return NextResponse.json(
        { error: "Cette invitation a expiré" },
        { status: 400 }
      );
    }

    // Vérifier que l'email correspond (si email fourni)
    if (coApplicant.email && coApplicant.email !== user.email) {
      return NextResponse.json(
        { error: "Cette invitation est destinée à un autre email" },
        { status: 403 }
      );
    }

    // Lier le compte utilisateur au co-applicant
    await prisma.coApplicant.update({
      where: { id: coApplicant.id },
      data: {
        userId: user.id,
        status: coApplicant.filledByPrimary ? "VERIFIED" : "INVITED", // Si rempli par le principal, passer à VERIFIED, sinon INVITED
      },
    });

    return NextResponse.json({
      success: true,
      coApplicantId: coApplicant.id,
      applicationId: coApplicant.applicationId,
      message: "Invitation utilisée avec succès",
    });
  } catch (error: any) {
    console.error("[Use Co-Applicant Invitation] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'utilisation de l'invitation" },
      { status: 500 }
    );
  }
}

