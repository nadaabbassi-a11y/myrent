import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getClientIP, getUserAgent } from '@/lib/request-utils';
import { createAuditLog } from '@/lib/audit-log';
import { z } from 'zod';

const signOwnerSchema = z.object({
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'Vous devez cocher la case pour confirmer votre signature',
  }),
  initials: z.string().min(1, 'Les initiales sont requises').max(10).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, 'LANDLORD');
    const { id: leaseId } = await params;

    const body = await request.json();
    const validatedData = signOwnerSchema.parse(body);

    // Get lease with relations
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        application: {
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
        },
        tenantSignature: true,
        ownerSignature: true,
      },
    });

    if (!lease) {
      return NextResponse.json(
        { error: 'Bail introuvable' },
        { status: 404 }
      );
    }

    // Verify landlord owns this lease
    if (lease.application.listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Check if already signed
    if (lease.ownerSignature) {
      return NextResponse.json(
        { error: 'Ce bail a déjà été signé par le propriétaire' },
        { status: 400 }
      );
    }

    // Check lease status
    if (lease.status === 'FINALIZED') {
      return NextResponse.json(
        { error: 'Ce bail est déjà finalisé et ne peut plus être modifié' },
        { status: 400 }
      );
    }

    // Get IP and user agent
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    // Create owner signature
    const signature = await prisma.leaseOwnerSignature.create({
      data: {
        leaseId,
        signerId: user.id,
        signerEmail: user.email,
        signerName: user.name,
        signerRole: 'LANDLORD',
        initials: validatedData.initials?.toUpperCase(),
        consentGiven: validatedData.consentGiven,
        ipAddress,
        userAgent,
        documentVersion: lease.pdfVersion,
      },
    });

    // Update lease status
    const newStatus = lease.tenantSignature ? 'FINALIZED' : 'OWNER_SIGNED';
    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: newStatus,
      },
    });

    // Create audit log
    await createAuditLog('LEASE_OWNER_SIGNED', 'LEASE', {
      userId: user.id,
      leaseId,
      metadata: {
        ipAddress,
        userAgent,
        documentVersion: lease.pdfVersion,
        initials: validatedData.initials,
      },
    });

    return NextResponse.json(
      {
        message: 'Bail signé avec succès',
        signature,
        status: newStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode;
      if (statusCode === 401 || statusCode === 403) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: statusCode }
        );
      }
    }

    console.error('Erreur lors de la signature du propriétaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la signature' },
      { status: 500 }
    );
  }
}

