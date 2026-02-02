import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getClientIP, getUserAgent } from '@/lib/request-utils';
import { createAuditLog } from '@/lib/audit-log';
import { z } from 'zod';

const signTenantSchema = z.object({
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'Vous devez cocher la case pour confirmer votre signature',
  }),
  initials: z.string().min(1, 'Les initiales sont requises').max(10),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[sign-tenant] Route appelée');
  
  try {
    const { id: leaseId } = await params;

    console.log('[sign-tenant] Paramètres résolus, leaseId:', leaseId);

    if (!leaseId) {
      console.error('[sign-tenant] leaseId manquant dans les paramètres');
      return NextResponse.json(
        { error: 'ID du bail manquant' },
        { status: 400 }
      );
    }

    console.log('[sign-tenant] Tentative de signature pour leaseId:', leaseId);

    const user = await requireRole(request, 'TENANT');
    console.log('[sign-tenant] Utilisateur authentifié:', user.id);

    const body = await request.json();
    const validatedData = signTenantSchema.parse(body);

    // Get lease with relations
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        application: {
          include: {
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

    // Verify tenant owns this lease
    if (lease.application.tenant.userId !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Check if already signed
    if (lease.tenantSignature) {
      return NextResponse.json(
        { error: 'Ce bail a déjà été signé par le locataire' },
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
    const ipAddress = getClientIP(request) || undefined;
    const userAgent = getUserAgent(request) || undefined;

    // Create tenant signature
    const signature = await prisma.leaseSignature.create({
      data: {
        leaseId,
        signerId: user.id,
        signerEmail: user.email,
        signerName: user.name,
        signerRole: 'TENANT',
        initials: validatedData.initials.toUpperCase(),
        consentGiven: validatedData.consentGiven,
        ipAddress,
        userAgent,
        documentVersion: lease.pdfVersion,
      },
    });

    // Update lease status
    const newStatus = lease.ownerSignature ? 'FINALIZED' : 'TENANT_SIGNED';
    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: newStatus,
      },
    });

    // Create audit log
    try {
      await createAuditLog('LEASE_TENANT_SIGNED', 'LEASE', {
        userId: user.id,
        leaseId,
        entityId: leaseId,
        metadata: {
          ipAddress,
          userAgent,
          documentVersion: lease.pdfVersion,
          initials: validatedData.initials,
        },
      });
    } catch (auditError) {
      // Log audit error but don't fail the signature
      console.error('Erreur lors de la création du log d\'audit:', auditError);
    }

    // If both signed, trigger finalization (auto-generate PDF)
    if (newStatus === 'FINALIZED') {
      // This will be handled by a separate endpoint or background job
      // For now, we'll return success and let the frontend call finalize
    }

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

    console.error('Erreur lors de la signature du locataire:', error);
    
    // Log l'erreur complète pour le débogage
    if (error instanceof Error) {
      console.error('Message d\'erreur:', error.message);
      console.error('Stack:', error.stack);
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la signature',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

