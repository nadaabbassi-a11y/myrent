import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireStripe } from '@/lib/stripe';

// POST - Créer un paiement pour le solde restant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, 'TENANT');
    const { id: leaseId } = await params;
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

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

    // Récupérer le bail
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        application: {
          include: {
            listing: {
              select: {
                title: true,
                address: true,
                city: true,
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

    // Créer un paiement pour le solde
    const payment = await prisma.payment.create({
      data: {
        leaseId: lease.id,
        userId: user.id,
        amount: amount,
        type: 'rent',
        status: 'pending',
        dueDate: new Date(),
      },
    });

    // Créer une session de paiement Stripe
    let stripe;
    try {
      stripe = requireStripe();
    } catch (stripeError) {
      console.error('Erreur Stripe:', stripeError);
      // Supprimer le paiement créé si Stripe n'est pas configuré
      await prisma.payment.delete({
        where: { id: payment.id },
      }).catch(() => {
        // Ignorer l'erreur de suppression
      });
      return NextResponse.json(
        { 
          error: 'Le système de paiement n\'est pas configuré',
          details: stripeError instanceof Error ? stripeError.message : 'Stripe non configuré'
        },
        { status: 500 }
      );
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: 'Solde du loyer',
                description: `Paiement du solde pour ${lease.application.listing.title}`,
              },
              unit_amount: Math.round(amount * 100), // Convertir en cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tenant/rent-management/${leaseId}?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tenant/rent-management/${leaseId}?payment=cancelled`,
        metadata: {
          paymentId: payment.id,
          leaseId: lease.id,
          userId: user.id,
        },
        customer_email: user.email,
      });
    } catch (stripeError) {
      console.error('Erreur création session Stripe:', stripeError);
      // Supprimer le paiement créé si la session Stripe échoue
      await prisma.payment.delete({
        where: { id: payment.id },
      }).catch(() => {
        // Ignorer l'erreur de suppression
      });
      throw stripeError;
    }

    // Mettre à jour le paiement avec l'ID de session Stripe
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripeId: session.id,
      },
    });

    return NextResponse.json(
      { checkoutUrl: session.url, paymentId: payment.id },
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

    console.error('Erreur lors de la création du paiement:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du paiement',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

