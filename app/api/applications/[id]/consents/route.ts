import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

const consentSchema = z.object({
  type: z.enum(['CREDIT_CHECK', 'REFERENCES_CONTACT', 'DATA_SHARING']),
  textVersion: z.string().min(1),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, 'TENANT')
    const applicationId = params.id

    const body = await request.json()
    const { type, textVersion } = consentSchema.parse(body)

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

    // Upsert consent
    const consent = await prisma.consent.upsert({
      where: {
        applicationId_type: {
          applicationId,
          type: type as any,
        },
      },
      create: {
        applicationId,
        type: type as any,
        textVersion,
        acceptedAt: new Date(),
      },
      update: {
        textVersion,
        acceptedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        message: 'Consent saved successfully',
        consent,
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

    console.error('Error saving consent:', error)
    return NextResponse.json(
      { error: 'Failed to save consent' },
      { status: 500 }
    )
  }
}


