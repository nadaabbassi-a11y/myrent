import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST - Proposer un créneau personnalisé (locataire)
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
    const { listingId, proposedDate, proposedStartTime, proposedEndTime, message } = body;

    if (!listingId || !proposedDate || !proposedStartTime || !proposedEndTime) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'annonce existe
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        landlord: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce introuvable" },
        { status: 404 }
      );
    }

    // Créer une date/heure complète
    const startDateTime = new Date(`${proposedDate}T${proposedStartTime}`);
    const endDateTime = new Date(`${proposedDate}T${proposedEndTime}`);

    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: "L'heure de fin doit être après l'heure de début" },
        { status: 400 }
      );
    }

    if (startDateTime < new Date()) {
      return NextResponse.json(
        { error: "La date proposée ne peut pas être dans le passé" },
        { status: 400 }
      );
    }

    // Créer un slot de disponibilité temporaire pour cette proposition
    const slot = await prisma.availabilitySlot.create({
      data: {
        listingId,
        startAt: startDateTime,
        endAt: endDateTime,
        isBooked: false,
      },
    });

    // Créer un rendez-vous avec le statut "PROPOSED" pour indiquer que c'est une proposition
    const appointment = await prisma.appointment.create({
      data: {
        listingId,
        slotId: slot.id,
        tenantId: user.id,
        landlordId: listing.landlord.userId,
        status: "PROPOSED",
        message: message || null,
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

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("[Propose Appointment POST] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la proposition du créneau" },
      { status: 500 }
    );
  }
}

