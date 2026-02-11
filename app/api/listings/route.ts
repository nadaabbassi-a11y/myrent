import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Role } from '@/lib/types';
import { geocodeAddressWithFallback } from '@/lib/geocode';
import { isValidCanadianPostalCode, validateAddressForGeocoding } from '@/lib/address-validation';

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

// Schéma de validation pour le code postal canadien
const postalCodeSchema = z.string().refine(
  (val) => !val || val.trim() === '' || isValidCanadianPostalCode(val),
  { message: 'Le code postal doit être au format canadien (ex: A1A 1A1)' }
).optional();

const createListingSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number().positive('Le prix doit être positif'),
  city: z.string().min(1, 'La ville est requise'),
  area: z.string().nullish(),
  address: z.string().min(1, 'L\'adresse est requise'),
  postalCode: postalCodeSchema,
  latitude: z.number().min(41.7).max(83.1).optional(),
  longitude: z.number().min(-141.0).max(-52.6).optional(),
  bedrooms: z.number().int().min(0).optional().default(0),
  bathrooms: z.number().int().min(1).optional().default(1),
  furnished: z.boolean().optional().default(false),
  petAllowed: z.boolean().optional().default(false),
  wifiIncluded: z.boolean().optional().default(false),
  heatingIncluded: z.boolean().optional().default(false),
  hotWaterIncluded: z.boolean().optional().default(false),
  electricityIncluded: z.boolean().optional().default(false),
  squareFootage: z.number().positive().nullable().optional(),
  pool: z.boolean().optional().default(false),
  gym: z.boolean().optional().default(false),
  recreationRoom: z.boolean().optional().default(false),
  elevator: z.boolean().optional().default(false),
  parkingIncluded: z.boolean().optional().default(false),
  parkingPaid: z.boolean().optional().default(false),
  washerDryer: z.boolean().optional().default(false),
  airConditioning: z.boolean().optional().default(false),
  balcony: z.boolean().optional().default(false),
  yard: z.boolean().optional().default(false),
  dishwasher: z.boolean().optional().default(false),
  refrigerator: z.boolean().optional().default(false),
  oven: z.boolean().optional().default(false),
  microwave: z.boolean().optional().default(false),
  freezer: z.boolean().optional().default(false),
  stove: z.boolean().optional().default(false),
  storage: z.boolean().optional().default(false),
  security: z.boolean().optional().default(false),
  wheelchairAccessible: z.boolean().optional().default(false),
  images: z.array(imageUrlSchema).optional().default([]),
  model3dUrl: z.union([imageUrlSchema, z.string().length(0), z.null()]).optional(),
  panoramaUrl: z.union([imageUrlSchema, z.string().length(0), z.null()]).optional(),
  matterportUrl: z.union([imageUrlSchema, z.string().length(0), z.null()]).optional(),
  sketchfabUrl: z.union([imageUrlSchema, z.string().length(0), z.null()]).optional(),
  marketplaceUrl: z.string().url().optional().nullable(),
  marketplaceId: z.string().optional().nullable(),
  marketplaceAutoMessage: z.string().optional().nullable(),
  marketplaceAutoReplyEnabled: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.LANDLORD);

    const body = await request.json();
    console.log('Données reçues:', body);
    
    // Validation et transformation des données
    const validatedData = createListingSchema.parse(body);
    console.log('Données validées:', validatedData);

    // Récupérer ou créer le profil landlord
    let landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      // Créer le profil landlord s'il n'existe pas
      landlordProfile = await prisma.landlordProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Valider l'adresse pour le géocodage
    const addressValidation = validateAddressForGeocoding(
      validatedData.address,
      validatedData.city,
      validatedData.area || undefined,
      validatedData.postalCode || undefined
    );

    if (!addressValidation.isValid) {
      return NextResponse.json(
        { error: addressValidation.error },
        { status: 400 }
      );
    }

    // Préparer les données pour la création
    const listingData: any = {
      title: validatedData.title,
      description: validatedData.description,
      price: validatedData.price,
      city: validatedData.city,
      area: validatedData.area || null,
      address: validatedData.address,
      postalCode: validatedData.postalCode || null,
      bedrooms: validatedData.bedrooms ?? 0,
      bathrooms: validatedData.bathrooms ?? 1,
      furnished: validatedData.furnished ?? false,
      petAllowed: validatedData.petAllowed ?? false,
      wifiIncluded: validatedData.wifiIncluded ?? false,
      heatingIncluded: validatedData.heatingIncluded ?? false,
      hotWaterIncluded: validatedData.hotWaterIncluded ?? false,
      electricityIncluded: validatedData.electricityIncluded ?? false,
      squareFootage: validatedData.squareFootage ?? null,
      pool: validatedData.pool ?? false,
      gym: validatedData.gym ?? false,
      recreationRoom: validatedData.recreationRoom ?? false,
      elevator: validatedData.elevator ?? false,
      parkingIncluded: validatedData.parkingIncluded ?? false,
      parkingPaid: validatedData.parkingPaid ?? false,
      washerDryer: validatedData.washerDryer ?? false,
      airConditioning: validatedData.airConditioning ?? false,
      balcony: validatedData.balcony ?? false,
      yard: validatedData.yard ?? false,
      dishwasher: validatedData.dishwasher ?? false,
      refrigerator: validatedData.refrigerator ?? false,
      oven: validatedData.oven ?? false,
      microwave: validatedData.microwave ?? false,
      freezer: validatedData.freezer ?? false,
      stove: validatedData.stove ?? false,
      storage: validatedData.storage ?? false,
      security: validatedData.security ?? false,
      wheelchairAccessible: validatedData.wheelchairAccessible ?? false,
      landlordId: landlordProfile.id,
      status: 'active',
    };

    // Ajouter les images (stockées en JSON)
    if (validatedData.images && validatedData.images.length > 0) {
      listingData.images = JSON.stringify(validatedData.images);
    }

    // Ajouter les URLs 3D (trim et null si vide)
    if (validatedData.model3dUrl && validatedData.model3dUrl.trim()) {
      listingData.model3dUrl = validatedData.model3dUrl.trim();
    }
    if (validatedData.panoramaUrl && validatedData.panoramaUrl.trim()) {
      listingData.panoramaUrl = validatedData.panoramaUrl.trim();
    }
    if (validatedData.matterportUrl && validatedData.matterportUrl.trim()) {
      listingData.matterportUrl = validatedData.matterportUrl.trim();
    }
    if (validatedData.sketchfabUrl && validatedData.sketchfabUrl.trim()) {
      listingData.sketchfabUrl = validatedData.sketchfabUrl.trim();
    }

    // Ajouter les informations Marketplace
    if (validatedData.marketplaceUrl) {
      listingData.marketplaceUrl = validatedData.marketplaceUrl;
    }
    if (validatedData.marketplaceId) {
      listingData.marketplaceId = validatedData.marketplaceId;
    }
    if (validatedData.marketplaceAutoMessage !== undefined) {
      listingData.marketplaceAutoMessage = validatedData.marketplaceAutoMessage;
    }
    listingData.marketplaceAutoReplyEnabled = validatedData.marketplaceAutoReplyEnabled ?? false;

    // Utiliser les coordonnées fournies directement (depuis l'autocomplétion) ou géocoder
    if (validatedData.latitude && validatedData.longitude) {
      // Coordonnées fournies directement depuis l'autocomplétion
      listingData.latitude = validatedData.latitude;
      listingData.longitude = validatedData.longitude;
      console.log('Coordonnées utilisées directement:', { latitude: validatedData.latitude, longitude: validatedData.longitude });
    } else if (validatedData.address || validatedData.city || validatedData.postalCode) {
      // Géocodification de l'adresse si les coordonnées ne sont pas fournies
      try {
        const geocodeResult = await geocodeAddressWithFallback(
          validatedData.address || '',
          validatedData.city,
          validatedData.area || undefined,
          validatedData.postalCode ? validatedData.postalCode : undefined
        );
        if (geocodeResult) {
          listingData.latitude = geocodeResult.latitude;
          listingData.longitude = geocodeResult.longitude;
          console.log('Coordonnées géocodifiées:', geocodeResult);
        } else {
          console.warn('Impossible de géocoder l\'adresse:', validatedData.address);
        }
      } catch (error) {
        console.error('Erreur lors de la géocodification:', error);
        // Continuer sans coordonnées si la géocodification échoue
      }
    }

    // Créer le listing
    const listing = await prisma.listing.create({
      data: listingData,
    });

    return NextResponse.json(
      { 
        message: 'Annonce créée avec succès',
        listing 
      },
      { status: 201 }
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
        { error: 'Accès non autorisé. Vous devez être un propriétaire pour créer une annonce.' },
        { status: 403 }
      );
    }
    if (error instanceof z.ZodError) {
      console.error('Erreur de validation:', error.errors);
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors, message: errorMessages },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création de l\'annonce:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'annonce' },
      { status: 500 }
    );
  }
}

