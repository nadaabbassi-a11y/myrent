import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit-log';

/**
 * Create default annex documents for a lease
 * Called automatically when a lease is created
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, 'LANDLORD');
    const { id: leaseId } = await params;

    // Verify lease exists and user owns it
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
      },
    });

    if (!lease) {
      return NextResponse.json(
        { error: 'Bail introuvable' },
        { status: 404 }
      );
    }

    if (lease.application.listing.landlord.userId !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Check if annexes already exist
    const existingAnnexes = await prisma.annexDocument.findMany({
      where: { leaseId },
    });

    if (existingAnnexes.length > 0) {
      return NextResponse.json(
        { message: 'Documents annexes déjà créés', annexes: existingAnnexes },
        { status: 200 }
      );
    }

    // Create default annex documents
    const annexes = await Promise.all([
      prisma.annexDocument.create({
        data: {
          leaseId,
          type: 'PAYMENT_CONSENT',
          title: 'Consentement au paiement en ligne',
          content: `En signant ce document, vous autorisez le prélèvement automatique du loyer mensuel via le système de paiement sécurisé MyRent (Stripe). Cette autorisation est facultative et peut être révoquée à tout moment.`,
          version: 1,
        },
      }),
      prisma.annexDocument.create({
        data: {
          leaseId,
          type: 'CREDIT_CHECK_AUTH',
          title: 'Autorisation de vérification de crédit',
          content: `En signant ce document, vous autorisez le propriétaire à effectuer une vérification de crédit pour évaluer votre solvabilité. Cette vérification sera effectuée conformément aux lois québécoises sur la protection des renseignements personnels.`,
          version: 1,
        },
      }),
      prisma.annexDocument.create({
        data: {
          leaseId,
          type: 'ELECTRONIC_COMMS',
          title: 'Consentement aux communications électroniques',
          content: `En signant ce document, vous acceptez de recevoir des communications électroniques (courriels, notifications) concernant votre bail et votre location via la plateforme MyRent.`,
          version: 1,
        },
      }),
    ]);

    // Create audit logs
    for (const annex of annexes) {
      await createAuditLog('ANNEX_CREATED', 'ANNEX', {
        userId: user.id,
        leaseId,
        annexId: annex.id,
        metadata: {
          annexType: annex.type,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Documents annexes créés avec succès',
        annexes,
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

    console.error('Erreur lors de la création des documents annexes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des documents annexes' },
      { status: 500 }
    );
  }
}

