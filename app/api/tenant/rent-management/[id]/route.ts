import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer un bail spécifique pour la gestion de loyer (locataire)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, 'TENANT');
    const { id: leaseId } = await params;

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

    // Récupérer le bail spécifique
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
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
                wifiIncluded: true,
                heatingIncluded: true,
                hotWaterIncluded: true,
                electricityIncluded: true,
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
            messageThread: {
              select: {
                id: true,
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
    });

    if (!lease) {
      return NextResponse.json(
        { error: 'Bail introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'application existe
    if (!lease.application) {
      console.error('Lease application is missing for lease:', leaseId);
      return NextResponse.json(
        { error: 'Données du bail incomplètes' },
        { status: 500 }
      );
    }

    // Vérifier que le bail appartient au locataire
    if (lease.application.tenantId !== tenantProfile.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que le bail est finalisé
    if (lease.status !== 'FINALIZED') {
      return NextResponse.json(
        { error: 'Ce bail n\'est pas encore finalisé' },
        { status: 400 }
      );
    }

    // Calculer la balance
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

    // Vérifier que toutes les données nécessaires sont présentes
    if (!lease.application.listing) {
      console.error('Lease listing is missing for lease:', leaseId);
      return NextResponse.json(
        { error: 'Données du logement incomplètes' },
        { status: 500 }
      );
    }

    if (!lease.application.tenant || !lease.application.tenant.user) {
      console.error('Lease tenant or tenant user is missing for lease:', leaseId);
      return NextResponse.json(
        { error: 'Données du locataire incomplètes' },
        { status: 500 }
      );
    }

    const formattedLease = {
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
          wifiIncluded: lease.application.listing.wifiIncluded,
          heatingIncluded: lease.application.listing.heatingIncluded,
          hotWaterIncluded: lease.application.listing.hotWaterIncluded,
          electricityIncluded: lease.application.listing.electricityIncluded,
        },
        tenant: {
          id: lease.application.tenant.id,
          user: {
            id: lease.application.tenant.user.id,
            name: lease.application.tenant.user.name,
            email: lease.application.tenant.user.email,
          },
          phone: lease.application.tenant.phone,
        },
        messageThreadId: lease.application.messageThread?.id || null,
      },
      payments: lease.payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        dueDate: payment.dueDate?.toISOString() || null,
        paidAt: payment.paidAt?.toISOString() || null,
        createdAt: payment.createdAt.toISOString(),
        stripeId: payment.stripeId,
      })),
      balance: {
        totalDue,
        totalPaid,
        balance,
        monthsDue,
      },
    };

    return NextResponse.json(
      { lease: formattedLease },
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

    console.error('Erreur lors de la récupération du bail:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des données',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

