import Stripe from 'stripe'

// Initialiser Stripe seulement si la clé est définie
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  : null

// Fonction helper pour vérifier que Stripe est initialisé
export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  return stripe
}

