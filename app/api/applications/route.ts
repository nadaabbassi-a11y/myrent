import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Role } from '@/lib/types';

const createApplicationSchema = z.object({
  listingId: z.string().min(1, 'ID de listing requis'),
  message: z.string().nullish(),
  incomeRange: z.string().nullish(),
  incomeShared: z.boolean().optional(),
  listingData: z.object({
    title: z.string(),
    price: z.number(),
    city: z.string(),
    area: z.string().nullish(),
    bedrooms: z.number(),
    bathrooms: z.number(),
    description: z.string().nullish(),
    furnished: z.boolean().optional(),
    petAllowed: z.boolean().optional(),
    minTerm: z.number().nullish(),
    maxTerm: z.number().nullish(),
    wifiIncluded: z.boolean().optional(),
    heatingIncluded: z.boolean().optional(),
    hotWaterIncluded: z.boolean().optional(),
    electricityIncluded: z.boolean().optional(),
    parkingIncluded: z.boolean().optional(),
    images: z.array(z.string()).nullish(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.TENANT);
    const body = await request.json();
    const validatedData = createApplicationSchema.parse(body);

    // Vérifier que le listing existe, sinon le créer (pour les listings de démo)
    let listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
    });

    if (!listing) {
      if (!validatedData.listingData) {
        return NextResponse.json(
          { error: 'Listing non trouvé et données de listing manquantes' },
          { status: 404 }
        );
      }

      // Créer un landlord de démo si nécessaire
      let demoLandlord = await prisma.landlordProfile.findFirst({
        where: { user: { email: 'demo@landlord.com' } },
        include: { user: true },
      });

      if (!demoLandlord) {
        // Créer un utilisateur de démo
        const demoUser = await prisma.user.upsert({
          where: { email: 'demo@landlord.com' },
          update: {},
          create: {
            email: 'demo@landlord.com',
            name: 'Propriétaire de démo',
            passwordHash: '$2a$10$demo', // Hash de démo - ne pas utiliser en production
            role: 'LANDLORD',
          },
        });

        // Créer le profil landlord
        demoLandlord = await prisma.landlordProfile.create({
          data: {
            userId: demoUser.id,
          },
          include: {
            user: true,
          },
        });
      }

      // Créer le listing avec les données fournies
      listing = await prisma.listing.create({
        data: {
          id: validatedData.listingId,
          title: validatedData.listingData.title,
          description: validatedData.listingData.description || '',
          price: validatedData.listingData.price,
          city: validatedData.listingData.city,
          area: validatedData.listingData.area || null,
          bedrooms: validatedData.listingData.bedrooms,
          bathrooms: validatedData.listingData.bathrooms,
          furnished: validatedData.listingData.furnished || false,
          petAllowed: validatedData.listingData.petAllowed || false,
          minTerm: validatedData.listingData.minTerm || 12,
          maxTerm: validatedData.listingData.maxTerm || null,
          wifiIncluded: validatedData.listingData.wifiIncluded || false,
          heatingIncluded: validatedData.listingData.heatingIncluded || false,
          hotWaterIncluded: validatedData.listingData.hotWaterIncluded || false,
          electricityIncluded: validatedData.listingData.electricityIncluded || false,
          images: validatedData.listingData.images ? JSON.stringify(validatedData.listingData.images) : null,
          landlordId: demoLandlord.id,
          status: 'active',
        },
      });
    }

    // Récupérer ou créer le profil locataire
    let tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      // Créer le profil locataire s'il n'existe pas
      tenantProfile = await prisma.tenantProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Vérifier si l'utilisateur a déjà postulé à ce listing
    const existingApplication = await prisma.application.findFirst({
      where: {
        listingId: validatedData.listingId,
        tenantId: tenantProfile.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Vous avez déjà postulé à ce logement' },
        { status: 400 }
      );
    }

    // Créer la candidature
    const application = await prisma.application.create({
      data: {
        listingId: validatedData.listingId,
        tenantId: tenantProfile.id,
        message: validatedData.message,
        incomeRange: validatedData.incomeRange,
        incomeShared: validatedData.incomeShared || false,
        status: 'pending',
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });

    // Créer un thread de messages pour cette candidature (s'il n'existe pas déjà)
    try {
      await prisma.messageThread.create({
        data: {
          applicationId: application.id,
        },
      });
    } catch (threadError: any) {
      // Si le thread existe déjà, ce n'est pas grave, on continue
      if (threadError?.code !== 'P2002') {
        // Si c'est une autre erreur, on la log mais on continue quand même
        console.warn('Erreur lors de la création du thread de messages:', threadError);
      }
    }

    return NextResponse.json(
      { 
        message: 'Candidature créée avec succès',
        application 
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
        { error: 'Accès non autorisé. Vous devez être un locataire pour postuler.' },
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

    console.error('Erreur lors de la création de la candidature:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la candidature' },
      { status: 500 }
    );
  }
}

