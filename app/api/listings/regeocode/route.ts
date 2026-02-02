import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/types';
import { geocodeAddressWithFallback } from '@/lib/geocode';

/**
 * Route pour regéocoder tous les listings qui n'ont pas de coordonnées
 * ou qui ont des coordonnées incorrectes
 * LANDLORD only
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, Role.LANDLORD);

    // Récupérer tous les listings actifs
    const listings = await prisma.listing.findMany({
      where: {
        status: 'active',
      },
      include: {
        landlord: {
          select: {
            userId: true,
          },
        },
      },
    });

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const listing of listings) {
      try {
        // Vérifier si le listing a déjà des coordonnées valides
        if (listing.latitude != null && listing.longitude != null) {
          // Vérifier si les coordonnées sont dans une plage valide pour le Canada
          // Latitude: 41.7 à 83.1, Longitude: -141.0 à -52.6
          if (
            listing.latitude >= 41.7 && listing.latitude <= 83.1 &&
            listing.longitude >= -141.0 && listing.longitude <= -52.6
          ) {
            results.push({
              id: listing.id,
              title: listing.title,
              status: 'skipped',
              reason: 'Coordonnées déjà valides',
            });
            continue;
          }
        }

        // Regéocoder l'adresse
        const geocodeResult = await geocodeAddressWithFallback(
          listing.address || '',
          listing.city,
          listing.area || undefined,
          listing.postalCode || undefined
        );

        if (geocodeResult) {
          // Mettre à jour le listing avec les nouvelles coordonnées
          await prisma.listing.update({
            where: { id: listing.id },
            data: {
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude,
            },
          });

          successCount++;
          results.push({
            id: listing.id,
            title: listing.title,
            status: 'success',
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude,
          });
        } else {
          errorCount++;
          results.push({
            id: listing.id,
            title: listing.title,
            status: 'error',
            reason: 'Impossible de géocoder l\'adresse',
          });
        }

        // Attendre un peu entre chaque requête pour ne pas surcharger l'API Nominatim
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        errorCount++;
        results.push({
          id: listing.id,
          title: listing.title,
          status: 'error',
          reason: error.message || 'Erreur inconnue',
        });
      }
    }

    return NextResponse.json(
      {
        message: `Regéocodage terminé: ${successCount} succès, ${errorCount} erreurs`,
        total: listings.length,
        success: successCount,
        errors: errorCount,
        results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Vous devez être un propriétaire.' },
        { status: 403 }
      );
    }

    console.error('Erreur lors du regéocodage:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du regéocodage' },
      { status: 500 }
    );
  }
}


