import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateLeasePDF } from '@/lib/pdf-generator';
import { storePDF } from '@/lib/storage';
import { generateDocumentHash, generateDocumentId } from '@/lib/document-hash';
import { createAuditLog } from '@/lib/audit-log';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: leaseId } = await params;

    // Get lease with all relations needed for PDF
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
            tenant: {
              include: {
                user: true,
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

    // Verify user has access (tenant or landlord)
    const isTenant = lease.application.tenant.userId === user.id;
    const isLandlord = lease.application.listing.landlord.userId === user.id;

    if (!isTenant && !isLandlord) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Check both signatures exist
    if (!lease.tenantSignature || !lease.ownerSignature) {
      return NextResponse.json(
        { error: 'Les deux signatures sont requises pour finaliser le bail' },
        { status: 400 }
      );
    }

    // Check if already finalized
    if (lease.status === 'FINALIZED' && lease.pdfUrl) {
      return NextResponse.json(
        {
          message: 'Bail déjà finalisé',
          pdfUrl: lease.pdfUrl,
          documentId: lease.documentId,
        },
        { status: 200 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateLeasePDF(lease);
    const documentHash = generateDocumentHash(pdfBuffer);
    const documentId = lease.documentId || generateDocumentId();

    // Store PDF
    const filename = `lease-${leaseId}-v${lease.pdfVersion}-${Date.now()}.pdf`;
    const pdfUrl = await storePDF(pdfBuffer, filename);

    // Update lease with final PDF
    const finalizedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: 'FINALIZED',
        documentId,
        documentHash,
        pdfUrl,
        finalizedAt: new Date(),
      },
    });

    // Create audit log
    await createAuditLog('LEASE_FINALIZED', 'LEASE', {
      userId: user.id,
      leaseId,
      metadata: {
        documentId,
        documentHash,
        pdfVersion: lease.pdfVersion,
        pdfUrl,
      },
    });

    await createAuditLog('PDF_GENERATED', 'LEASE', {
      userId: user.id,
      leaseId,
      metadata: {
        documentId,
        documentHash,
        pdfVersion: lease.pdfVersion,
        filename,
      },
    });

    return NextResponse.json(
      {
        message: 'Bail finalisé avec succès',
        documentId,
        pdfUrl,
        finalizedAt: finalizedLease.finalizedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode: number }).statusCode;
      if (statusCode === 401 || statusCode === 403) {
        return NextResponse.json(
          { error: 'Non autorisé' },
          { status: statusCode }
        );
      }
    }

    console.error('Erreur lors de la finalisation du bail:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la finalisation du bail' },
      { status: 500 }
    );
  }
}

