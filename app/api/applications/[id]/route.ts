import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, 'TENANT')
    const applicationId = params.id

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

    // Fetch application with all related data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            area: true,
            price: true,
          },
        },
        appointment: {
          include: {
            slot: {
              select: {
                startAt: true,
                endAt: true,
              },
            },
          },
        },
        steps: {
          orderBy: {
            stepKey: 'asc',
          },
        },
        answers: {
          orderBy: {
            stepKey: 'asc',
          },
        },
        consents: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (application.tenantId !== tenantProfile.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Format response
    const response = {
      id: application.id,
      status: application.status,
      listing: application.listing,
      appointment: {
        id: application.appointment.id,
        slot: application.appointment.slot,
      },
      steps: application.steps.map((step) => ({
        stepKey: step.stepKey,
        isComplete: step.isComplete,
        updatedAt: step.updatedAt,
      })),
      answers: application.answers.reduce(
        (acc, answer) => {
          acc[answer.stepKey] = answer.data
          return acc
        },
        {} as Record<string, any>
      ),
      consents: application.consents.map((consent) => ({
        type: consent.type,
        textVersion: consent.textVersion,
        acceptedAt: consent.acceptedAt,
      })),
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    }

    return NextResponse.json(response, { status: 200 })
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

    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

