import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getClientIP, getUserAgent } from '@/lib/request-utils';
import { createAuditLog } from '@/lib/audit-log';
import { z } from 'zod';

const signAnnexSchema = z.object({
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'Vous devez cocher la case pour confirmer votre signature',
  }),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { annexId: string } }
) {
  try {
    const user = await requireAuth(request);
    const annexId = params.annexId;

    const body = await request.json();
    const validatedData = signAnnexSchema.parse(body);

    // Get annex with lease relations
    const annex = await prisma.annexDocument.findUnique({
      where: { id: annexId },
      include: {
        lease: {
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
                tenant: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        signatures: true,
      },
    });

    if (!annex) {
      return NextResponse.json(
        { error: 'Document annexe introuvable' },
        { status: 404 }
      );
    }

    // Verify user has access (tenant or landlord)
    const isTenant = annex.lease.application.tenant.userId === user.id;
    const isLandlord = annex.lease.application.listing.landlord.userId === user.id;

    if (!isTenant && !isLandlord) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Check if already signed by this user
    const existingSignature = annex.signatures.find(
      (sig) => sig.signerId === user.id
    );

    if (existingSignature) {
      return NextResponse.json(
        { error: 'Vous avez déjà signé ce document' },
        { status: 400 }
      );
    }

    // Get IP and user agent
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    // Create signature
    const signature = await prisma.annexSignature.create({
      data: {
        annexId,
        signerId: user.id,
        signerEmail: user.email,
        signerName: user.name,
        signerRole: user.role,
        consentGiven: validatedData.consentGiven,
        ipAddress,
        userAgent,
        documentVersion: annex.version,
      },
    });

    // Create audit log
    await createAuditLog('ANNEX_SIGNED', 'ANNEX', {
      userId: user.id,
      leaseId: annex.leaseId,
      annexId,
      metadata: {
        annexType: annex.type,
        ipAddress,
        userAgent,
        documentVersion: annex.version,
      },
    });

    return NextResponse.json(
      {
        message: 'Document annexe signé avec succès',
        signature,
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

    console.error('Erreur lors de la signature du document annexe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la signature' },
      { status: 500 }
    );
  }
}


