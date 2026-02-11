import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createThreadSchema = z.object({
  listingId: z.string(),
})

// POST - Créer ou récupérer un thread de message pour un listing
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    if (user.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Seuls les locataires peuvent créer des threads' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createThreadSchema.parse(body)

    // Récupérer le profil tenant
    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    })

    if (!tenantProfile) {
      return NextResponse.json(
        { error: 'Profil locataire introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que le listing existe
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
      include: {
        landlord: {
          include: {
            user: {
              select: { id: true },
            },
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Annonce introuvable' },
        { status: 404 }
      )
    }

    // Chercher un thread existant pour ce listing et ce tenant
    let thread = await prisma.messageThread.findFirst({
      where: {
        listingId: validatedData.listingId,
        tenantId: tenantProfile.id,
        applicationId: null, // Thread direct, pas lié à une application
      },
    })

    // Si aucun thread n'existe, en créer un
    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          listingId: validatedData.listingId,
          tenantId: tenantProfile.id,
        },
      })
    }

    return NextResponse.json({ threadId: thread.id })
  } catch (error: any) {
    console.error('Erreur lors de la création/récupération du thread:', error)
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

