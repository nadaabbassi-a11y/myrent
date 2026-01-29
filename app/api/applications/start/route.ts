import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

const startApplicationSchema = z.object({
  appointmentId: z.string().min(1).optional(),
  visitRequestId: z.string().min(1).optional(),
}).refine(
  (data) => data.appointmentId || data.visitRequestId,
  { message: 'Either appointmentId or visitRequestId is required' }
)

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
    const { appointmentId, visitRequestId } = startApplicationSchema.parse(body)

    let appointment: any = null
    let listing: any = null
    let tenantProfile: any = null

    // Get tenant profile first (needed in both cases)
    tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    })

    if (!tenantProfile) {
      return NextResponse.json(
        { error: 'Tenant profile not found' },
        { status: 404 }
      )
    }

    // If appointmentId is provided, use existing appointment
    if (appointmentId) {
      appointment = await prisma.appointment.findUnique({
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

      listing = appointment.listing

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
    } 
    // If visitRequestId is provided, check if visit is approved
    else if (visitRequestId) {
      const visitRequest = await prisma.visitRequest.findUnique({
        where: { id: visitRequestId },
        include: {
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

      if (!visitRequest) {
        return NextResponse.json(
          { error: 'Visit request not found' },
          { status: 404 }
        )
      }

      // Verify the visit request belongs to the authenticated tenant
      if (visitRequest.tenantId !== tenantProfile.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      // Unlock rule: visit request must be approved
      if (visitRequest.status !== 'approved') {
        return NextResponse.json(
          { error: 'Visit request must be approved before starting an application' },
          { status: 400 }
        )
      }

      listing = visitRequest.listing

      // Check if there's already an appointment for this visit request
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          listingId: visitRequest.listingId,
          tenantId: user.id,
          status: 'CONFIRMED',
        },
      })

      if (existingAppointment) {
        // Use existing appointment
        appointment = await prisma.appointment.findUnique({
          where: { id: existingAppointment.id },
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

        // Check if application already exists for this appointment
        const existingApplication = await prisma.application.findUnique({
          where: { appointmentId: existingAppointment.id },
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
      } else {
        // No appointment exists yet - create one automatically from the approved visit request
        // Create a slot first (required for appointment)
        const preferredDate = visitRequest.preferredDate ? new Date(visitRequest.preferredDate) : new Date()
        // Set default time window (2 hours)
        const startAt = new Date(preferredDate)
        startAt.setHours(10, 0, 0, 0) // 10:00 AM
        const endAt = new Date(startAt)
        endAt.setHours(12, 0, 0, 0) // 12:00 PM

        // Create slot and appointment in a transaction
        const result = await prisma.$transaction(async (tx) => {
          // Create a slot for this visit
          const slot = await tx.availabilitySlot.create({
            data: {
              listingId: visitRequest.listingId,
              startAt,
              endAt,
              isBooked: true, // Mark as booked since we're creating an appointment
            },
          })

          // Create appointment with CONFIRMED status (since visit is already approved)
          const newAppointment = await tx.appointment.create({
            data: {
              listingId: visitRequest.listingId,
              slotId: slot.id,
              tenantId: user.id,
              landlordId: visitRequest.listing.landlord.userId,
              status: 'CONFIRMED', // Auto-confirm since visit was already approved
            },
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

          return newAppointment
        })

        appointment = result
      }
    } else {
      return NextResponse.json(
        { error: 'Either appointmentId or visitRequestId is required' },
        { status: 400 }
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

