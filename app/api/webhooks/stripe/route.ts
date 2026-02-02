import { NextRequest, NextResponse } from 'next/server'
import { requireStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!webhookSecret) {
  console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will be disabled.')
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    )
  }

  const stripe = requireStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Récupérer les métadonnées
        const paymentId = session.metadata?.paymentId
        const leaseId = session.metadata?.leaseId
        const userId = session.metadata?.userId

        if (!paymentId || !leaseId || !userId) {
          console.error('Missing metadata in checkout session:', session.id)
          break
        }

        // Mettre à jour le paiement
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'paid',
            paidAt: new Date(),
            stripeId: session.payment_intent as string || session.id,
          },
        })

        console.log(`Payment ${paymentId} marked as paid for lease ${leaseId}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any // Utiliser any pour éviter les problèmes de types Stripe
        const subscriptionId = invoice.subscription 
          ? (typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id)
          : null

        if (!subscriptionId) break

        // Trouver le lease avec cet abonnement
        const lease = await prisma.lease.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
          include: {
            application: {
              include: {
                tenant: {
                  include: {
                    user: {
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        })

        if (!lease) {
          console.error(`Lease not found for subscription ${subscriptionId}`)
          break
        }

        // Créer ou mettre à jour le paiement
        const amount = invoice.amount_paid / 100 // Convertir de cents en dollars

        // Vérifier si le paiement existe déjà
        const existingPayment = await prisma.payment.findFirst({
          where: {
            stripeInvoiceId: invoice.id,
          },
        })

        if (existingPayment) {
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: 'paid',
              paidAt: new Date(invoice.created * 1000),
              stripeId: invoice.payment_intent ? (typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent.id) : null,
            },
          })
        } else {
          await prisma.payment.create({
            data: {
              leaseId: lease.id,
              userId: lease.application.tenant.user.id,
              amount,
              type: 'rent',
              status: 'paid',
              stripeId: invoice.payment_intent ? (typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent.id) : null,
              stripeInvoiceId: invoice.id,
              paidAt: new Date(invoice.created * 1000),
              dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
            },
          })
        }

        console.log(`Payment recorded for lease ${lease.id}: ${amount} CAD`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any // Utiliser any pour éviter les problèmes de types Stripe
        const subscriptionId = invoice.subscription 
          ? (typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id)
          : null

        if (!subscriptionId) break

        const lease = await prisma.lease.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
          include: {
            application: {
              include: {
                tenant: {
                  include: {
                    user: {
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        })

        if (!lease) break

        const amount = invoice.amount_due / 100

        const existingPayment = await prisma.payment.findFirst({
          where: {
            stripeInvoiceId: invoice.id,
          },
        })

        if (existingPayment) {
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: 'failed',
            },
          })
        } else {
          await prisma.payment.create({
            data: {
              leaseId: lease.id,
              userId: lease.application.tenant.user.id,
              amount,
              type: 'rent',
              status: 'failed',
              stripeInvoiceId: invoice.id,
              dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
            },
          })
        }

        console.log(`Payment failed for lease ${lease.id}: ${amount} CAD`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await prisma.lease.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripeSubscriptionId: null,
          },
        })

        console.log(`Subscription ${subscription.id} cancelled`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

