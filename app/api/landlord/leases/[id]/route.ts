import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les détails d'un bail pour le propriétaire
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, 'LANDLORD');
    const { id: leaseId } = await params;

    console.log(`[API/landlord/leases/${leaseId}] Début de la récupération du bail pour le propriétaire: ${user.id}`);

    // Récupérer le profil propriétaire
    const landlordProfile = await prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      console.error(`[API/landlord/leases/${leaseId}] Profil propriétaire introuvable pour l'utilisateur: ${user.id}`);
      return NextResponse.json(
        { error: 'Profil propriétaire introuvable' },
        { status: 404 }
      );
    }

    console.log(`[API/landlord/leases/${leaseId}] Profil propriétaire trouvé: ${landlordProfile.id}`);

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
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
            tenant: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
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
      console.error(`[API/landlord/leases/${leaseId}] Bail introuvable avec l'ID: ${leaseId}`);
      return NextResponse.json(
        { error: 'Bail introuvable' },
        { status: 404 }
      );
    }

    console.log(`[API/landlord/leases/${leaseId}] Bail trouvé, applicationId: ${lease.applicationId}`);

    // Vérifier que le bail a une application et un listing
    if (!lease.application) {
      console.error(`[API/landlord/leases/${leaseId}] Application manquante`);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des informations du bail (application manquante)' },
        { status: 500 }
      );
    }

    if (!lease.application.listing) {
      console.error(`[API/landlord/leases/${leaseId}] Listing manquant`);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des informations du bail (listing manquant)' },
        { status: 500 }
      );
    }

    if (!lease.application.listing.landlord) {
      console.error(`[API/landlord/leases/${leaseId}] Landlord manquant`);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des informations du bail (propriétaire manquant)' },
        { status: 500 }
      );
    }

    // Vérifier que le propriétaire a accès à ce bail (doit être le propriétaire du listing)
    if (lease.application.listing.landlord.id !== landlordProfile.id) {
      console.error(`[API/landlord/leases/${leaseId}] Accès non autorisé. Propriétaire ${landlordProfile.id} tente d'accéder au bail ${leaseId} qui appartient au listing ${lease.application.listing.id} avec landlordId ${lease.application.listing.landlord.id}`);
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    console.log(`[API/landlord/leases/${leaseId}] Bail récupéré avec succès, préparation du retour`);

    // Formater les dates pour éviter les problèmes de sérialisation JSON
    try {
      const formattedLease = JSON.parse(JSON.stringify(lease, (key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }));

      console.log(`[API/landlord/leases/${leaseId}] Bail formaté avec succès`);
      
      return NextResponse.json(
        { lease: formattedLease },
        { status: 200 }
      );
    } catch (formatError) {
      console.error(`[API/landlord/leases/${leaseId}] Erreur lors du formatage du bail:`, formatError);
      return NextResponse.json(
        { error: 'Erreur lors du formatage des données du bail' },
        { status: 500 }
      );
    }
  } catch (error) {
    let leaseIdForLog = 'unknown';
    try {
      const { id } = await params;
      leaseIdForLog = id;
    } catch {
      // Si on ne peut pas récupérer l'ID, on utilise 'unknown'
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

    console.error(`[API/landlord/leases/${leaseIdForLog}] Erreur lors de la récupération du bail:`, error);
    if (error instanceof Error) {
      console.error(`[API/landlord/leases/${leaseIdForLog}] Message d'erreur:`, error.message);
      console.error(`[API/landlord/leases/${leaseIdForLog}] Stack:`, error.stack);
    }
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du bail',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

