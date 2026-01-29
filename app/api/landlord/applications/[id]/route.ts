import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET - Détails d'une candidature pour le propriétaire (avec réponses complètes)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, 'LANDLORD');
    const applicationId = params.id;

    // Récupérer le profil propriétaire
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      return NextResponse.json(
        { error: 'Profil propriétaire introuvable' },
        { status: 404 }
      );
    }

    // Récupérer la candidature avec toutes les données nécessaires
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            area: true,
            price: true,
            landlordId: true,
          },
        },
        appointment: {
          include: {
            slot: {
              select: {
                startAt: true,
                endAt: true,
              },
            },
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
        steps: {
          orderBy: {
            stepKey: 'asc',
          },
        },
        answers: {
          orderBy: {
            stepKey: 'asc',
          },
        },
        consents: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Candidature introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que le propriétaire est bien le propriétaire du listing
    if (application.listing.landlordId && application.listing.landlordId !== landlordProfile.id) {
      // Par sécurité, on refait une requête légère pour vérifier
      const listing = await prisma.listing.findUnique({
        where: { id: application.listingId },
        select: { landlordId: true },
      });

      if (!listing || listing.landlordId !== landlordProfile.id) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: 403 }
        );
      }
    }

    // Formater la réponse (similaire à l'API locataire mais avec infos locataire)
    const response = {
      id: application.id,
      status: application.status,
      listing: application.listing,
      tenant: {
        user: application.tenant.user,
      },
      appointment: application.appointment
        ? {
            id: application.appointment.id,
            slot: application.appointment.slot,
          }
        : null,
      steps: application.steps.map((step) => ({
        stepKey: step.stepKey,
        isComplete: step.isComplete,
        updatedAt: step.updatedAt,
      })),
      answers: application.answers.reduce(
        (acc, answer) => {
          acc[answer.stepKey] = answer.data;
          return acc;
        },
        {} as Record<string, any>
      ),
      consents: application.consents.map((consent) => ({
        type: consent.type,
        textVersion: consent.textVersion,
        acceptedAt: consent.acceptedAt,
      })),
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: error.message === 'UNAUTHORIZED' ? 401 : 403 }
      );
    }

    console.error('Erreur lors de la récupération de la candidature (propriétaire):', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la candidature' },
      { status: 500 }
    );
  }
}


