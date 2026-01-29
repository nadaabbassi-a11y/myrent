import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/types';

// GET - Récupérer les demandes de visite du locataire connecté
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.TENANT);

    // Récupérer le profil locataire
    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      return NextResponse.json(
        { error: 'Profil locataire non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer toutes les demandes de visite du locataire
    const visitRequests = await prisma.visitRequest.findMany({
      where: {
        tenantId: tenantProfile.id,
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
            landlord: {
              select: {
                id: true,
                phone: true,
                company: true,
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Pour chaque visite approuvée, vérifier s'il y a un rendez-vous confirmé
    const visitRequestsWithAppointments = await Promise.all(
      visitRequests.map(async (request) => {
        if (request.status === 'approved') {
          // Chercher un rendez-vous confirmé pour ce listing et ce tenant
          const appointment = await prisma.appointment.findFirst({
            where: {
              listingId: request.listingId,
              tenantId: user.id,
              status: 'CONFIRMED',
            },
            include: {
              application: {
                select: {
                  id: true,
                },
              },
            },
          });

          return {
            ...request,
            hasConfirmedAppointment: !!appointment,
            appointmentId: appointment?.id,
            hasApplication: !!appointment?.application,
          };
        }
        return {
          ...request,
          hasConfirmedAppointment: false,
          appointmentId: null,
          hasApplication: false,
        };
      })
    );

    // Parser les images
    const formattedRequests = visitRequestsWithAppointments.map((request) => ({
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
        { error: 'Accès non autorisé. Vous devez être un locataire.' },
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

