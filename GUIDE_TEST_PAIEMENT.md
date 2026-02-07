# Guide de Test du Système de Paiement

## Prérequis

1. ✅ Clé Stripe configurée dans `.env.local`
2. ✅ Serveur de développement démarré
3. ✅ Base de données avec au moins un bail finalisé

## Étapes de Test

### 1. Démarrer le serveur

```bash
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:3000`

### 2. Vérifier la configuration Stripe

Vérifiez que votre clé est bien configurée :
```bash
grep STRIPE_SECRET_KEY .env.local
```

Vous devriez voir : `STRIPE_SECRET_KEY=sk_test_...`

### 3. Créer ou utiliser un bail finalisé

**Option A : Utiliser un bail existant**
- Connectez-vous en tant que locataire
- Allez sur "Gestion de loyer" dans le menu
- Si vous voyez des baux, vous pouvez tester directement

**Option B : Créer un nouveau bail**
1. Connectez-vous en tant que locataire
2. Créez une candidature pour une propriété
3. Le propriétaire doit accepter la candidature
4. Les deux parties doivent signer le bail
5. Finalisez le bail (cela créera automatiquement les paiements)

### 4. Accéder à la page de gestion de loyer

1. Connectez-vous en tant que **locataire**
2. Cliquez sur **"Gestion de loyer"** dans le menu (en haut à droite)
3. Cliquez sur un bail dans la liste
4. Vous devriez voir :
   - La balance de paiement
   - L'historique des paiements
   - Les boutons "Payer" pour les paiements en attente
   - Le bouton "Payer le solde" si il y a un solde

### 5. Tester un paiement

#### Test 1 : Payer un paiement spécifique

1. Dans la page de gestion de loyer, trouvez un paiement avec le statut **"En attente"**
2. Cliquez sur le bouton **"Payer"**
3. Vous serez redirigé vers Stripe Checkout
4. Utilisez une **carte de test Stripe** :

   **Carte de test réussie :**
   - Numéro : `4242 4242 4242 4242`
   - Date d'expiration : N'importe quelle date future (ex: `12/34`)
   - CVC : N'importe quel code à 3 chiffres (ex: `123`)
   - Code postal : N'importe quel code postal (ex: `12345`)

5. Cliquez sur **"Payer"**
6. Vous serez redirigé vers la page de gestion de loyer avec `?payment=success`

#### Test 2 : Payer le solde complet

1. Si vous avez un solde restant, cliquez sur **"Payer le solde"**
2. Suivez les mêmes étapes que ci-dessus avec une carte de test

### 6. Vérifier le paiement

#### Dans l'application :
1. Rechargez la page de gestion de loyer
2. Le paiement devrait maintenant être marqué comme **"Payé"**
3. Le solde devrait être mis à jour
4. Vous devriez voir un bouton **"Reçu"** pour télécharger le reçu PDF

#### Dans le dashboard Stripe :
1. Allez sur [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
2. Vous devriez voir le paiement avec le statut **"Succeeded"**
3. Cliquez sur le paiement pour voir les détails

### 7. Tester le reçu PDF

1. Dans la page de gestion de loyer, trouvez un paiement **"Payé"**
2. Cliquez sur le bouton **"Reçu"**
3. Un PDF devrait s'ouvrir avec les détails du paiement

## Cartes de Test Stripe

### Carte de test réussie
- **Numéro :** `4242 4242 4242 4242`
- **Date :** N'importe quelle date future
- **CVC :** N'importe quel code à 3 chiffres

### Carte de test refusée
- **Numéro :** `4000 0000 0000 0002`
- **Date :** N'importe quelle date future
- **CVC :** N'importe quel code à 3 chiffres

### Carte nécessitant une authentification 3D Secure
- **Numéro :** `4000 0025 0000 3155`
- **Date :** N'importe quelle date future
- **CVC :** N'importe quel code à 3 chiffres

## Dépannage

### Erreur : "Le système de paiement n'est pas configuré"
- Vérifiez que `STRIPE_SECRET_KEY` est dans `.env.local`
- Redémarrez le serveur après avoir ajouté la clé

### Erreur : "Failed to fetch"
- Vérifiez que le serveur est bien démarré
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez les logs du serveur

### Le paiement ne s'affiche pas comme payé
- Vérifiez que le webhook Stripe est configuré (pour la production)
- En développement, le webhook peut ne pas fonctionner
- Vérifiez manuellement dans le dashboard Stripe

### Erreur : "Ce bail n'est pas encore finalisé"
- Le bail doit être finalisé pour créer les paiements
- Les deux parties doivent signer le bail
- Le bail doit être finalisé via le bouton "Finaliser le bail"

## Vérification du Webhook (Production)

Pour la production, vous devez configurer le webhook Stripe :
1. Allez sur [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Ajoutez une URL de webhook : `https://votre-domaine.com/api/webhooks/stripe`
3. Sélectionnez les événements : `checkout.session.completed`
4. Copiez le secret du webhook dans `STRIPE_WEBHOOK_SECRET` dans Vercel

## Prochaines Étapes

Une fois les tests réussis :
1. ✅ Vérifiez que les paiements apparaissent dans Stripe
2. ✅ Vérifiez que les reçus PDF se génèrent correctement
3. ✅ Testez avec différentes cartes de test
4. ⏳ Configurez le webhook pour la production
5. ⏳ Testez avec de vrais utilisateurs (en mode test Stripe)

