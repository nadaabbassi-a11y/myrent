import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Delete an availability slot (LANDLORD only, must own listing)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slotId: string } }
) {
  try {
    const user = await requireRole(request, 'LANDLORD');

    const slotId = params.slotId;

    // Get the slot with listing and landlord info
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
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
      },
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    // Verify user owns the listing
    if (slot.listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this listing' },
        { status: 403 }
      );
    }

    // Delete the slot
    await prisma.availabilitySlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({ message: 'Slot deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

