import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les créneaux de 15 minutes disponibles pour une annonce
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;
    
    // Récupérer toutes les disponibilités de l'annonce
    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where: {
        listingId,
      },
      include: {
        appointment: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    // Récupérer tous les rendez-vous confirmés pour vérifier les créneaux réservés
    const confirmedAppointments = await prisma.appointment.findMany({
      where: {
        listingId,
        status: "CONFIRMED",
      },
      include: {
        slot: true,
      },
    });

    // Créer un Set des créneaux réservés (datetime exact)
    const reservedTimeSlots = new Set<string>();
    confirmedAppointments.forEach((appointment) => {
      const slotStart = new Date(appointment.slot.startAt).toISOString();
      reservedTimeSlots.add(slotStart);
    });

    // Générer des créneaux de 15 minutes à partir des disponibilités
    const timeSlots: Array<{
      id: string;
      date: string; // YYYY-MM-DD
      time: string; // HH:mm
      datetime: string; // ISO string
      isAvailable: boolean;
      isBooked: boolean;
    }> = [];

    const now = new Date();
    now.setMinutes(0, 0, 0); // Arrondir à l'heure

    availabilitySlots.forEach((slot) => {
      const startDate = new Date(slot.startAt);
      const endDate = new Date(slot.endAt);
      
      // Générer des créneaux de 15 minutes
      let currentTime = new Date(startDate);
      
      while (currentTime < endDate) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + 15);
        
        // Ne pas créer de créneaux dans le passé
        if (currentTime > now) {
          const dateStr = currentTime.toISOString().split('T')[0];
          const timeStr = currentTime.toTimeString().split(' ')[0].substring(0, 5);
          const slotDateTime = currentTime.toISOString();
          
          // Vérifier si ce créneau spécifique de 15 minutes est réservé
          // Un créneau est réservé seulement si un slot de 15 minutes exact existe et est confirmé
          const isSlotBooked = reservedTimeSlots.has(slotDateTime);
          
          timeSlots.push({
            id: `${slot.id}-${slotDateTime}`,
            date: dateStr,
            time: timeStr,
            datetime: slotDateTime,
            isAvailable: !isSlotBooked,
            isBooked: isSlotBooked,
          });
        }
        
        // Passer au créneau suivant (15 minutes plus tard)
        currentTime = new Date(slotEnd);
      }
    });

    // Grouper par date
    const slotsByDate: Record<string, Array<{
      id: string;
      time: string;
      datetime: string;
      isAvailable: boolean;
      isBooked: boolean;
    }>> = {};

    timeSlots.forEach((slot) => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push({
        id: slot.id,
        time: slot.time,
        datetime: slot.datetime,
        isAvailable: slot.isAvailable,
        isBooked: slot.isBooked,
      });
    });

    // Trier les créneaux par heure pour chaque date
    Object.keys(slotsByDate).forEach((date) => {
      slotsByDate[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    return NextResponse.json({ 
      slotsByDate,
      dates: Object.keys(slotsByDate).sort(),
    });
  } catch (error) {
    console.error("[Time Slots GET] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des créneaux" },
      { status: 500 }
    );
  }
}
