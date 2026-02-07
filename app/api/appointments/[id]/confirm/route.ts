import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// POST - Confirmer ou refuser un rendez-vous (propriétaire uniquement)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: appointmentId } = await params;

    if (user.role !== "LANDLORD") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body; // "confirm" ou "reject"

    if (!action || !["confirm", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action invalide. Utilisez 'confirm' ou 'reject'" },
        { status: 400 }
      );
    }

    // Récupérer le rendez-vous
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
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
        slot: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Rendez-vous introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que le propriétaire possède cette annonce
    if (appointment.listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Mettre à jour le statut
    // Gérer les statuts PROPOSED, REQUESTED, CONFIRMED, REJECTED
    let newStatus: string;
    if (action === "confirm") {
      newStatus = "CONFIRMED";
      // Marquer le slot comme réservé
      await prisma.availabilitySlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: true },
      });
    } else {
      newStatus = "REJECTED";
      // Libérer le créneau
      await prisma.availabilitySlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });
    }
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: newStatus },
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

    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error) {
    console.error("[Appointment Confirm] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du rendez-vous" },
      { status: 500 }
    );
  }
}
