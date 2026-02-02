import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const landlordId = params.id;

    // Récupérer le profil landlord avec ses informations
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: {
        id: landlordId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        listings: {
          where: {
            status: 'active',
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!landlordProfile) {
      return NextResponse.json(
        { error: 'Propriétaire non trouvé' },
        { status: 404 }
      );
    }

    // Formater les listings
    const formattedListings = landlordProfile.listings.map((listing) => {
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
        city: listing.city,
        area: listing.area,
        address: listing.address,
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
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      };
    });

    // Formater les données du propriétaire
    const formattedLandlord = {
      id: landlordProfile.id,
      name: landlordProfile.user.name || landlordProfile.user.email,
      email: landlordProfile.user.email,
      phone: landlordProfile.phone,
      company: landlordProfile.company,
      image: landlordProfile.user.image,
      createdAt: landlordProfile.createdAt,
      listingsCount: formattedListings.length,
      listings: formattedListings,
    };

    return NextResponse.json(
      { landlord: formattedLandlord },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération du propriétaire:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du propriétaire' },
      { status: 500 }
    );
  }
}


