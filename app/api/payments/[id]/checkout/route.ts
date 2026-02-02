import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireStripe } from '@/lib/stripe';

// POST - Créer une session de paiement Stripe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, 'TENANT');
    const { id: paymentId } = await params;

    // Récupérer le paiement
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        lease: {
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
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Paiement introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que le paiement appartient au locataire
    if (payment.userId !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que le paiement est en attente
    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Ce paiement ne peut plus être payé' },
        { status: 400 }
      );
    }

    // Vérifier que Stripe est configuré et obtenir l'instance
    let stripe;
    try {
      stripe = requireStripe();
    } catch (stripeError) {
      console.error('Erreur Stripe:', stripeError);
      return NextResponse.json(
        { 
          error: 'Le système de paiement n\'est pas configuré',
          details: stripeError instanceof Error ? stripeError.message : 'Stripe non configuré'
        },
        { status: 500 }
      );
    }

    // Créer une session de paiement Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: payment.type === 'rent' ? 'Loyer' : payment.type === 'deposit' ? 'Dépôt de garantie' : 'Frais',
                description: `Paiement pour ${payment.lease.application.listing.title}`,
              },
              unit_amount: Math.round(payment.amount * 100), // Convertir en cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tenant/rent-management/${payment.leaseId}?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tenant/rent-management/${payment.leaseId}?payment=cancelled`,
        metadata: {
          paymentId: payment.id,
          leaseId: payment.leaseId,
          userId: user.id,
        },
        customer_email: user.email,
      });
    } catch (stripeError) {
      console.error('Erreur création session Stripe:', stripeError);
      throw stripeError;
    }

    // Mettre à jour le paiement avec l'ID de session Stripe
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        stripeId: session.id,
      },
    });

    return NextResponse.json(
      { checkoutUrl: session.url },
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

    console.error('Erreur lors de la création de la session de paiement:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    // Si c'est une erreur Stripe, donner plus de détails
    if (error instanceof Error && error.message.includes('Stripe')) {
      return NextResponse.json(
        { 
          error: 'Erreur Stripe: Le système de paiement n\'est pas configuré correctement',
          details: errorMessage 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la session de paiement',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

