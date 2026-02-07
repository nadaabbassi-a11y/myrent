import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST - Créer des disponibilités récurrentes
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: listingId } = await params;

    if (user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      type,
      startDate,
      endDate,
      startTime,
      endTime,
      weekdays,
      monthDays,
      interval,
    } = body;

    if (!startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Les dates et heures sont requises" },
        { status: 400 }
      );
    }

    // Vérifier que le propriétaire possède cette annonce
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

    if (listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: "La date de fin doit être après la date de début" },
        { status: 400 }
      );
    }

    const slots: Array<{ listingId: string; startAt: Date; endAt: Date; isBooked: boolean }> = [];
    const currentDate = new Date(startDateTime);
    const finalEndDate = new Date(endDateTime);

    // Générer les dates selon le type de récurrence
    while (currentDate <= finalEndDate) {
      let shouldCreateSlot = false;

      switch (type) {
        case "daily":
          // Tous les X jours
          const daysDiff = Math.floor((currentDate.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));
          shouldCreateSlot = daysDiff % interval === 0;
          break;

        case "weekly":
          // Jours de la semaine spécifiques, toutes les X semaines
          if (weekdays && weekdays.length > 0) {
            const dayOfWeek = currentDate.getDay();
            if (weekdays.includes(dayOfWeek)) {
              const weeksDiff = Math.floor((currentDate.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24 * 7));
              shouldCreateSlot = weeksDiff % interval === 0;
            }
          } else {
            // Si aucun jour sélectionné, utiliser tous les jours
            const weeksDiff = Math.floor((currentDate.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24 * 7));
            shouldCreateSlot = weeksDiff % interval === 0;
          }
          break;

        case "monthly":
          // Jours du mois spécifiques, tous les X mois
          if (monthDays && monthDays.length > 0) {
            const dayOfMonth = currentDate.getDate();
            if (monthDays.includes(dayOfMonth)) {
              const monthsDiff = (currentDate.getFullYear() - startDateTime.getFullYear()) * 12 + 
                                (currentDate.getMonth() - startDateTime.getMonth());
              shouldCreateSlot = monthsDiff % interval === 0;
            }
          } else {
            // Si aucun jour sélectionné, utiliser le même jour du mois
            const dayOfMonth = currentDate.getDate();
            const startDayOfMonth = startDateTime.getDate();
            if (dayOfMonth === startDayOfMonth) {
              const monthsDiff = (currentDate.getFullYear() - startDateTime.getFullYear()) * 12 + 
                                (currentDate.getMonth() - startDateTime.getMonth());
              shouldCreateSlot = monthsDiff % interval === 0;
            }
          }
          break;

        case "custom":
          // Pour l'instant, traiter comme quotidien
          const customDaysDiff = Math.floor((currentDate.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));
          shouldCreateSlot = customDaysDiff % interval === 0;
          break;
      }

      if (shouldCreateSlot) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMinute, 0, 0);
        
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(endHour, endMinute, 0, 0);

        // Ne créer que si la date est dans le futur ou aujourd'hui
        if (slotStart >= new Date()) {
          slots.push({
            listingId,
            startAt: slotStart,
            endAt: slotEnd,
            isBooked: false,
          });
        }
      }

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (slots.length === 0) {
      return NextResponse.json(
        { error: "Aucune disponibilité générée avec ces paramètres" },
        { status: 400 }
      );
    }

    // Créer tous les slots en une seule transaction
    const createdSlots = await prisma.$transaction(
      slots.map((slot) =>
        prisma.availabilitySlot.create({
          data: slot,
        })
      )
    );

    return NextResponse.json(
      {
        count: createdSlots.length,
        slots: createdSlots,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Recurring Availability POST] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création des disponibilités récurrentes" },
      { status: 500 }
    );
  }
}

