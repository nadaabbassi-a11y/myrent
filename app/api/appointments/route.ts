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
    const { slotId, datetime } = body;

    if (!slotId && !datetime) {
      return NextResponse.json(
        { error: "L'ID du créneau ou la date/heure est requise" },
        { status: 400 }
      );
    }

    let slot: any;
    let listingId: string;
    let landlordId: string;

    if (datetime) {
      // Créer un slot de 15 minutes à partir de la date/heure
      const slotDateTime = new Date(datetime);
      const slotEnd = new Date(slotDateTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + 15);

      // Récupérer l'annonce à partir des disponibilités existantes
      const existingSlots = await prisma.availabilitySlot.findMany({
        where: {
          startAt: { lte: slotDateTime },
          endAt: { gte: slotEnd },
        },
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

      // Trouver le slot parent qui contient ce créneau
      const parentSlot = existingSlots.find((s) => {
        const start = new Date(s.startAt);
        const end = new Date(s.endAt);
        return slotDateTime >= start && slotEnd <= end;
      });

      if (!parentSlot || !parentSlot.listing) {
        return NextResponse.json(
          { error: "Aucune disponibilité trouvée pour ce créneau" },
          { status: 404 }
        );
      }

      listingId = parentSlot.listingId;
      landlordId = parentSlot.listing.landlord.userId;

      // Vérifier si un slot de 15 min existe déjà pour ce créneau
      const existing15MinSlot = await prisma.availabilitySlot.findFirst({
        where: {
          listingId: parentSlot.listingId,
          startAt: slotDateTime,
          endAt: slotEnd,
        },
      });

      if (existing15MinSlot) {
        if (existing15MinSlot.isBooked) {
          return NextResponse.json(
            { error: "Ce créneau est déjà réservé" },
            { status: 400 }
          );
        }
        slot = existing15MinSlot;
      } else {
        // Créer un nouveau slot de 15 minutes
        slot = await prisma.availabilitySlot.create({
          data: {
            listingId: parentSlot.listingId,
            startAt: slotDateTime,
            endAt: slotEnd,
            isBooked: false,
          },
        });
      }
    } else {
      // Utiliser le slot existant
      slot = await prisma.availabilitySlot.findUnique({
        where: { id: slotId! },
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

      if (!slot.listing) {
        return NextResponse.json(
          { error: "Annonce introuvable" },
          { status: 404 }
        );
      }

      listingId = slot.listingId;
      landlordId = slot.listing.landlord.userId;
    }

    // Vérifier que le créneau n'est pas déjà réservé
    if (slot.isBooked) {
      return NextResponse.json(
        { error: "Ce créneau est déjà réservé" },
        { status: 400 }
      );
    }

    // Vérifier que le créneau est dans le futur
    const slotStart = new Date(slot.startAt);
    if (slotStart < new Date()) {
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
        listingId: listingId,
        slotId: slot.id,
        tenantId: user.id,
        landlordId: landlordId,
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
