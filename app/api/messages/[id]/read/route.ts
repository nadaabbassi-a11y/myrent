import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Marquer tous les messages d'un thread comme lus
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const threadId = params.id;

    // Vérifier que l'utilisateur a accès à ce thread
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        application: {
          include: {
            tenant: {
              include: {
                user: {
                  select: { id: true },
                },
              },
            },
            listing: {
              include: {
                landlord: {
                  include: {
                    user: {
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
        listing: {
          include: {
            landlord: {
              include: {
                user: {
                  select: { id: true },
                },
              },
            },
          },
        },
        tenant: {
          include: {
            user: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier l'accès : soit via application, soit directement via listing/tenant
    let hasAccess = false;
    if (thread.application) {
      hasAccess =
        thread.application.tenant.user.id === user.id ||
        thread.application.listing.landlord.user.id === user.id;
    } else if (thread.listing && thread.tenant) {
      hasAccess =
        thread.tenant.user.id === user.id ||
        thread.listing.landlord.user.id === user.id;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Marquer tous les messages non lus comme lus (seulement ceux qui ne sont pas envoyés par l'utilisateur)
    await prisma.message.updateMany({
      where: {
        threadId: threadId,
        senderId: { not: user.id },
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors du marquage des messages comme lus:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

