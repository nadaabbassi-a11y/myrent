# Guide de Configuration des Paiements de Loyer

## Vue d'ensemble

Le système de paiement de loyer permet aux locataires de payer leur loyer mensuel et leur dépôt de garantie via Stripe. Les paiements peuvent être effectués manuellement ou automatiquement (paiements récurrents).

## Configuration de base

### 1. Configuration Stripe

Suivez le guide dans `CONFIGURATION_STRIPE.md` pour :
- Créer un compte Stripe
- Obtenir vos clés API
- Configurer les variables d'environnement
- Configurer les webhooks

### 2. Variables d'environnement requises

```bash
# Dans .env.local (développement) ou Vercel (production)
STRIPE_SECRET_KEY=sk_test_votre_cle_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook_ici
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ou https://votre-domaine.com en production
```

## Fonctionnement actuel

### Paiements manuels

Actuellement, le système fonctionne avec des paiements manuels :

1. **Création automatique du dépôt** : Lorsqu'un bail est finalisé, le dépôt de garantie peut être créé automatiquement
2. **Paiement du solde** : Le locataire peut payer le solde restant via le bouton "Payer le solde"
3. **Paiements individuels** : Chaque paiement en attente peut être payé individuellement

### Création des paiements

Les paiements sont créés de deux façons :

1. **Automatiquement lors de la finalisation** (à implémenter)
2. **Manuellement via l'API** `/api/leases/[id]/create-balance-payment`

## Implémentation des paiements mensuels automatiques

### Option 1 : Paiements récurrents avec Stripe Subscriptions

Cette option permet de créer un abonnement Stripe qui facture automatiquement le locataire chaque mois.

**Avantages :**
- Paiements automatiques
- Gestion des échecs de paiement par Stripe
- Notifications automatiques

**Inconvénients :**
- Nécessite que le locataire enregistre une carte
- Plus complexe à implémenter

### Option 2 : Génération mensuelle de paiements (recommandé)

Cette option crée automatiquement un paiement mensuel chaque mois, que le locataire doit payer manuellement.

**Avantages :**
- Simple à implémenter
- Le locataire contrôle quand il paie
- Pas besoin d'enregistrer une carte à l'avance

**Inconvénients :**
- Le locataire doit se souvenir de payer chaque mois
- Pas de paiement automatique

## Configuration recommandée : Génération mensuelle

### Étape 1 : Créer un script de génération mensuelle

Créez un script qui s'exécute chaque mois pour générer les paiements de loyer :

```typescript
// scripts/generate-monthly-payments.ts
// Ce script peut être exécuté via un cron job ou une fonction serverless
```

### Étape 2 : API pour générer les paiements (✅ Implémentée)

L'API `/api/leases/[id]/generate-monthly-payment` est déjà créée et :
1. ✅ Vérifie si un paiement pour ce mois existe déjà
2. ✅ Calcule le montant du loyer
3. ✅ Crée un paiement avec `dueDate` = premier du mois suivant
4. ⏳ Envoie une notification au locataire (à implémenter)

### Étape 3 : Automatiser avec un cron job

Configurez un cron job (via Vercel Cron, GitHub Actions, ou un service externe) pour :
- S'exécuter le 1er de chaque mois
- Générer les paiements pour tous les baux actifs
- Envoyer des notifications aux locataires

## Configuration immédiate (sans automatisation)

Pour l'instant, vous pouvez :

1. **Créer manuellement les paiements** via l'interface admin
2. **Utiliser le bouton "Payer le solde"** pour permettre au locataire de payer tout ce qui est dû
3. **Créer les paiements lors de la finalisation** du bail

## Test des paiements

### Cartes de test Stripe

- **Succès** : `4242 4242 4242 4242`
- **Refusée** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0025 0000 3155`
- **Date** : N'importe quelle date future
- **CVC** : N'importe quel code à 3 chiffres

### Tester le flux complet

1. Finalisez un bail
2. Allez sur la page de gestion de loyer du locataire
3. Cliquez sur "Payer le solde" ou "Payer" pour un paiement spécifique
4. Utilisez une carte de test Stripe
5. Vérifiez que le paiement est marqué comme "Payé" après le retour

## Webhooks Stripe

Les webhooks sont essentiels pour mettre à jour automatiquement le statut des paiements :

1. **checkout.session.completed** : Marque le paiement comme payé
2. **payment_intent.succeeded** : Confirme le paiement
3. **payment_intent.payment_failed** : Marque le paiement comme échoué

## Prochaines étapes recommandées

1. ✅ Configuration Stripe de base (fait)
2. ⏳ Création automatique du dépôt lors de la finalisation
3. ⏳ Génération mensuelle automatique des paiements de loyer
4. ⏳ Notifications par email pour les paiements dus
5. ⏳ Rappels automatiques pour les paiements en retard

