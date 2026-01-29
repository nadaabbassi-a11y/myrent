import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Role } from '@/lib/types';

const createVisitRequestSchema = z.object({
  listingId: z.string().min(1, 'ID de listing requis'),
  message: z.string().optional(),
  preferredDate: z.string().optional(), // ISO date string
  preferredTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),
});

// POST - Create visit request (TENANT only)
export async function POST(request: NextRequest) {
  try {
    console.log('[Visit Request API] Starting request...');
    const user = await requireRole(request, Role.TENANT);
    console.log('[Visit Request API] User authenticated:', user.id, user.role);
    
    const body = await request.json();
    console.log('[Visit Request API] Request body:', body);
    
    const validatedData = createVisitRequestSchema.parse(body);
    console.log('[Visit Request API] Validated data:', validatedData);

    // Vérifier que le listing existe
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer ou créer le profil locataire
    let tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      tenantProfile = await prisma.tenantProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Vérifier si l'utilisateur a déjà demandé une visite pour ce listing
    const existingRequest = await prisma.visitRequest.findFirst({
      where: {
        listingId: validatedData.listingId,
        tenantId: tenantProfile.id,
        status: {
          in: ['pending', 'approved'],
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Vous avez déjà une demande de visite en attente pour cette annonce' },
        { status: 400 }
      );
    }

    // Créer la demande de visite
    console.log('[Visit Request API] Creating visit request...', {
      listingId: validatedData.listingId,
      tenantId: tenantProfile.id,
    });
    
    try {
      const visitRequest = await prisma.visitRequest.create({
        data: {
          listingId: validatedData.listingId,
          tenantId: tenantProfile.id,
          message: validatedData.message || null,
          preferredDate: validatedData.preferredDate 
            ? new Date(validatedData.preferredDate) 
            : null,
          preferredTime: validatedData.preferredTime || null,
          status: 'pending',
        },
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

      console.log('[Visit Request API] Visit request created successfully:', visitRequest.id);

      // Créer un message dans le flux de messages
      try {
        // Chercher d'abord si une Application existe déjà pour ce listing et ce tenant
        const existingApplication = await prisma.application.findFirst({
          where: {
            listingId: validatedData.listingId,
            tenantId: tenantProfile.id,
          },
          include: {
            messageThread: true,
          },
        });

        let messageThread;

        if (existingApplication && existingApplication.messageThread) {
          // Utiliser le thread existant de l'Application
          messageThread = existingApplication.messageThread;
        } else if (existingApplication && !existingApplication.messageThread) {
          // Créer un thread pour l'Application existante
          messageThread = await prisma.messageThread.create({
            data: {
              applicationId: existingApplication.id,
            },
          });
        } else {
          // Créer ou récupérer un thread basé sur listingId et tenantId (sans Application)
          const existingThread = await prisma.messageThread.findFirst({
            where: {
              listingId: validatedData.listingId,
              tenantId: tenantProfile.id,
              applicationId: null,
            },
          });
          
          if (existingThread) {
            messageThread = existingThread;
          } else {
            messageThread = await prisma.messageThread.create({
              data: {
                listingId: validatedData.listingId,
                tenantId: tenantProfile.id,
              },
            });
          }
        }

        // Formater la date et l'heure
        const dateStr = validatedData.preferredDate 
          ? new Date(validatedData.preferredDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : 'non spécifiée';
        
        const timeMap: { [key: string]: string } = {
          morning: 'Matin (9h-12h)',
          afternoon: 'Après-midi (13h-17h)',
          evening: 'Soir (18h-20h)',
          flexible: 'Flexible',
        };
        const timeStr = validatedData.preferredTime 
          ? timeMap[validatedData.preferredTime] || validatedData.preferredTime 
          : 'Flexible';

        // Créer le message automatique avec les détails de la demande de visite
        const messageContent = `📅 **Demande de visite**

Date préférée : ${dateStr}
Heure préférée : ${timeStr}
${validatedData.message ? `\nMessage : ${validatedData.message}` : ''}`;

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
      } catch (messageError) {
        // Ne pas faire échouer la demande de visite si la création du message échoue
        console.error('[Visit Request API] Error creating message:', messageError);
      }

      return NextResponse.json(
        {
          message: 'Demande de visite envoyée avec succès',
          visitRequest: {
            id: visitRequest.id,
            status: visitRequest.status,
            message: visitRequest.message,
            preferredDate: visitRequest.preferredDate,
            preferredTime: visitRequest.preferredTime,
            createdAt: visitRequest.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (prismaError: any) {
      console.error('[Visit Request API] Prisma error:', prismaError);
      console.error('[Visit Request API] Prisma error code:', prismaError?.code);
      console.error('[Visit Request API] Prisma error meta:', prismaError?.meta);
      
      // Gérer les erreurs Prisma spécifiques
      if (prismaError?.code === 'P2002') {
        return NextResponse.json(
          { error: 'Vous avez déjà une demande de visite pour cette annonce' },
          { status: 400 }
        );
      }
      
      if (prismaError?.code === 'P2003') {
        return NextResponse.json(
          { error: 'Erreur de référence: le listing ou le profil locataire est invalide' },
          { status: 400 }
        );
      }
      
      // Relancer l'erreur pour qu'elle soit capturée par le catch principal
      throw prismaError;
    }

  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Vous devez être un locataire pour demander une visite.' },
        { status: 403 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[Visit Request API] Error:', error);
    console.error('[Visit Request API] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
    });
    
    // Retourner un message d'erreur plus détaillé en développement
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Erreur: ${error?.message || 'Erreur inconnue'}`
      : 'Une erreur est survenue lors de la création de la demande de visite';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          code: error?.code,
          name: error?.name,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

