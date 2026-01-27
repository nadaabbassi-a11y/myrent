# ⚡ Déploiement Rapide - MyRent

## 🚀 Méthode la plus simple : Vercel (5 minutes)

### Étape 1 : Préparer GitHub

```bash
# Si vous n'avez pas encore de dépôt Git
git init
git add .
git commit -m "Initial commit - Ready for deployment"

# Créer un dépôt sur GitHub.com, puis :
git remote add origin https://github.com/VOTRE_USERNAME/myrent.git
git branch -M main
git push -u origin main
```

### Étape 2 : Déployer sur Vercel

1. **Aller sur [vercel.com](https://vercel.com)**
   - Se connecter avec GitHub
   - Cliquer sur "Add New Project"

2. **Importer le projet**
   - Sélectionner votre dépôt `myrent`
   - Vercel détectera automatiquement Next.js

3. **Configurer la base de données PostgreSQL**
   - Dans Vercel, aller dans "Storage"
   - "Create Database" → "Postgres"
   - Noter la `DATABASE_URL` générée

4. **Ajouter les variables d'environnement**
   - Dans "Environment Variables", ajouter :
     ```
     DATABASE_URL="postgresql://..." (celle de l'étape 3)
     JWT_SECRET="générez-un-secret-long-et-aléatoire-minimum-32-caracteres"
     RESEND_API_KEY="votre-clé-resend"
     RESEND_FROM_EMAIL="onboarding@resend.dev"
     SENDGRID_API_KEY="votre-clé-sendgrid"
     SENDGRID_FROM_EMAIL="votre-email-verifie"
     NEXT_PUBLIC_APP_URL="https://votre-app.vercel.app"
     ```

5. **Déployer**
   - Cliquer sur "Deploy"
   - Attendre 2-3 minutes

### Étape 3 : Migrer la base de données

Une fois déployé, exécuter les migrations :

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

**OU** via l'interface Vercel :
- Aller dans votre projet → Settings → Functions
- Ajouter une variable d'environnement `DATABASE_URL`
- Redéployer (les migrations s'exécuteront automatiquement grâce à `vercel.json`)

### ✅ C'est fait !

Votre site est maintenant en ligne à : `https://votre-app.vercel.app`

---

## 🔑 Générer un JWT_SECRET sécurisé

```bash
# Sur Mac/Linux
openssl rand -base64 32

# Ou utiliser Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📝 Checklist rapide

- [ ] Code sur GitHub
- [ ] Compte Vercel créé
- [ ] Projet importé sur Vercel
- [ ] Base de données PostgreSQL créée
- [ ] Variables d'environnement configurées
- [ ] Migrations exécutées
- [ ] Site accessible en ligne

---

## 🆘 Problème ? 

Si le déploiement échoue :
1. Vérifier les logs dans Vercel → Deployments
2. Vérifier que toutes les variables d'environnement sont définies
3. Tester le build localement : `npm run build`

