import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { z } from 'zod'
import { addMonths } from 'date-fns'

const acceptApplicationSchema = z.object({
  startDate: z.string().datetime({ message: 'La date de début doit être une date valide' }),
  landlordInfo: z.object({
    name: z.string().min(1, 'Le nom du locateur est requis'),
    address: z.string().min(1, 'L\'adresse du locateur est requise'),
    city: z.string().min(1, 'La ville du locateur est requise'),
    postalCode: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  }),
  propertyInfo: z.object({
    address: z.string().min(1, 'L\'adresse du logement est requise'),
    city: z.string().min(1, 'La ville du logement est requise'),
    postalCode: z.string().optional(),
    type: z.string().optional(),
    rooms: z.string().optional(),
    heating: z.string().optional(),
    parking: z.boolean().optional(),
    parkingDetails: z.string().optional(),
    storage: z.boolean().optional(),
    storageDetails: z.string().optional(),
  }),
  leaseTerms: z.object({
    utilities: z.string().optional(),
    pets: z.boolean().optional(),
    petsDetails: z.string().optional(),
    smoking: z.boolean().optional(),
    repairs: z.string().optional(),
    rules: z.string().optional(),
  }),
  additionalConditions: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, 'LANDLORD')
    const applicationId = params.id

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { startDate, landlordInfo, propertyInfo, leaseTerms, additionalConditions } = acceptApplicationSchema.parse(body)

    // Validate start date
    const parsedStartDate = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (parsedStartDate < today) {
      return NextResponse.json(
        { error: 'La date de début ne peut pas être dans le passé' },
        { status: 400 }
      )
    }

    // Get landlord profile
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    })

    if (!landlordProfile) {
      return NextResponse.json(
        { error: 'Landlord profile not found' },
        { status: 404 }
      )
    }

    // Fetch application with listing
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        listing: true,
        lease: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (application.listing.landlordId !== landlordProfile.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if application is submitted
    if (application.status !== 'SUBMITTED') {
      return NextResponse.json(
        { error: 'Can only accept submitted applications' },
        { status: 400 }
      )
    }

    // Check if lease already exists
    if (application.lease) {
      return NextResponse.json(
        { error: 'Un bail existe déjà pour cette candidature' },
        { status: 400 }
      )
    }

    // Calculate end date (12 months or listing minTerm)
    const leaseDuration = application.listing.minTerm || 12
    const endDate = addMonths(parsedStartDate, leaseDuration)

    // Use a transaction to update application and create lease
    const result = await prisma.$transaction(async (tx) => {
      // Update application status to ACCEPTED
      const updatedApplication = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: 'ACCEPTED',
        },
      })

      // Create lease with the start date and all TAL sections info provided by landlord
      const lease = await tx.lease.create({
        data: {
          applicationId: applicationId,
          startDate: parsedStartDate,
          endDate: endDate,
          monthlyRent: application.listing.price,
          deposit: application.listing.deposit || application.listing.price, // Use listing deposit or default to one month's rent
          terms: `Bail de ${leaseDuration} mois. Conditions standard de location résidentielle.`,
          status: 'DRAFT', // New field: lease starts in DRAFT status
          landlordInfo: landlordInfo, // Store landlord info (section 1 TAL) as JSON - non modifiable
          propertyInfo: propertyInfo, // Store property info (section 3 TAL) as JSON - non modifiable
          leaseTerms: leaseTerms, // Store lease terms (section 4 TAL) as JSON - non modifiable
          additionalConditions: additionalConditions || null, // Store additional conditions (section 5 TAL) - non modifiable
        },
      })

      // Create default annex documents for the lease
      await tx.annexDocument.createMany({
        data: [
          {
            leaseId: lease.id,
            type: 'PAYMENT_CONSENT',
            title: 'Consentement au paiement en ligne',
            content: `En signant ce document, vous autorisez le prélèvement automatique du loyer mensuel via le système de paiement sécurisé MyRent (Stripe). Cette autorisation est facultative et peut être révoquée à tout moment.`,
            version: 1,
          },
          {
            leaseId: lease.id,
            type: 'CREDIT_CHECK_AUTH',
            title: 'Autorisation de vérification de crédit',
            content: `En signant ce document, vous autorisez le propriétaire à effectuer une vérification de crédit pour évaluer votre solvabilité. Cette vérification sera effectuée conformément aux lois québécoises sur la protection des renseignements personnels.`,
            version: 1,
          },
          {
            leaseId: lease.id,
            type: 'ELECTRONIC_COMMS',
            title: 'Consentement aux communications électroniques',
            content: `En signant ce document, vous acceptez de recevoir des communications électroniques (courriels, notifications) concernant votre bail et votre location via la plateforme MyRent.`,
            version: 1,
          },
        ],
      })

      return { application: updatedApplication, lease }
    })

    return NextResponse.json(
      {
        message: 'Application accepted successfully and lease created',
        applicationId: result.application.id,
        status: result.application.status,
        leaseId: result.lease.id,
        startDate: result.lease.startDate,
        endDate: result.lease.endDate,
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle auth errors
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode
      if (statusCode === 401 || statusCode === 403) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: statusCode }
        )
      }
    }

    console.error('Error accepting application:', error)
    return NextResponse.json(
      { error: 'Failed to accept application' },
      { status: 500 }
    )
  }
}

