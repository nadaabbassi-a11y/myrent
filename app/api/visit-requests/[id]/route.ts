import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Role } from '@/lib/types';

const updateVisitRequestSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
  proposedDate: z.string().optional(), // ISO date string
  proposedTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),
  proposedMessage: z.string().optional(),
});

// PATCH - Mettre à jour le statut d'une demande de visite (LANDLORD only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, Role.LANDLORD);
    const body = await request.json();
    const validatedData = updateVisitRequestSchema.parse(body);

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

    // Récupérer la demande de visite
    const visitRequest = await prisma.visitRequest.findUnique({
      where: { id: params.id },
      include: {
        listing: {
          select: {
            landlordId: true,
          },
        },
      },
    });

    if (!visitRequest) {
      return NextResponse.json(
        { error: 'Demande de visite non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que le listing appartient au propriétaire
    if (visitRequest.listing.landlordId !== landlordProfile.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à modifier cette demande de visite' },
        { status: 403 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (validatedData.status) {
      updateData.status = validatedData.status;
    }

    // Mettre à jour la demande de visite
    const updatedRequest = await prisma.visitRequest.update({
      where: { id: params.id },
      data: updateData,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
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
    });

    // Créer un message dans le flux de messages
    try {
      // Chercher d'abord si une Application existe déjà
      const application = await prisma.application.findFirst({
        where: {
          listingId: visitRequest.listingId,
          tenantId: visitRequest.tenantId,
        },
        include: {
          messageThread: true,
        },
      });

      let messageThread;

      if (application && application.messageThread) {
        // Utiliser le thread existant de l'Application
        messageThread = application.messageThread;
      } else if (application && !application.messageThread) {
        // Créer un thread pour l'Application existante
        messageThread = await prisma.messageThread.create({
          data: {
            applicationId: application.id,
          },
        });
      } else {
        // Créer ou récupérer un thread basé sur listingId et tenantId (sans Application)
        const existingThread = await prisma.messageThread.findFirst({
          where: {
            listingId: visitRequest.listingId,
            tenantId: visitRequest.tenantId,
            applicationId: null,
          },
        });
        
        if (existingThread) {
          messageThread = existingThread;
        } else {
          messageThread = await prisma.messageThread.create({
            data: {
              listingId: visitRequest.listingId,
              tenantId: visitRequest.tenantId,
            },
          });
        }
      }

      if (messageThread) {

        let messageContent = '';

        // Si le propriétaire propose une date/heure alternative
        if (validatedData.proposedDate || validatedData.proposedTime) {
          const dateStr = validatedData.proposedDate 
            ? new Date(validatedData.proposedDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '';
          
          const timeMap: { [key: string]: string } = {
            morning: 'Matin (9h-12h)',
            afternoon: 'Après-midi (13h-17h)',
            evening: 'Soir (18h-20h)',
            flexible: 'Flexible',
          };
          const timeStr = validatedData.proposedTime ? timeMap[validatedData.proposedTime] || validatedData.proposedTime : '';
          
          messageContent = `📅 **Proposition de visite**

${dateStr ? `Date proposée : ${dateStr}` : ''}
${timeStr ? `Heure proposée : ${timeStr}` : ''}
${validatedData.proposedMessage ? `\nMessage : ${validatedData.proposedMessage}` : ''}`;
        } else if (validatedData.status) {
          // Message pour changement de statut
          const statusMap: { [key: string]: string } = {
            approved: '✅ Visite approuvée',
            rejected: '❌ Visite refusée',
            completed: '✅ Visite complétée',
            pending: '⏳ Visite en attente',
          };
          messageContent = statusMap[validatedData.status] || `Statut changé : ${validatedData.status}`;
        }

        if (messageContent) {
          await prisma.message.create({
            data: {
              threadId: messageThread.id,
              senderId: user.id,
              content: messageContent,
            },
          });

          // Mettre à jour la date de mise à jour du thread
          await prisma.messageThread.update({
            where: { id: messageThread.id },
            data: { updatedAt: new Date() },
          });

          console.log('[Visit Request API] Message created in thread:', messageThread.id);
        }
      }
    } catch (messageError) {
      // Ne pas faire échouer la mise à jour si la création du message échoue
      console.error('[Visit Request API] Error creating message:', messageError);
    }

    return NextResponse.json(
      {
        message: 'Statut de la demande de visite mis à jour avec succès',
        visitRequest: updatedRequest,
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
        { error: 'Accès non autorisé. Vous devez être un propriétaire.' },
        { status: 403 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour de la demande de visite:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la demande de visite' },
      { status: 500 }
    );
  }
}

