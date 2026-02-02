# Configuration Stripe pour les paiements

## Étapes pour configurer Stripe

### 1. Créer un compte Stripe

1. Allez sur [https://stripe.com](https://stripe.com)
2. Créez un compte (gratuit)
3. Connectez-vous au tableau de bord

### 2. Obtenir les clés API

1. Dans le tableau de bord Stripe, allez dans **Developers** > **API keys**
2. Vous verrez deux types de clés :
   - **Publishable key** (commence par `pk_test_...`) - pour le frontend
   - **Secret key** (commence par `sk_test_...`) - pour le backend

### 3. Configurer les variables d'environnement

Ouvrez le fichier `.env.local` et ajoutez votre clé secrète Stripe :

```bash
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
```

**Important :**
- Pour le développement, utilisez les clés de **test** (commencent par `sk_test_`)
- Pour la production, utilisez les clés **live** (commencent par `sk_live_`)
- Ne partagez jamais vos clés secrètes publiquement

### 4. Redémarrer le serveur

Après avoir ajouté la clé Stripe, redémarrez votre serveur de développement :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez-le
npm run dev
```

### 5. Tester les paiements

Une fois configuré, vous pouvez tester les paiements avec les cartes de test Stripe :

- **Carte de test réussie** : `4242 4242 4242 4242`
- **Carte de test refusée** : `4000 0000 0000 0002`
- **Date d'expiration** : n'importe quelle date future (ex: 12/34)
- **CVC** : n'importe quel code à 3 chiffres (ex: 123)
- **Code postal** : n'importe quel code postal valide

### 6. Webhooks (optionnel pour la production)

Pour recevoir les notifications de paiement en temps réel, configurez les webhooks :

1. Dans Stripe Dashboard, allez dans **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/webhooks/stripe`
4. Sélectionnez les événements : `checkout.session.completed`, `payment_intent.succeeded`
5. Copiez le **Signing secret** et ajoutez-le à `.env.local` :
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Vérification

Pour vérifier que Stripe est bien configuré :

1. Ouvrez la page de gestion de loyer d'un locataire
2. Cliquez sur "Payer" pour un paiement en attente
3. Vous devriez être redirigé vers la page de paiement Stripe

Si vous voyez toujours l'erreur "Le système de paiement n'est pas configuré", vérifiez que :
- La clé `STRIPE_SECRET_KEY` est bien dans `.env.local`
- Le serveur a été redémarré après l'ajout de la clé
- La clé commence bien par `sk_test_` (pour le développement)

