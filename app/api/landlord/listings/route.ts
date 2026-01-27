import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/types';

// GET - Get landlord's own listings
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.LANDLORD);

    // Find landlord profile
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      return NextResponse.json(
        { error: 'Profil propriétaire non trouvé' },
        { status: 404 }
      );
    }

    // Get all listings for this landlord
    const listings = await prisma.listing.findMany({
      where: {
        landlordId: landlordProfile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format listings
    const formattedListings = listings.map((listing) => {
      let images: string[] = [];
      if (listing.images) {
        try {
          images = JSON.parse(listing.images);
        } catch (e) {
          images = [];
        }
      }

      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        address: listing.address,
        city: listing.city,
        area: listing.area,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        furnished: listing.furnished,
        petAllowed: listing.petAllowed,
        minTerm: listing.minTerm,
        maxTerm: listing.maxTerm,
        deposit: listing.deposit,
        wifiIncluded: listing.wifiIncluded,
        heatingIncluded: listing.heatingIncluded,
        hotWaterIncluded: listing.hotWaterIncluded,
        electricityIncluded: listing.electricityIncluded,
        images: images,
        status: listing.status,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      };
    });

    return NextResponse.json(
      { listings: formattedListings },
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

    console.error('Erreur lors de la récupération des annonces:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

