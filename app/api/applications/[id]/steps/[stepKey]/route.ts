import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

const stepDataSchema = z.record(z.any())

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; stepKey: string } }
) {
  try {
    const user = await requireRole(request, 'TENANT')
    const applicationId = params.id
    const stepKey = params.stepKey

    const body = await request.json()
    const data = stepDataSchema.parse(body.data || body)

    // Validate stepKey
    const validStepKeys = [
      'identity',
      'address',
      'status',
      'income',
      'occupants',
      'references',
      'documents',
      'consents',
    ]

    if (!validStepKeys.includes(stepKey)) {
      return NextResponse.json(
        { error: 'Invalid step key' },
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

    // Fetch application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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

    // Don't allow updates if already submitted
    if (application.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot update submitted application' },
        { status: 400 }
      )
    }

    // Validate step data based on stepKey
    const isValid = validateStepData(stepKey, data)
    if (!isValid.valid) {
      return NextResponse.json(
        { error: isValid.error || 'Invalid step data' },
        { status: 400 }
      )
    }

    // Save answer and update step completion status
    await prisma.$transaction(async (tx) => {
      // Upsert answer
      await tx.applicationAnswer.upsert({
        where: {
          applicationId_stepKey: {
            applicationId,
            stepKey,
          },
        },
        create: {
          applicationId,
          stepKey,
          version: 1,
          data,
        },
        update: {
          data,
          version: {
            increment: 1,
          },
        },
      })

      // Update step completion
      await tx.applicationStep.update({
        where: {
          applicationId_stepKey: {
            applicationId,
            stepKey,
          },
        },
        data: {
          isComplete: isValid.valid,
        },
      })
    })

    return NextResponse.json(
      {
        message: 'Step saved successfully',
        isComplete: isValid.valid,
      },
      { status: 200 }
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

    console.error('Error saving step:', error)
    return NextResponse.json(
      { error: 'Failed to save step' },
      { status: 500 }
    )
  }
}

function validateStepData(
  stepKey: string,
  data: Record<string, any>
): { valid: boolean; error?: string } {
  switch (stepKey) {
    case 'identity':
      if (!data.legalName || typeof data.legalName !== 'string') {
        return { valid: false, error: 'Legal name is required' }
      }
      if (!data.dateOfBirth || typeof data.dateOfBirth !== 'string') {
        return { valid: false, error: 'Date of birth is required' }
      }
      if (!data.phone || typeof data.phone !== 'string') {
        return { valid: false, error: 'Phone is required' }
      }
      break

    case 'address':
      if (!data.currentAddress || typeof data.currentAddress !== 'string') {
        return { valid: false, error: 'Current address is required' }
      }
      break

    case 'status':
      const validStatuses = [
        'EMPLOYED',
        'SELF_EMPLOYED',
        'STUDENT',
        'UNEMPLOYED',
        'UNDER_GUARDIAN',
      ]
      if (!data.status || !validStatuses.includes(data.status)) {
        return {
          valid: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`,
        }
      }
      break

    case 'income':
      // Income validation depends on status
      const status = data.status || data.previousStatus
      if (status === 'EMPLOYED' || status === 'SELF_EMPLOYED') {
        if (!data.monthlyIncome || typeof data.monthlyIncome !== 'number') {
          return { valid: false, error: 'Monthly income is required' }
        }
      }
      break

    case 'consents':
      // Consents are validated separately during submit
      break

    // Other steps are optional for now
    default:
      break
  }

  return { valid: true }
}


