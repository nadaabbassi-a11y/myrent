import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Seuls les LANDLORDS peuvent voir leurs appointments
    const user = await requireRole(request, 'LANDLORD');

    // Récupérer le landlord profile
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      return NextResponse.json(
        { error: 'Profil propriétaire introuvable' },
        { status: 404 }
      );
    }

    // Récupérer tous les appointments pour les listings du landlord
    const appointments = await prisma.appointment.findMany({
      where: {
        landlordId: user.id,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            area: true,
          },
        },
        slot: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        slot: {
          startAt: 'asc',
        },
      },
    });

    return NextResponse.json({
      appointments: appointments.map((apt) => ({
        id: apt.id,
        listingId: apt.listingId,
        listingTitle: apt.listing.title,
        listingAddress: apt.listing.address || `${apt.listing.area || ''}, ${apt.listing.city}`.trim(),
        slotId: apt.slotId,
        startAt: apt.slot.startAt,
        endAt: apt.slot.endAt,
        status: apt.status,
        tenant: {
          id: apt.tenant.id,
          name: apt.tenant.name,
          email: apt.tenant.email,
        },
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des appointments:', error);

    if (error.statusCode === 401 || error.statusCode === 403) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des appointments' },
      { status: 500 }
    );
  }
}

