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
    const { slotId, datetime, listingId: providedListingId } = body;

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

      // Si listingId est fourni, l'utiliser directement
      if (providedListingId) {
        const listing = await prisma.listing.findUnique({
          where: { id: providedListingId },
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

        listingId = listing.id;
        landlordId = listing.landlord.userId;

        // Vérifier si un slot de 15 min existe déjà pour ce créneau
        const existing15MinSlot = await prisma.availabilitySlot.findFirst({
          where: {
            listingId: listing.id,
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
              listingId: listing.id,
              startAt: slotDateTime,
              endAt: slotEnd,
              isBooked: false,
            },
          });
        }
      } else {
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
    const slotEnd = new Date(slot.endAt);
    
    if (slotStart < new Date()) {
      return NextResponse.json(
        { error: "Ce créneau est dans le passé" },
        { status: 400 }
      );
    }

    // Vérifier que le locataire n'a pas déjà un autre rendez-vous à la même plage horaire
    // Note: tenantId dans Appointment fait référence à User.id, pas TenantProfile.id
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        tenantId: user.id, // Utiliser user.id directement
        status: {
          not: "CANCELED", // Ne pas compter les rendez-vous annulés
        },
        slot: {
          OR: [
            // Chevauchement : le début du nouveau slot est dans un slot existant
            {
              startAt: { lte: slotStart },
              endAt: { gt: slotStart },
            },
            // Chevauchement : la fin du nouveau slot est dans un slot existant
            {
              startAt: { lt: slotEnd },
              endAt: { gte: slotEnd },
            },
            // Chevauchement : le nouveau slot contient complètement un slot existant
            {
              startAt: { gte: slotStart },
              endAt: { lte: slotEnd },
            },
            // Chevauchement : le nouveau slot chevauche complètement un slot existant
            {
              startAt: { lte: slotStart },
              endAt: { gte: slotEnd },
            },
          ],
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
          },
        },
        slot: {
          select: {
            startAt: true,
            endAt: true,
          },
        },
      },
    });

    if (conflictingAppointment) {
      const conflictingDate = new Date(conflictingAppointment.slot.startAt);
      const conflictingTime = conflictingDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const conflictingDateStr = conflictingDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      
      const listingAddress = conflictingAppointment.listing.address 
        ? `${conflictingAppointment.listing.address}, ${conflictingAppointment.listing.city}`
        : conflictingAppointment.listing.city;
      
      return NextResponse.json(
        { 
          error: `Vous avez déjà un rendez-vous le ${conflictingDateStr} à ${conflictingTime} pour l'annonce "${conflictingAppointment.listing.title}" (${listingAddress}). Vous ne pouvez pas réserver deux visites au même moment. Veuillez choisir un autre créneau horaire.` 
        },
        { status: 400 }
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
      where: { id: slot.id },
      data: { isBooked: true },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error: any) {
    console.error("[Appointment POST] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création du rendez-vous" },
      { status: 500 }
    );
  }
}
