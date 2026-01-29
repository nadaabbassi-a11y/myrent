import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

const startApplicationSchema = z.object({
  appointmentId: z.string().min(1, 'appointmentId is required'),
})

const STEP_KEYS = [
  'identity',
  'address',
  'status',
  'income',
  'occupants',
  'references',
  'documents',
  'consents',
]

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, 'TENANT')
    const body = await request.json()
    const { appointmentId } = startApplicationSchema.parse(body)

    // Find the appointment with slot information
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        slot: true,
        listing: {
          include: {
            landlord: {
              include: {
                user: true,
              },
            },
          },
        },
        tenant: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Verify the appointment belongs to the authenticated tenant
    if (appointment.tenantId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Unlock rule: appointment must be CONFIRMED
    if (appointment.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Appointment must be confirmed before starting an application' },
        { status: 400 }
      )
    }

    // Check if application already exists for this appointment
    const existingApplication = await prisma.application.findUnique({
      where: { appointmentId },
    })

    if (existingApplication) {
      return NextResponse.json(
        { 
          applicationId: existingApplication.id,
          message: 'Application already exists for this appointment',
        },
        { status: 200 }
      )
    }

    // Get tenant profile
    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    })

    if (!tenantProfile) {
      return NextResponse.json(
        { error: 'Tenant profile not found' },
        { status: 404 }
      )
    }

    // Create application with initial steps
    const application = await prisma.$transaction(async (tx) => {
      // Create application
      const newApplication = await tx.application.create({
        data: {
          listingId: appointment.listingId,
          tenantId: tenantProfile.id,
          landlordId: appointment.listing.landlord.userId,
          appointmentId: appointment.id,
          status: 'DRAFT',
        },
      })

      // Create initial step records
      await Promise.all(
        STEP_KEYS.map((stepKey) =>
          tx.applicationStep.create({
            data: {
              applicationId: newApplication.id,
              stepKey,
              isComplete: false,
            },
          })
        )
      )

      return newApplication
    })

    return NextResponse.json(
      {
        applicationId: application.id,
        message: 'Application created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

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

    console.error('Error starting application:', error)
    return NextResponse.json(
      { error: 'Failed to start application' },
      { status: 500 }
    )
  }
}

