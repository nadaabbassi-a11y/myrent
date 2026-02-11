import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Seuls les TENANTS peuvent voir leurs appointments
    const user = await requireRole(request, 'TENANT');

    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId: user.id,
        // Ne pas filtrer par statut - retourner tous les appointments
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
        application: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        slot: {
          startAt: 'asc',
        },
      },
    });

    console.log(`[API /me/appointments] Found ${appointments.length} appointments for user ${user.id}`);
    console.log(`[API /me/appointments] Statuses:`, appointments.map(a => a.status));

    return NextResponse.json({
      appointments: appointments.map((apt) => ({
        id: apt.id,
        listingId: apt.listingId,
        listingTitle: apt.listing.title,
        listingAddress: apt.listing.address || `${apt.listing.area || ''}, ${apt.listing.city}`.trim(),
        slotId: apt.slotId,
        startAt: apt.slot.startAt.toISOString(),
        endAt: apt.slot.endAt.toISOString(),
        status: apt.status,
        createdAt: apt.createdAt.toISOString(),
        updatedAt: apt.updatedAt.toISOString(),
        hasApplication: !!apt.application,
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

