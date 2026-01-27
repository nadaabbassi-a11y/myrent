import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, requireAuth, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSlotSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
}).refine((data) => {
  const start = new Date(data.startAt);
  const end = new Date(data.endAt);
  return end > start;
}, {
  message: 'endAt must be after startAt',
  path: ['endAt'],
});

// GET - Get available slots for a listing (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Get only available (not booked) slots that are in the future
    const now = new Date();
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        listingId,
        isBooked: false,
        startAt: {
          gt: now, // Only future slots
        },
      },
      orderBy: {
        startAt: 'asc',
      },
    });

    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// POST - Create a new availability slot (LANDLORD only, must own listing)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, 'LANDLORD');

    const listingId = params.id;
    const body = await request.json();
    const validatedData = createSlotSchema.parse(body);

    const startAt = new Date(validatedData.startAt);
    const endAt = new Date(validatedData.endAt);

    // Verify listing exists and user owns it
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        landlord: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this listing' },
        { status: 403 }
      );
    }

    // Check for overlapping slots
    const overlappingSlots = await prisma.availabilitySlot.findMany({
      where: {
        listingId,
        OR: [
          // New slot starts during an existing slot
          {
            startAt: { lte: startAt },
            endAt: { gt: startAt },
          },
          // New slot ends during an existing slot
          {
            startAt: { lt: endAt },
            endAt: { gte: endAt },
          },
          // New slot completely contains an existing slot
          {
            startAt: { gte: startAt },
            endAt: { lte: endAt },
          },
        ],
      },
    });

    if (overlappingSlots.length > 0) {
      return NextResponse.json(
        { error: 'This slot overlaps with an existing slot' },
        { status: 400 }
      );
    }

    // Create the slot
    const slot = await prisma.availabilitySlot.create({
      data: {
        listingId,
        startAt,
        endAt,
        isBooked: false,
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating slot:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

