import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

const REQUIRED_STEPS = ['identity', 'address', 'status', 'consents']
const REQUIRED_CONSENTS = ['CREDIT_CHECK', 'DATA_SHARING']

export async function POST(
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

    // Fetch application with steps, answers, and consents
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        steps: true,
        answers: true,
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

    // Check if already submitted
    if (application.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Application already submitted' },
        { status: 400 }
      )
    }

    // Validate required steps are complete
    const completedSteps = application.steps
      .filter((step) => step.isComplete)
      .map((step) => step.stepKey)

    const missingSteps = REQUIRED_STEPS.filter(
      (step) => !completedSteps.includes(step)
    )

    if (missingSteps.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required steps',
          missingSteps,
        },
        { status: 400 }
      )
    }

    // Validate required consents
    const consentTypes = application.consents.map((c) => c.type)
    const missingConsents = REQUIRED_CONSENTS.filter(
      (consent) => !consentTypes.includes(consent as any)
    )

    if (missingConsents.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required consents',
          missingConsents,
        },
        { status: 400 }
      )
    }

    // Validate income step if status requires it
    const statusAnswer = application.answers.find((a) => a.stepKey === 'status')
    if (statusAnswer) {
      const status = (statusAnswer.data as any).status
      if (
        (status === 'EMPLOYED' || status === 'SELF_EMPLOYED') &&
        !completedSteps.includes('income')
      ) {
        return NextResponse.json(
          {
            error: 'Income information is required for employed/self-employed status',
          },
          { status: 400 }
        )
      }
    }

    // Update application status to SUBMITTED
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'SUBMITTED',
      },
    })

    return NextResponse.json(
      {
        message: 'Application submitted successfully',
        applicationId: updatedApplication.id,
        status: updatedApplication.status,
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

    console.error('Error submitting application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}

