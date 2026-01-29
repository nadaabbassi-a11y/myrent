import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { Role } from '@/lib/types';
import { z } from 'zod';

const sendListingMessageSchema = z.object({
  message: z.string().min(1, "Le message ne peut pas être vide"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, Role.TENANT);
    const listingId = params.id;

    const body = await request.json();
    const { message } = sendListingMessageSchema.parse(body);

    // Vérifier que le listing existe
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing non trouvé" },
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

    // Chercher un thread existant pour ce listing + ce tenant (sans Application)
    let messageThread = await prisma.messageThread.findFirst({
      where: {
        listingId,
        tenantId: tenantProfile.id,
        applicationId: null,
      },
    });

    // Sinon, le créer
    if (!messageThread) {
      messageThread = await prisma.messageThread.create({
        data: {
          listingId,
          tenantId: tenantProfile.id,
        },
      });
    }

    // Créer le message
    const newMessage = await prisma.message.create({
      data: {
        threadId: messageThread.id,
        senderId: user.id,
        content: message,
      },
    });

    // Mettre à jour la date de mise à jour du thread
    await prisma.messageThread.update({
      where: { id: messageThread.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        message: "Message envoyé avec succès",
        threadId: messageThread.id,
        messageId: newMessage.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Accès non autorisé. Vous devez être un locataire." },
        { status: 403 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de l'envoi d'un message pour le listing:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi du message" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/types';
import { z } from 'zod';

const sendMessageSchema = z.object({
  message: z.string().min(1, 'Le message ne peut pas être vide'),
});

// POST /api/listings/[id]/messages - envoyer un message simple au propriétaire pour un listing
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, Role.TENANT);
    const listingId = params.id;

    const body = await request.json();
    const { message } = sendMessageSchema.parse(body);

    // Vérifier que le listing existe
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer / créer le profil locataire
    let tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      tenantProfile = await prisma.tenantProfile.create({
        data: { userId: user.id },
      });
    }

    // Chercher un thread de messages existant pour ce listing + tenant (sans application)
    let thread = await prisma.messageThread.findFirst({
      where: {
        listingId,
        tenantId: tenantProfile.id,
        applicationId: null,
      },
    });

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          listingId,
          tenantId: tenantProfile.id,
        },
      });
    }

    // Créer le message
    const createdMessage = await prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: user.id,
        content: message,
      },
    });

    // Mettre à jour la date du thread
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        threadId: thread.id,
        message: createdMessage,
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
        { error: 'Accès non autorisé. Vous devez être un locataire.' },
        { status: 403 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de l\'envoi du message de listing:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}


