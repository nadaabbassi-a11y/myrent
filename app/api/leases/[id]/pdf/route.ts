import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPDF } from '@/lib/storage';
import { createAuditLog } from '@/lib/audit-log';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: leaseId } = await params;

    // Get lease
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

    // Check if finalized
    if (lease.status !== 'FINALIZED' || !lease.pdfUrl) {
      return NextResponse.json(
        { error: 'Le bail n\'est pas encore finalisé' },
        { status: 400 }
      );
    }

    // Get PDF buffer
    const pdfBuffer = await getPDF(lease.pdfUrl);

    // Create audit log
    const action = request.headers.get('referer')?.includes('download') 
      ? 'PDF_DOWNLOADED' 
      : 'PDF_VIEWED';
    
    await createAuditLog(action, 'LEASE', {
      userId: user.id,
      leaseId,
      metadata: {
        documentId: lease.documentId,
        pdfVersion: lease.pdfVersion,
      },
    });

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="bail-${lease.documentId || leaseId}.pdf"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
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

    console.error('Erreur lors de la récupération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du PDF' },
      { status: 500 }
    );
  }
}

