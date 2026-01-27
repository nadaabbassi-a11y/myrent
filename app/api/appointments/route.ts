import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

const createAppointmentSchema = z.object({
  listingId: z.string().min(1, 'Le listing est requis'),
  slotId: z.string().min(1, 'Le créneau est requis'),
});

export async function POST(request: NextRequest) {
  try {
    // Seuls les TENANTS peuvent créer des appointments
    const user = await requireRole(request, 'TENANT');

    const body = await request.json();
    const validatedData = createAppointmentSchema.parse(body);

    // Transaction pour éviter les doubles réservations
    const appointment = await prisma.$transaction(async (tx) => {
      // 1. Vérifier que le slot existe, n'est pas réservé, et appartient au listing
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: validatedData.slotId },
        include: { listing: true },
      });

      if (!slot) {
        throw new Error('SLOT_NOT_FOUND');
      }

      if (slot.listingId !== validatedData.listingId) {
        throw new Error('SLOT_LISTING_MISMATCH');
      }

      if (slot.isBooked) {
        throw new Error('SLOT_ALREADY_BOOKED');
      }

      // Vérifier que le slot est dans le futur
      if (slot.startAt <= new Date()) {
        throw new Error('SLOT_IN_PAST');
      }

      // 2. Vérifier que le listing existe et récupérer le landlordId
      const listing = await tx.listing.findUnique({
        where: { id: validatedData.listingId },
        include: { landlord: { include: { user: true } } },
      });

      if (!listing) {
        throw new Error('LISTING_NOT_FOUND');
      }

      const landlordId = listing.landlord.userId;

      // 3. Créer l'appointment et marquer le slot comme réservé dans une transaction atomique
      const newAppointment = await tx.appointment.create({
        data: {
          listingId: validatedData.listingId,
          slotId: validatedData.slotId,
          tenantId: user.id,
          landlordId: landlordId,
          status: 'REQUESTED',
        },
      });

      // 4. Marquer le slot comme réservé
      await tx.availabilitySlot.update({
        where: { id: validatedData.slotId },
        data: { isBooked: true },
      });

      return newAppointment;
    });

    return NextResponse.json(
      {
        appointment: {
          id: appointment.id,
          listingId: appointment.listingId,
          slotId: appointment.slotId,
          status: appointment.status,
          createdAt: appointment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'appointment:', error);

    if (error.statusCode === 401 || error.statusCode === 403) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    if (error.message === 'SLOT_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Créneau introuvable' },
        { status: 404 }
      );
    }

    if (error.message === 'SLOT_LISTING_MISMATCH') {
      return NextResponse.json(
        { error: 'Le créneau n\'appartient pas à ce listing' },
        { status: 400 }
      );
    }

    if (error.message === 'SLOT_ALREADY_BOOKED') {
      return NextResponse.json(
        { error: 'Ce créneau est déjà réservé' },
        { status: 409 }
      );
    }

    if (error.message === 'SLOT_IN_PAST') {
      return NextResponse.json(
        { error: 'Impossible de réserver un créneau dans le passé' },
        { status: 400 }
      );
    }

    if (error.message === 'LISTING_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Listing introuvable' },
        { status: 404 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'appointment' },
      { status: 500 }
    );
  }
}

