import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'
import { addMonths } from 'date-fns'

const initializeLeaseSchema = z.object({
  applicationId: z.string(),
  startDate: z.string().refine(
    (date) => {
      const d = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return d >= today
    },
    { message: 'La date de début doit être aujourd\'hui ou dans le futur' }
  ),
})

// POST /api/leases/initialize - Créer un lease après acceptation de candidature
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, 'TENANT')
    const body = await request.json()
    const { applicationId, startDate } = initializeLeaseSchema.parse(body)

    // Récupérer le profil locataire
    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    })

    if (!tenantProfile) {
      return NextResponse.json(
        { error: 'Profil locataire introuvable' },
        { status: 404 }
      )
    }

    // Vérifier que la candidature existe et est ACCEPTED
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        listing: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Candidature introuvable' },
        { status: 404 }
      )
    }

    if (application.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'La candidature doit être acceptée pour créer un bail' },
        { status: 400 }
      )
    }

    if (application.tenantId !== tenantProfile.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier qu'un lease n'existe pas déjà
    const existingLease = await prisma.lease.findUnique({
      where: { applicationId },
    })

    if (existingLease) {
      return NextResponse.json(
        { error: 'Un bail existe déjà pour cette candidature' },
        { status: 400 }
      )
    }

    // Calculer la date de fin (12 mois par défaut, ou minTerm du listing)
    const start = new Date(startDate)
    const termMonths = application.listing.minTerm || 12
    const end = addMonths(start, termMonths)

    // Créer le lease
    const lease = await prisma.lease.create({
      data: {
        applicationId,
        startDate: start,
        endDate: end,
        monthlyRent: application.listing.price,
        deposit: application.listing.deposit || 0,
        terms: `Bail de ${termMonths} mois. Loyer mensuel: ${application.listing.price.toLocaleString('fr-CA')} $CAD.`,
      },
      include: {
        application: {
          include: {
            listing: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        lease: {
          id: lease.id,
          startDate: lease.startDate,
          endDate: lease.endDate,
          monthlyRent: lease.monthlyRent,
          deposit: lease.deposit,
          application: {
            listing: {
              title: application.listing.title,
              address: application.listing.address,
              city: application.listing.city,
            },
          },
        },
        message: 'Bail créé avec succès',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode
      if (statusCode === 401 || statusCode === 403) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: statusCode }
        )
      }
    }

    console.error('Erreur lors de l\'initialisation du bail:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du bail' },
      { status: 500 }
    )
  }
}

