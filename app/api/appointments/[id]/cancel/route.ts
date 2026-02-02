import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const appointmentId = params.id;

    // Récupérer l'appointment avec les relations nécessaires
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        tenant: true,
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

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment introuvable' },
        { status: 404 }
      );
    }

    // Vérifier les permissions : le tenant peut annuler son propre appointment,
    // le landlord peut annuler les appointments de ses listings
    const isTenant = user.role === 'TENANT' && appointment.tenantId === user.id;
    const isLandlord =
      user.role === 'LANDLORD' &&
      appointment.listing.landlord.userId === user.id;

    if (!isTenant && !isLandlord) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission d\'annuler cet appointment' },
        { status: 403 }
      );
    }

    // Vérifier que l'appointment n'est pas déjà annulé ou complété
    if (appointment.status === 'CANCELED') {
      return NextResponse.json(
        { error: 'Cet appointment est déjà annulé' },
        { status: 400 }
      );
    }

    // Transaction pour annuler l'appointment et libérer le slot
    await prisma.$transaction(async (tx) => {
      // Annuler l'appointment
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CANCELED' },
      });

      // Libérer le slot
      await tx.availabilitySlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });
    });

    return NextResponse.json({
      message: 'Appointment annulé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'annulation de l\'appointment:', error);

    if (error.statusCode === 401 || error.statusCode === 403) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de l\'appointment' },
      { status: 500 }
    );
  }
}


