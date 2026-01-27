import { NextRequest, NextResponse } from 'next/server';
import { requireRole, getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Role } from '@/lib/types';
import { geocodeAddressWithFallback } from '@/lib/geocode';
import { isValidCanadianPostalCode, validateAddressForGeocoding } from '@/lib/address-validation';

// Schéma de validation pour le code postal canadien
const postalCodeSchema = z.string().refine(
  (val) => !val || val.trim() === '' || isValidCanadianPostalCode(val),
  { message: 'Le code postal doit être au format canadien (ex: A1A 1A1)' }
).optional();

// Schéma pour accepter les URLs absolues ou les chemins relatifs
const imageUrlSchema = z.string().refine(
  (val) => {
    if (!val || val.trim() === '') return true; // Vide est accepté
    // Accepter les URLs absolues (http://, https://)
    if (val.startsWith('http://') || val.startsWith('https://')) {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }
    // Accepter les chemins relatifs qui commencent par /
    if (val.startsWith('/')) {
      return true;
    }
    return false;
  },
  { message: 'Doit être une URL valide (http://, https://) ou un chemin relatif (commençant par /)' }
);

const updateListingSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').optional(),
  description: z.string().min(1, 'La description est requise').optional(),
  price: z.number().positive('Le prix doit être positif').optional(),
  city: z.string().min(1, 'La ville est requise').optional(),
  area: z.string().nullish().optional(),
  address: z.string().min(1, 'L\'adresse est requise').optional(),
  postalCode: postalCodeSchema,
  latitude: z.number().min(41.7).max(83.1).optional(),
  longitude: z.number().min(-141.0).max(-52.6).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(1).optional(),
  furnished: z.boolean().optional(),
  petAllowed: z.boolean().optional(),
  wifiIncluded: z.boolean().optional(),
  heatingIncluded: z.boolean().optional(),
  hotWaterIncluded: z.boolean().optional(),
  electricityIncluded: z.boolean().optional(),
  images: z.array(imageUrlSchema).optional(),
  model3dUrl: z.union([imageUrlSchema, z.string().length(0), z.null()]).optional(),
  panoramaUrl: z.union([imageUrlSchema, z.string().length(0), z.null()]).optional(),
  matterportUrl: z.union([imageUrlSchema, z.string().length(0), z.null()]).optional(),
  sketchfabUrl: z.union([imageUrlSchema, z.string().length(0), z.null()]).optional(),
});

// GET - Public: Get single listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
        status: 'active',
      },
      include: {
        landlord: {
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
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing non trouvé' },
        { status: 404 }
      );
    }

    // Parser les images
    let images: string[] = [];
    if (listing.images) {
      try {
        images = JSON.parse(listing.images);
      } catch (e) {
        images = [];
      }
    }

    // Formater les données pour le frontend
    const formattedListing = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      city: listing.city,
      area: listing.area,
      address: listing.address,
      postalCode: listing.postalCode,
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
      parkingIncluded: false,
      images: images,
      model3dUrl: listing.model3dUrl,
      panoramaUrl: listing.panoramaUrl,
      matterportUrl: listing.matterportUrl,
      sketchfabUrl: listing.sketchfabUrl,
      latitude: listing.latitude,
      longitude: listing.longitude,
      landlordId: listing.landlordId,
      landlordName: listing.landlord?.user?.name || listing.landlord?.user?.email || 'Propriétaire',
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };

    return NextResponse.json(
      { listing: formattedListing },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération du listing:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du listing' },
      { status: 500 }
    );
  }
}

