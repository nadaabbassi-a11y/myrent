import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Vérifier une invitation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
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
        landlord: {
          select: {
            name: true,
            email: true,
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

    return NextResponse.json({
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        listing: invitation.listing,
        landlord: invitation.landlord,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("[Verify Invitation] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de l'invitation" },
      { status: 500 }
    );
  }
}

