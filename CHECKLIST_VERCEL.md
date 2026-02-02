# ✅ Checklist Déploiement Vercel

## 🔑 Variables d'environnement à configurer dans Vercel

Dans Vercel → Settings → Environment Variables, ajouter :

### Obligatoires :
- ✅ `DATABASE_URL` = `postgresql://neondb_owner:npg_ipGSDLjRlE20@ep-wild-silence-ahclo513-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
- ✅ `JWT_SECRET` = `0xPiebkoA9hhN0qeuOA0fLs7aC7hTCGzynnR2MejoHM=`
- ✅ `NEXT_PUBLIC_APP_URL` = `https://votre-app.vercel.app` (remplacer par votre URL Vercel)

### Optionnelles (selon votre configuration email) :
- `RESEND_API_KEY` = votre clé Resend
- `RESEND_FROM_EMAIL` = `onboarding@resend.dev`
- `SENDGRID_API_KEY` = votre clé SendGrid
- `SENDGRID_FROM_EMAIL` = votre email vérifié

## 📝 Étapes de déploiement

1. ✅ Code poussé sur GitHub
2. ✅ Projet importé dans Vercel
3. ✅ Variables d'environnement ajoutées
4. ⏳ Build en cours...
5. ⏳ Vérifier les logs de build
6. ⏳ Tester l'application en ligne

## 🔍 Vérifications après déploiement

- [ ] Le site charge correctement
- [ ] La connexion à la base de données fonctionne
- [ ] L'authentification fonctionne (créer un compte)
- [ ] Les emails sont envoyés (si configurés)
- [ ] Les listings s'affichent
- [ ] Les uploads de fichiers fonctionnent (si configurés)

## 🐛 Problèmes courants

### Erreur : "Prisma Client not generated"
✅ Déjà géré dans `vercel.json` avec `prisma generate`

### Erreur : "DATABASE_URL is missing"
→ Vérifier que la variable est bien ajoutée dans Vercel

### Erreur : "JWT_SECRET is missing"
→ Vérifier que la variable est bien ajoutée dans Vercel

### Erreur : "Migration failed"
→ Vérifier que `DATABASE_URL` pointe vers PostgreSQL (pas SQLite)
→ Vérifier que la base de données Neon est accessible

### Build échoue sur "prisma migrate deploy"
→ S'assurer que toutes les migrations sont dans `/prisma/migrations`
→ Vérifier que la base de données est vide ou que les migrations peuvent s'appliquer


