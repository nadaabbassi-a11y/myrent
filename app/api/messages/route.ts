import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const sendMessageSchema = z.object({
  threadId: z.string(),
  content: z.string().min(1, 'Le message ne peut pas être vide'),
})

// GET - Récupérer les threads de messages pour l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer tous les threads où l'utilisateur a envoyé ou reçu des messages
    // Pour les tenants : threads où ils sont le tenant de l'application
    // Pour les landlords : threads où ils sont le landlord du listing de l'application
    
    // D'abord, récupérer le profil landlord si l'utilisateur est un landlord
    let landlordProfile = null;
    if (user.role === 'LANDLORD') {
      landlordProfile = await prisma.landlordProfile.findUnique({
        where: { userId: user.id },
      });
    }

    // Construire la condition where
    const whereCondition: any = {
      OR: [],
    };

    // Threads liés à une Application
    if (user.role === 'TENANT') {
      whereCondition.OR.push({
        application: {
          tenant: { userId: user.id },
        },
      });
    }
    
    if (landlordProfile) {
      whereCondition.OR.push({
        application: {
          listing: {
            landlordId: landlordProfile.id,
          },
        },
      });
    }

    // Threads liés directement à un Listing et Tenant (sans Application)
    if (user.role === 'TENANT') {
      whereCondition.OR.push({
        tenant: { userId: user.id },
        listingId: { not: null },
        applicationId: null,
      });
    }
    
    if (landlordProfile) {
      whereCondition.OR.push({
        listing: {
          landlordId: landlordProfile.id,
        },
        tenantId: { not: null },
        applicationId: null,
      });
    }

    const threads = await prisma.messageThread.findMany({
      where: whereCondition,
      include: {
        application: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                price: true,
                city: true,
                area: true,
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
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            area: true,
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
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: user.id },
                read: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    console.log(`[Messages API] User ${user.id} (${user.role}) - Found ${threads.length} threads`)

    return NextResponse.json({ threads })
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// POST - Envoyer un message
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = sendMessageSchema.parse(body)

    // Vérifier que l'utilisateur a accès à ce thread
    const thread = await prisma.messageThread.findUnique({
      where: { id: validatedData.threadId },
      include: {
        application: {
          include: {
            tenant: true,
            listing: {
              include: {
                landlord: true,
              },
            },
          },
        },
      },
    })

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread non trouvé' },
        { status: 404 }
      )
    }

    const hasAccess =
      (thread.application && (
        thread.application.tenant.userId === user.id ||
        thread.application.listing.landlord.userId === user.id
      )) ||
      (thread.tenant && thread.listing && (
        thread.tenant.userId === user.id ||
        thread.listing.landlord.userId === user.id
      ))

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        threadId: validatedData.threadId,
        senderId: user.id,
        content: validatedData.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Mettre à jour la date de mise à jour du thread
    await prisma.messageThread.update({
      where: { id: validatedData.threadId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erreur lors de l\'envoi du message:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}


