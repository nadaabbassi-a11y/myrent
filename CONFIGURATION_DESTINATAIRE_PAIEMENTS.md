# Configuration du Destinataire des Paiements

## Situation actuelle

**⚠️ Important :** Actuellement, tous les paiements vont au **compte Stripe principal** (le compte associé à votre clé secrète `STRIPE_SECRET_KEY`).

Cela signifie que :
- Les paiements des locataires arrivent sur **votre compte Stripe**
- Vous devez ensuite transférer manuellement les fonds aux propriétaires
- Ce n'est pas idéal pour une application de location

## Solutions recommandées

### Option 1 : Stripe Connect (Recommandé pour la production)

Stripe Connect permet d'envoyer les paiements directement aux propriétaires.

**Avantages :**
- Les paiements vont directement au compte du propriétaire
- Pas besoin de transférer manuellement
- Conformité avec les réglementations
- Le propriétaire peut gérer ses propres paiements

**Configuration :**
1. Activez Stripe Connect dans votre dashboard Stripe
2. Créez des comptes connectés pour chaque propriétaire
3. Modifiez les sessions Checkout pour utiliser `payment_intent_data.on_behalf_of`

### Option 2 : Compte Stripe principal (Actuel - Simple pour commencer)

**Avantages :**
- Simple à configurer
- Pas besoin de créer des comptes pour chaque propriétaire
- Idéal pour les tests et le développement

**Inconvénients :**
- Vous devez transférer manuellement les fonds
- Responsabilité fiscale sur votre compte
- Pas idéal pour la production

## Configuration actuelle

Les paiements sont configurés pour aller au compte Stripe principal. Pour vérifier :

1. Allez sur [https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)
2. Tous les paiements apparaîtront dans votre compte
3. Vous devrez transférer manuellement aux propriétaires

## Pour implémenter Stripe Connect (Option 1)

### Étape 1 : Activer Stripe Connect

1. Allez sur [https://dashboard.stripe.com/connect](https://dashboard.stripe.com/connect)
2. Activez Stripe Connect
3. Choisissez le type de compte (Express ou Standard)

### Étape 2 : Créer des comptes pour les propriétaires

Vous devrez :
1. Demander aux propriétaires de créer un compte Stripe Connect
2. Stocker leur `stripeAccountId` dans la base de données
3. Modifier les sessions Checkout pour utiliser leur compte

### Étape 3 : Modifier le code

Ajoutez dans les sessions Checkout :
```typescript
payment_intent_data: {
  on_behalf_of: landlordStripeAccountId,
  transfer_data: {
    destination: landlordStripeAccountId,
  },
}
```

## Pour l'instant (Option 2 - Simple)

Si vous utilisez le compte principal :
1. Les paiements arrivent sur votre compte Stripe
2. Vous pouvez voir tous les paiements dans le dashboard Stripe
3. Vous devez transférer manuellement aux propriétaires (virement bancaire, etc.)

## Recommandation

Pour commencer rapidement :
- ✅ Utilisez le compte Stripe principal (déjà configuré)
- ✅ Testez le système de paiement
- ⏳ Implémentez Stripe Connect plus tard pour la production

Pour la production :
- ⏳ Implémentez Stripe Connect
- ⏳ Créez des comptes pour chaque propriétaire
- ⏳ Configurez les transferts automatiques