// PATCH - LANDLORD only: Update own listing
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, Role.LANDLORD);
    const listingId = params.id;

    // Vérifier que le listing existe et appartient au landlord
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        landlord: {
          select: { userId: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing non trouvé' },
        { status: 404 }
      );
    }

    if (listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez modifier que vos propres annonces' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateListingSchema.parse(body);

    // Préparer les données pour la mise à jour
    const updateData: any = {};
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.city !== undefined) updateData.city = validatedData.city;
    if (validatedData.area !== undefined) updateData.area = validatedData.area;
    if (validatedData.address !== undefined) updateData.address = validatedData.address;
    if (validatedData.postalCode !== undefined) updateData.postalCode = validatedData.postalCode || null;
    if (validatedData.bedrooms !== undefined) updateData.bedrooms = validatedData.bedrooms;
    if (validatedData.bathrooms !== undefined) updateData.bathrooms = validatedData.bathrooms;
    if (validatedData.furnished !== undefined) updateData.furnished = validatedData.furnished;
    if (validatedData.petAllowed !== undefined) updateData.petAllowed = validatedData.petAllowed;
    if (validatedData.wifiIncluded !== undefined) updateData.wifiIncluded = validatedData.wifiIncluded;
    if (validatedData.heatingIncluded !== undefined) updateData.heatingIncluded = validatedData.heatingIncluded;
    if (validatedData.hotWaterIncluded !== undefined) updateData.hotWaterIncluded = validatedData.hotWaterIncluded;
    if (validatedData.electricityIncluded !== undefined) updateData.electricityIncluded = validatedData.electricityIncluded;

    // Gérer les images (stockées en JSON)
    if (validatedData.images !== undefined) {
      updateData.images = JSON.stringify(validatedData.images);
    }

    // Gérer les URLs 3D (trim et null si vide)
    if (validatedData.model3dUrl !== undefined) {
      updateData.model3dUrl = validatedData.model3dUrl && validatedData.model3dUrl.trim() ? validatedData.model3dUrl.trim() : null;
    }
    if (validatedData.panoramaUrl !== undefined) {
      updateData.panoramaUrl = validatedData.panoramaUrl && validatedData.panoramaUrl.trim() ? validatedData.panoramaUrl.trim() : null;
    }
    if (validatedData.matterportUrl !== undefined) {
      updateData.matterportUrl = validatedData.matterportUrl && validatedData.matterportUrl.trim() ? validatedData.matterportUrl.trim() : null;
    }
    if (validatedData.sketchfabUrl !== undefined) {
      updateData.sketchfabUrl = validatedData.sketchfabUrl && validatedData.sketchfabUrl.trim() ? validatedData.sketchfabUrl.trim() : null;
    }

    // Utiliser les coordonnées fournies directement (depuis l'autocomplétion) ou géocoder
    if (validatedData.latitude && validatedData.longitude) {
      // Coordonnées fournies directement depuis l'autocomplétion
      updateData.latitude = validatedData.latitude;
      updateData.longitude = validatedData.longitude;
      console.log('Coordonnées utilisées directement (mise à jour):', { latitude: validatedData.latitude, longitude: validatedData.longitude });
    } else {
      // Valider l'adresse pour le géocodage si des champs d'adresse sont modifiés
      const addressChanged = validatedData.address !== undefined || validatedData.city !== undefined || validatedData.area !== undefined || validatedData.postalCode !== undefined;
      if (addressChanged) {
        const addressToGeocode = validatedData.address !== undefined ? validatedData.address : listing.address || '';
        const cityToGeocode = validatedData.city !== undefined ? validatedData.city : listing.city;
        const areaToGeocode = validatedData.area !== undefined ? validatedData.area : listing.area || undefined;
        const postalCodeToGeocode = validatedData.postalCode !== undefined 
          ? (validatedData.postalCode || null)
          : (listing.postalCode || null);

        // Valider l'adresse
        const addressValidation = validateAddressForGeocoding(
          addressToGeocode || undefined,
          cityToGeocode || undefined,
          areaToGeocode,
          postalCodeToGeocode
        );

        if (!addressValidation.isValid) {
          return NextResponse.json(
            { error: addressValidation.error },
            { status: 400 }
          );
        }

        if (addressToGeocode || cityToGeocode || postalCodeToGeocode) {
          try {
            const geocodeResult = await geocodeAddressWithFallback(
              addressToGeocode || '',
              cityToGeocode || undefined,
              areaToGeocode,
              postalCodeToGeocode ? postalCodeToGeocode : undefined
            );
            if (geocodeResult) {
              updateData.latitude = geocodeResult.latitude;
              updateData.longitude = geocodeResult.longitude;
              console.log('Coordonnées géocodifiées (mise à jour):', geocodeResult);
            } else {
              console.warn('Impossible de géocoder l\'adresse:', addressToGeocode);
            }
          } catch (error) {
            console.error('Erreur lors de la géocodification:', error);
            // Continuer sans coordonnées si la géocodification échoue
          }
        }
      }
    }

    // Mettre à jour le listing
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: 'Annonce mise à jour avec succès',
        listing: updatedListing,
      },
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
        { error: 'Accès non autorisé. Vous devez être un propriétaire pour modifier une annonce.' },
        { status: 403 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l\'annonce' },
      { status: 500 }
    );
  }
}

// DELETE - LANDLORD only: Delete own listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, Role.LANDLORD);
    const listingId = params.id;

    // Vérifier que le listing existe et appartient au landlord
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        landlord: {
          select: { userId: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing non trouvé' },
        { status: 404 }
      );
    }

    if (listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez supprimer que vos propres annonces' },
        { status: 403 }
      );
    }

    // Supprimer le listing
    await prisma.listing.delete({
      where: { id: listingId },
    });

    return NextResponse.json(
      { message: 'Annonce supprimée avec succès' },
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
        { error: 'Accès non autorisé. Vous devez être un propriétaire pour supprimer une annonce.' },
        { status: 403 }
      );
    }

    console.error('Erreur lors de la suppression de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l\'annonce' },
      { status: 500 }
    );
  }
}
