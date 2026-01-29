import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les compteurs de notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const notifications: {
      messages: number;
      visitRequests: number;
      applications: number;
    } = {
      messages: 0,
      visitRequests: 0,
      applications: 0,
    };

    if (user.role === 'TENANT') {
      // Pour les locataires : compter les messages non lus et les visites en attente
      const tenantProfile = await prisma.tenantProfile.findUnique({
        where: { userId: user.id },
      });

      if (tenantProfile) {
        // Messages non lus
        const unreadMessages = await prisma.message.count({
          where: {
            thread: {
              application: {
                tenantId: tenantProfile.id,
              },
            },
            senderId: { not: user.id },
            read: false,
          },
        });
        notifications.messages = unreadMessages;

        // Demandes de visite en attente d'approbation
        const pendingVisits = await prisma.visitRequest.count({
          where: {
            tenantId: tenantProfile.id,
            status: 'SUBMITTED',
          },
        });
        notifications.visitRequests = pendingVisits;
      }
    } else if (user.role === 'LANDLORD') {
      // Pour les propriétaires : compter les messages non lus, les visites en attente, et les candidatures
      const landlordProfile = await prisma.landlordProfile.findUnique({
        where: { userId: user.id },
      });

      if (landlordProfile) {
        // Messages non lus
        const unreadMessages = await prisma.message.count({
          where: {
            thread: {
              application: {
                listing: {
                  landlordId: landlordProfile.id,
                },
              },
            },
            senderId: { not: user.id },
            read: false,
          },
        });
        notifications.messages = unreadMessages;

        // Demandes de visite en attente
        const pendingVisits = await prisma.visitRequest.count({
          where: {
            listing: {
              landlordId: landlordProfile.id,
            },
            status: 'SUBMITTED',
          },
        });
        notifications.visitRequests = pendingVisits;

        // Candidatures en attente
        const pendingApplications = await prisma.application.count({
          where: {
            listing: {
              landlordId: landlordProfile.id,
            },
            status: 'SUBMITTED',
          },
        });
        notifications.applications = pendingApplications;
      }
    }

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

