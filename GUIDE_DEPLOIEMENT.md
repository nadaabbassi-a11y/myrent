# 🚀 Guide de Déploiement - MyRent

Ce guide vous explique comment mettre votre application MyRent en ligne.

## 📋 Prérequis

- Un compte GitHub (pour héberger le code)
- Un compte sur une plateforme de déploiement (Vercel recommandé)
- Les clés API nécessaires (SendGrid, Resend, etc.)

---

## 🎯 Option 1 : Déploiement sur Vercel (Recommandé)

Vercel est la plateforme idéale pour Next.js car elle est créée par l'équipe de Next.js.

### Étape 1 : Préparer le code

1. **Créer un dépôt GitHub** (si ce n'est pas déjà fait) :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE_USERNAME/myrent.git
   git push -u origin main
   ```

2. **Créer un fichier `.env.example`** pour documenter les variables nécessaires :
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="votre-secret-jwt-tres-long-et-securise"
   RESEND_API_KEY="re_..."
   RESEND_FROM_EMAIL="onboarding@resend.dev"
   SENDGRID_API_KEY="SG...."
   SENDGRID_FROM_EMAIL="votre-email@exemple.com"
   NEXT_PUBLIC_APP_URL="https://votre-app.vercel.app"
   ```

### Étape 2 : Configurer Vercel

1. **Aller sur [vercel.com](https://vercel.com)** et créer un compte (ou se connecter avec GitHub)

2. **Cliquer sur "New Project"**

3. **Importer votre dépôt GitHub** :
   - Sélectionner votre dépôt `myrent`
   - Vercel détectera automatiquement Next.js

4. **Configurer les variables d'environnement** :
   - Dans "Environment Variables", ajouter toutes les variables de `.env.example`
   - **Important** : Pour `DATABASE_URL`, vous devrez utiliser une base de données en ligne (voir section Base de données)

5. **Configurer le Build** :
   - Build Command: `npm run build`
   - Output Directory: `.next` (par défaut)
   - Install Command: `npm install`

6. **Déployer** :
   - Cliquer sur "Deploy"
   - Attendre la fin du déploiement (2-3 minutes)

### Étape 3 : Configurer la base de données

SQLite ne fonctionne pas bien en production. Vous devez utiliser une base de données PostgreSQL.

#### Option A : PostgreSQL sur Vercel (Recommandé)

1. Dans votre projet Vercel, aller dans l'onglet "Storage"
2. Cliquer sur "Create Database" → "Postgres"
3. Créer la base de données
4. Copier la `DATABASE_URL` fournie
5. L'ajouter dans les variables d'environnement de Vercel

#### Option B : PostgreSQL sur Railway

1. Aller sur [railway.app](https://railway.app)
2. Créer un nouveau projet
3. Ajouter une base de données PostgreSQL
4. Copier la `DATABASE_URL`
5. L'ajouter dans Vercel

#### Option C : PostgreSQL sur Supabase (Gratuit)

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Dans Settings → Database, copier la connection string
4. L'ajouter dans Vercel

### Étape 4 : Migrer la base de données

Une fois la base de données configurée, vous devez exécuter les migrations :

1. **Option 1 : Via Vercel CLI** (recommandé)
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **Option 2 : Via le terminal de Vercel**
   - Aller dans votre projet Vercel
   - Settings → Functions → Environment Variables
   - Ajouter `DATABASE_URL`
   - Dans Deployments, utiliser "Redeploy" avec les nouvelles variables

3. **Option 3 : Via un script de build**
   Créer un fichier `vercel.json` :
   ```json
   {
     "buildCommand": "prisma generate && prisma migrate deploy && next build"
   }
   ```

### Étape 5 : Configurer les variables d'environnement

Dans Vercel → Settings → Environment Variables, ajouter :

```
DATABASE_URL="postgresql://..."
JWT_SECRET="votre-secret-jwt-tres-long-et-securise-minimum-32-caracteres"
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="onboarding@resend.dev"
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="votre-email@exemple.com"
NEXT_PUBLIC_APP_URL="https://votre-app.vercel.app"
```

### Étape 6 : Redéployer

Après avoir configuré toutes les variables, redéployer :
- Vercel → Deployments → Cliquer sur les 3 points → "Redeploy"

---

## 🎯 Option 2 : Déploiement sur Railway

Railway est une alternative simple qui gère aussi la base de données.

### Étape 1 : Préparer le code

Même chose que pour Vercel (créer un dépôt GitHub)

### Étape 2 : Configurer Railway

1. Aller sur [railway.app](https://railway.app)
2. Se connecter avec GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Sélectionner votre dépôt

### Étape 3 : Ajouter PostgreSQL

1. Dans votre projet Railway, cliquer sur "+ New"
2. Sélectionner "Database" → "PostgreSQL"
3. Railway créera automatiquement la base de données

### Étape 4 : Configurer les variables

Dans Railway → Variables, ajouter toutes les variables d'environnement.

### Étape 5 : Configurer le build

Railway détectera automatiquement Next.js, mais vous pouvez ajouter un `railway.json` :

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "prisma generate && prisma migrate deploy && npm run build"
  }
}
```

---

## 🎯 Option 3 : Déploiement sur Netlify

### Étape 1 : Préparer le code

Même chose que pour Vercel

### Étape 2 : Configurer Netlify

1. Aller sur [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Connecter GitHub et sélectionner le dépôt

### Étape 3 : Configurer le build

- Build command: `npm run build`
- Publish directory: `.next`

**Note** : Netlify nécessite une configuration spéciale pour Next.js. Créer un fichier `netlify.toml` :

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Étape 4 : Base de données

Netlify ne fournit pas de base de données. Utiliser Supabase ou Railway pour PostgreSQL.

---

## 📝 Fichiers de configuration nécessaires

### 1. Créer `.env.example`

```bash
# Base de données
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="votre-secret-jwt-tres-long-et-securise"

# Email - Resend
RESEND_API_KEY=""
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Email - SendGrid
SENDGRID_API_KEY=""
SENDGRID_FROM_EMAIL=""

# URL de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Créer `vercel.json` (pour Vercel)

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### 3. Mettre à jour `prisma/schema.prisma`

S'assurer que le `datasource` est configuré pour PostgreSQL en production :

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Note** : Pour PostgreSQL, changer `provider = "postgresql"` et mettre à jour `DATABASE_URL`.

---

## 🔧 Modifications nécessaires pour la production

### 1. Mettre à jour Prisma pour PostgreSQL

Si vous utilisez PostgreSQL, modifier `prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Puis créer une nouvelle migration :
```bash
npx prisma migrate dev --name init_postgres
```

### 2. Mettre à jour `next.config.js`

Vérifier que la configuration est correcte :

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
```

### 3. Gérer les uploads de fichiers

En production, les fichiers uploadés ne peuvent pas être stockés localement. Options :

- **Option A : Utiliser Vercel Blob** (si sur Vercel)
- **Option B : Utiliser AWS S3**
- **Option C : Utiliser Cloudinary**

---

## ✅ Checklist de déploiement

- [ ] Code poussé sur GitHub
- [ ] Base de données PostgreSQL créée
- [ ] Variables d'environnement configurées
- [ ] Migrations de base de données exécutées
- [ ] Build testé localement (`npm run build`)
- [ ] Application déployée
- [ ] URL de production testée
- [ ] Emails de test envoyés
- [ ] Upload de fichiers configuré (si nécessaire)

---

## 🐛 Résolution de problèmes

### Erreur : "Prisma Client not generated"
```bash
# Ajouter dans le build command
prisma generate && npm run build
```

### Erreur : "Database connection failed"
- Vérifier que `DATABASE_URL` est correcte
- Vérifier que la base de données est accessible depuis Internet
- Vérifier les credentials

### Erreur : "JWT_SECRET is missing"
- S'assurer que `JWT_SECRET` est défini dans les variables d'environnement
- Utiliser un secret long et sécurisé (minimum 32 caractères)

### Les images ne s'affichent pas
- Vérifier la configuration de `next.config.js`
- Vérifier que les domaines sont autorisés

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js Deployment](https://nextjs.org/docs/deployment)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Railway](https://docs.railway.app)

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifier les logs de déploiement
2. Vérifier les variables d'environnement
3. Tester le build localement : `npm run build`

