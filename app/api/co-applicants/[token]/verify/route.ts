import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Vérifier une invitation de co-applicant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const coApplicant = await prisma.coApplicant.findUnique({
      where: { invitationToken: token },
      include: {
        application: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                price: true,
                city: true,
                area: true,
              },
            },
            tenant: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
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

    return NextResponse.json({
      valid: true,
      coApplicant: {
        id: coApplicant.id,
        name: coApplicant.name,
        email: coApplicant.email,
        role: coApplicant.role,
        status: coApplicant.status,
        filledByPrimary: coApplicant.filledByPrimary,
        application: coApplicant.application,
      },
    });
  } catch (error: any) {
    console.error("[Verify Co-Applicant Invitation] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de l'invitation" },
      { status: 500 }
    );
  }
}

