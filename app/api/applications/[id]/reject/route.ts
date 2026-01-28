import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, 'LANDLORD')
    const applicationId = params.id

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
        { error: 'Can only reject submitted applications' },
        { status: 400 }
      )
    }

    // Update application status to REJECTED
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
      },
    })

    return NextResponse.json(
      {
        message: 'Application rejected successfully',
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

    console.error('Error rejecting application:', error)
    return NextResponse.json(
      { error: 'Failed to reject application' },
      { status: 500 }
    )
  }
}

