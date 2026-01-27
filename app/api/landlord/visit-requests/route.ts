import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/types';

// GET - Récupérer les demandes de visite pour les listings du propriétaire
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.LANDLORD);

    // Récupérer le profil propriétaire
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      return NextResponse.json(
        { error: 'Profil propriétaire non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer toutes les demandes de visite pour les listings du propriétaire
    const visitRequests = await prisma.visitRequest.findMany({
      where: {
        listing: {
          landlordId: landlordProfile.id,
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            price: true,
            images: true,
          },
        },
        tenant: {
          select: {
            id: true,
            phone: true,
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
        createdAt: 'desc',
      },
    });

    // Parser les images
    const formattedRequests = visitRequests.map((request) => ({
      ...request,
      listing: {
        ...request.listing,
        images: request.listing.images ? JSON.parse(request.listing.images) : [],
      },
    }));

    return NextResponse.json(
      { visitRequests: formattedRequests },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Vous devez être un propriétaire.' },
        { status: 403 }
      );
    }

    console.error('Erreur lors de la récupération des demandes de visite:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des demandes de visite' },
      { status: 500 }
    );
  }
}

