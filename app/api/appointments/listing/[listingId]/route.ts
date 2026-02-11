import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer le rendez-vous d'un locataire pour un listing spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    if (user.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Seuls les locataires peuvent voir leurs rendez-vous' },
        { status: 403 }
      );
    }

    // Chercher un rendez-vous actif (non annulé) pour ce listing et ce tenant
    // Note: tenantId dans Appointment fait référence à User.id, pas TenantProfile.id
    const appointment = await prisma.appointment.findFirst({
      where: {
        listingId: params.listingId,
        tenantId: user.id,
        status: {
          not: 'CANCELED',
        },
      },
      include: {
        slot: {
          select: {
            startAt: true,
            endAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!appointment) {
      return NextResponse.json({ appointment: null });
    }

    return NextResponse.json({
      appointment: {
        id: appointment.id,
        status: appointment.status,
        startAt: appointment.slot.startAt.toISOString(),
        endAt: appointment.slot.endAt.toISOString(),
        createdAt: appointment.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rendez-vous' },
      { status: 500 }
    );
  }
}

