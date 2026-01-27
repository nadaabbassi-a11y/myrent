import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Seuls les LANDLORDS peuvent voir leurs applications
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

    // Récupérer tous les listings du landlord
    const listings = await prisma.listing.findMany({
      where: {
        landlordId: landlordProfile.id,
      },
      select: {
        id: true,
      },
    });

    const listingIds = listings.map((l) => l.id);

    if (listingIds.length === 0) {
      return NextResponse.json({
        applications: [],
      });
    }

    // Récupérer toutes les applications pour ces listings
    const applications = await prisma.application.findMany({
      where: {
        listingId: {
          in: listingIds,
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            address: true,
            city: true,
            area: true,
          },
        },
        tenant: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return NextResponse.json({
      applications: applications.map((app) => ({
        id: app.id,
        status: app.status,
        message: app.message,
        appliedAt: app.appliedAt,
        listing: {
          id: app.listing.id,
          title: app.listing.title,
          price: app.listing.price,
          address: app.listing.address || `${app.listing.area || ''}, ${app.listing.city}`.trim(),
        },
        tenant: {
          user: {
            name: app.tenant.user.name,
            email: app.tenant.user.email,
          },
        },
      })),
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des applications:', error);

    if (error.statusCode === 401 || error.statusCode === 403) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des applications' },
      { status: 500 }
    );
  }
}

