# 🚀 Guide de Déploiement sur Vercel

## Prérequis

1. Un compte GitHub avec votre code
2. Un compte Vercel (gratuit) : [https://vercel.com](https://vercel.com)
3. Un compte Stripe : [https://stripe.com](https://stripe.com)

## Étape 1 : Préparer le code sur GitHub

```bash
# Si vous n'avez pas encore de dépôt Git
git init
git add .
git commit -m "Ready for Vercel deployment"

# Créer un dépôt sur GitHub.com, puis :
git remote add origin https://github.com/VOTRE_USERNAME/myrent.git
git branch -M main
git push -u origin main
```

## Étape 2 : Déployer sur Vercel

### 2.1 Créer le projet sur Vercel

1. Allez sur [https://vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur **"Add New Project"**
4. Sélectionnez votre dépôt `myrent`
5. Vercel détectera automatiquement Next.js

### 2.2 Configurer la base de données PostgreSQL

**Option A : Utiliser Neon (recommandé - gratuit)**

1. Allez sur [https://neon.tech](https://neon.tech)
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Copiez la `DATABASE_URL` (format : `postgresql://user:password@host/dbname?sslmode=require`)

**Option B : Utiliser Vercel Postgres**

1. Dans Vercel, allez dans **Storage**
2. Cliquez sur **"Create Database"** → **"Postgres"**
3. Créez la base de données
4. Copiez la `DATABASE_URL` générée

### 2.3 Configurer les variables d'environnement

Dans Vercel, allez dans votre projet → **Settings** → **Environment Variables** et ajoutez :

#### Variables obligatoires

```bash
# Base de données
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT Secret (générez-en un nouveau pour la production)
JWT_SECRET=votre-secret-jwt-tres-securise-minimum-32-caracteres

# URL de l'application (sera mis à jour automatiquement après le premier déploiement)
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app

# Stripe - Clé secrète (obtenez-la sur https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_votre_cle_live_ici
# OU pour les tests : sk_test_votre_cle_test_ici
```

#### Variables optionnelles (Email)

```bash
# Option 1 : Resend
RESEND_API_KEY=re_votre_cle_resend
RESEND_FROM_EMAIL=noreply@votre-domaine.com

# Option 2 : SendGrid
SENDGRID_API_KEY=SG.votre_cle_sendgrid
SENDGRID_FROM_EMAIL=noreply@votre-domaine.com
```

#### Variables optionnelles (Storage)

```bash
# Vercel Blob Storage (pour les fichiers PDF)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_votre_token
```

### 2.4 Déployer

1. Cliquez sur **"Deploy"**
2. Attendez 2-5 minutes pour le build
3. Une fois terminé, votre site sera accessible à `https://votre-app.vercel.app`

## Étape 3 : Migrer la base de données

### Méthode 1 : Via Vercel CLI (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Récupérer les variables d'environnement
vercel env pull .env.local

# Exécuter les migrations
npx prisma migrate deploy
```

### Méthode 2 : Via l'interface Vercel

1. Allez dans votre projet Vercel → **Settings** → **Functions**
2. Vérifiez que `DATABASE_URL` est bien définie
3. Redéployez le projet (les migrations s'exécuteront automatiquement grâce à `vercel.json`)

## Étape 4 : Configurer Stripe Webhooks (Important pour les paiements)

### 4.1 Créer le webhook dans Stripe

1. Allez sur [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur **"Add endpoint"**
3. URL du webhook : `https://votre-app.vercel.app/api/webhooks/stripe`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Cliquez sur **"Add endpoint"**
6. Copiez le **Signing secret** (commence par `whsec_...`)

### 4.2 Ajouter le secret dans Vercel

1. Dans Vercel, allez dans **Settings** → **Environment Variables**
2. Ajoutez :
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
   ```
3. Redéployez le projet

## Étape 5 : Vérifier le déploiement

1. Visitez `https://votre-app.vercel.app`
2. Testez la création de compte
3. Testez un paiement avec une carte de test Stripe :
   - Carte : `4242 4242 4242 4242`
   - Date : n'importe quelle date future
   - CVC : n'importe quel code à 3 chiffres

## Générer un JWT_SECRET sécurisé

```bash
# Sur Mac/Linux
openssl rand -base64 32

# Ou utiliser Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Checklist de déploiement

- [ ] Code poussé sur GitHub
- [ ] Compte Vercel créé et connecté à GitHub
- [ ] Projet importé sur Vercel
- [ ] Base de données PostgreSQL créée (Neon ou Vercel)
- [ ] `DATABASE_URL` configurée dans Vercel
- [ ] `JWT_SECRET` généré et configuré
- [ ] `STRIPE_SECRET_KEY` configurée (clé live pour production)
- [ ] `NEXT_PUBLIC_APP_URL` configurée
- [ ] Migrations de base de données exécutées
- [ ] Webhook Stripe configuré
- [ ] `STRIPE_WEBHOOK_SECRET` configuré
- [ ] Site accessible en ligne
- [ ] Tests fonctionnels effectués

## Dépannage

### Erreur de build

1. Vérifiez les logs dans Vercel → **Deployments** → Cliquez sur le déploiement
2. Testez le build localement : `npm run build`
3. Vérifiez que toutes les variables d'environnement sont définies

### Erreur de base de données

1. Vérifiez que `DATABASE_URL` est correcte
2. Vérifiez que la base de données est accessible depuis Internet
3. Exécutez les migrations manuellement : `npx prisma migrate deploy`

### Erreur Stripe

1. Vérifiez que `STRIPE_SECRET_KEY` est correcte
2. Vérifiez que vous utilisez la bonne clé (test vs live)
3. Vérifiez les logs Stripe dans le dashboard

### Erreur de paiement

1. Vérifiez que le webhook Stripe est configuré
2. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
3. Testez avec les cartes de test Stripe

## Support

Pour plus d'aide :
- Documentation Vercel : [https://vercel.com/docs](https://vercel.com/docs)
- Documentation Stripe : [https://stripe.com/docs](https://stripe.com/docs)
- Documentation Prisma : [https://www.prisma.io/docs](https://www.prisma.io/docs)

