import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all upcoming slots for landlord's listings
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, 'LANDLORD');

    // Get landlord profile
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      return NextResponse.json(
        { error: 'Landlord profile not found' },
        { status: 404 }
      );
    }

    // Get all upcoming slots for landlord's listings
    const now = new Date();
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        listing: {
          landlordId: landlordProfile.id,
        },
        startAt: {
          gt: now,
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            area: true,
          },
        },
      },
      orderBy: {
        startAt: 'asc',
      },
    });

    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    console.error('Error fetching landlord slots:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

