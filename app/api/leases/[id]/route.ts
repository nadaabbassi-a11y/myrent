import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les détails d'un bail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, 'TENANT');
    const { id: leaseId } = await params;

    console.log(`[API/leases/${leaseId}] Début de la récupération du bail pour l'utilisateur: ${user.id}`);

    // Récupérer le profil locataire
    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      console.error(`[API/leases/${leaseId}] Profil locataire introuvable pour l'utilisateur: ${user.id}`);
      return NextResponse.json(
        { error: 'Profil locataire introuvable' },
        { status: 404 }
      );
    }

    console.log(`[API/leases/${leaseId}] Profil locataire trouvé: ${tenantProfile.id}`);

    // Récupérer le bail avec toutes les informations nécessaires
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
            answers: {
              where: {
                stepKey: {
                  in: ['identity', 'address'],
                },
              },
            },
          },
        },
        tenantSignature: true,
        ownerSignature: true,
        annexDocuments: {
          include: {
            signatures: true,
          },
        },
      },
    });

    if (!lease) {
      console.error(`[API/leases/${leaseId}] Bail introuvable avec l'ID: ${leaseId}`);
      
      // Vérifier si un bail existe avec cet ID
      try {
        const leaseExists = await prisma.lease.findUnique({
          where: { id: leaseId },
          select: { 
            id: true, 
            applicationId: true,
            application: {
              select: {
                tenantId: true,
                tenant: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        });
        
        if (!leaseExists) {
          console.error(`[API/leases/${leaseId}] Aucun bail trouvé avec cet ID dans la base de données`);
        } else {
          console.error(`[API/leases/${leaseId}] Bail trouvé mais problème d'accès. Application tenantId: ${leaseExists.application?.tenantId}, Tenant userId: ${leaseExists.application?.tenant?.userId}, User actuel: ${user.id}`);
        }
      } catch (checkError) {
        console.error(`[API/leases/${leaseId}] Erreur lors de la vérification du bail:`, checkError);
      }
      
      return NextResponse.json(
        { error: 'Bail introuvable' },
        { status: 404 }
      );
    }

    console.log(`[API/leases/${leaseId}] Bail trouvé, applicationId: ${lease.applicationId}`);

    // Vérifier que l'application existe
    if (!lease.application) {
      console.error(`[API/leases/${leaseId}] Application manquante pour le bail: ${leaseId}`);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des informations du bail (application manquante)' },
        { status: 500 }
      );
    }

    // Vérifier que le tenant existe
    if (!lease.application.tenant) {
      console.error(`[API/leases/${leaseId}] Tenant manquant pour l'application: ${lease.applicationId}`);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des informations du bail (locataire manquant)' },
        { status: 500 }
      );
    }

    // Vérifier que l'utilisateur du tenant existe
    if (!lease.application.tenant.user) {
      console.error(`[API/leases/${leaseId}] User manquant pour le tenant: ${lease.application.tenant.id}`);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des informations du bail (utilisateur manquant)' },
        { status: 500 }
      );
    }

    // Vérifier que l'utilisateur a accès à ce bail
    if (lease.application.tenant.user.id !== user.id) {
      console.error(`[API/leases/${leaseId}] Accès non autorisé. Utilisateur ${user.id} tente d'accéder au bail ${leaseId} qui appartient à ${lease.application.tenant.user.id}`);
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { lease },
      { status: 200 }
    );
  } catch (error) {
    const { id: leaseId } = await params;
    console.error(`[API/leases/${leaseId}] Erreur lors de la récupération du bail:`, error);
    
    if (error instanceof Error) {
      console.error(`[API/leases/${leaseId}] Message d'erreur:`, error.message);
      console.error(`[API/leases/${leaseId}] Stack:`, error.stack);
      
      if ('statusCode' in error) {
        const statusCode = (error as Error & { statusCode: number }).statusCode;
        if (statusCode === 401 || statusCode === 403) {
          return NextResponse.json(
            { error: 'Non autorisé' },
            { status: statusCode }
          );
        }
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la récupération du bail' },
      { status: 500 }
    );
  }
}
