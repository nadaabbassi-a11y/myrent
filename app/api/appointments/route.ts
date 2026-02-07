import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST - Créer une demande de rendez-vous (locataire choisit une disponibilité)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (user.role !== "TENANT") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { slotId } = body;

    if (!slotId) {
      return NextResponse.json(
        { error: "L'ID du créneau est requis" },
        { status: 400 }
      );
    }

    // Récupérer le créneau avec l'annonce
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
        { error: "Créneau introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que le créneau n'est pas déjà réservé
    if (slot.isBooked) {
      return NextResponse.json(
        { error: "Ce créneau est déjà réservé" },
        { status: 400 }
      );
    }

    // Vérifier que le créneau est dans le futur
    if (new Date(slot.startAt) < new Date()) {
      return NextResponse.json(
        { error: "Ce créneau est dans le passé" },
        { status: 400 }
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

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        listingId: slot.listingId,
        slotId: slot.id,
        tenantId: user.id,
        landlordId: slot.listing.landlord.userId,
        status: "REQUESTED",
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
        slot: true,
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Marquer le créneau comme réservé
    await prisma.availabilitySlot.update({
      where: { id: slotId },
      data: { isBooked: true },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("[Appointment POST] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du rendez-vous" },
      { status: 500 }
    );
  }
}
