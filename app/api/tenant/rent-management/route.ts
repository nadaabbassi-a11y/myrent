import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer tous les baux finalisés pour la gestion de loyer (locataire)
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, 'TENANT');

    // Récupérer le profil locataire
    const tenantProfile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      return NextResponse.json(
        { error: 'Profil locataire introuvable' },
        { status: 404 }
      );
    }

    // Récupérer tous les baux finalisés du locataire
    const leases = await prisma.lease.findMany({
      where: {
        status: 'FINALIZED',
        application: {
          tenantId: tenantProfile.id,
        },
      },
      include: {
        application: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                address: true,
                city: true,
                area: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        finalizedAt: 'desc',
      },
    });

    // Calculer la balance pour chaque bail
    const formattedLeases = leases.map((lease) => {
      const totalPaid = lease.payments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

      const now = new Date();
      const startDate = new Date(lease.startDate);
      const endDate = new Date(lease.endDate);
      
      let monthsDue = 0;
      if (now >= startDate) {
        const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                          (now.getMonth() - startDate.getMonth());
        monthsDue = Math.max(0, Math.min(monthsDiff + 1, 
          Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))));
      }
      
      const totalRentDue = monthsDue * lease.monthlyRent;
      const totalDue = lease.deposit + totalRentDue;
      const balance = totalDue - totalPaid;

      return {
        id: lease.id,
        startDate: lease.startDate.toISOString(),
        endDate: lease.endDate.toISOString(),
        monthlyRent: lease.monthlyRent,
        deposit: lease.deposit,
        status: lease.status,
        finalizedAt: lease.finalizedAt?.toISOString() || null,
        application: {
          listing: {
            id: lease.application.listing.id,
            title: lease.application.listing.title,
            address: lease.application.listing.address,
            city: lease.application.listing.city,
            area: lease.application.listing.area,
          },
        },
        balance: {
          totalDue,
          totalPaid,
          balance,
          monthsDue,
        },
      };
    });

    return NextResponse.json(
      { leases: formattedLeases },
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

    console.error('Erreur lors de la récupération des baux pour la gestion de loyer:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

