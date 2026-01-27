import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Seuls les LANDLORDS peuvent confirmer des appointments
    const user = await requireRole(request, 'LANDLORD');

    const appointmentId = params.id;

    // Récupérer l'appointment avec les relations nécessaires
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
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que le landlord est le propriétaire du listing
    if (appointment.listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de confirmer cet appointment' },
        { status: 403 }
      );
    }

    // Vérifier que l'appointment peut être confirmé
    if (appointment.status === 'CANCELED') {
      return NextResponse.json(
        { error: 'Impossible de confirmer un appointment annulé' },
        { status: 400 }
      );
    }

    if (appointment.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Cet appointment est déjà confirmé' },
        { status: 400 }
      );
    }

    // Confirmer l'appointment
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
    });

    return NextResponse.json({
      message: 'Appointment confirmé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la confirmation de l\'appointment:', error);

    if (error.statusCode === 401 || error.statusCode === 403) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la confirmation de l\'appointment' },
      { status: 500 }
    );
  }
}