// GET - Récupérer tous les listings actifs
export async function GET(request: NextRequest) {
  try {
    console.log('[Listings API] Début de la récupération des listings');
    
    // Requête simplifiée avec timeout intégré
    const listings = await Promise.race([
      prisma.listing.findMany({
        where: {
          status: 'active',
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          city: true,
          area: true,
          address: true,
          postalCode: true,
          bedrooms: true,
          bathrooms: true,
          furnished: true,
          petAllowed: true,
          minTerm: true,
          maxTerm: true,
          deposit: true,
          wifiIncluded: true,
          heatingIncluded: true,
          hotWaterIncluded: true,
          electricityIncluded: true,
          images: true,
          model3dUrl: true,
          panoramaUrl: true,
          matterportUrl: true,
          sketchfabUrl: true,
          latitude: true,
          longitude: true,
          landlordId: true,
          createdAt: true,
          updatedAt: true,
          landlord: {
            select: {
              id: true,
              userId: true,
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
        take: 100, // Limiter à 100 résultats pour éviter les blocages
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.error('[Listings API] Timeout déclenché après 5 secondes');
          reject(new Error('Timeout: La requête a pris trop de temps'));
        }, 5000);
      }),
    ]);
    
    console.log('[Listings API] Requête réussie,', listings.length, 'listings trouvés');

    // Transformer les données pour le frontend
    const formattedListings = listings.map((listing) => {
      let images: string[] = [];
      if (listing.images) {
        try {
          images = JSON.parse(listing.images);
        } catch (e) {
          // Si le parsing échoue, utiliser un tableau vide
          images = [];
        }
      }

      // Récupérer le nom du propriétaire (avec gestion sécurisée des valeurs null/undefined)
      const landlordName = listing.landlord?.user?.name || listing.landlord?.user?.email || 'Propriétaire';
      
      // Log pour déboguer (seulement si les données existent)
      if (!listing.landlord) {
        console.warn(`Listing ${listing.id} n'a pas de landlord associé`);
      } else if (!listing.landlord.user) {
        console.warn(`Listing ${listing.id} n'a pas de user associé au landlord`);
      } else {
        console.log(`Listing ${listing.id} - Propriétaire: ${landlordName} (name: ${listing.landlord.user.name || 'N/A'}, email: ${listing.landlord.user.email || 'N/A'})`);
      }

      return {
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
        parkingIncluded: false, // Non disponible dans le schéma actuel
        images: images,
        model3dUrl: listing.model3dUrl,
        panoramaUrl: listing.panoramaUrl,
        matterportUrl: listing.matterportUrl,
        sketchfabUrl: listing.sketchfabUrl,
        latitude: listing.latitude,
        longitude: listing.longitude,
        landlordId: listing.landlordId,
        landlordName: landlordName,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      };
    });

    return NextResponse.json(
      { 
        listings: formattedListings 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Listings API] Erreur lors de la récupération des listings:', error);
    console.error('[Listings API] Détails de l\'erreur:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: error?.stack,
    });
    
    // Gérer spécifiquement les timeouts
    if (error?.message && error.message.includes('Timeout')) {
      return NextResponse.json(
        { 
          error: 'Le chargement prend trop de temps. Veuillez réessayer.',
          listings: [],
        },
        { status: 504 }
      );
    }
    
    // Gérer les erreurs Prisma
    if (error?.code === 'P2002' || error?.code?.startsWith('P')) {
      console.error('[Listings API] Erreur Prisma:', error.code, error.meta);
    }
    
    return NextResponse.json(
      { 
        error: 'Une erreur est survenue lors de la récupération des annonces',
        listings: [],
        details: process.env.NODE_ENV === 'development' ? (error?.message || String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}

