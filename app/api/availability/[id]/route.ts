import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// DELETE - Supprimer une disponibilité (propriétaire uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: slotId } = await params;

    if (user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer la disponibilité avec l'annonce
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
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
      },
    });

    if (!slot) {
      return NextResponse.json(
        { error: "Disponibilité introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que le propriétaire possède cette annonce
    if (slot.listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Vérifier si la disponibilité est réservée
    if (slot.isBooked) {
      return NextResponse.json(
        { error: "Impossible de supprimer une disponibilité réservée" },
        { status: 400 }
      );
    }

    // Supprimer la disponibilité
    await prisma.availabilitySlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Availability DELETE] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la disponibilité" },
      { status: 500 }
    );
  }
}

