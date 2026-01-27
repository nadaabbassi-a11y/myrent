# 📧 Configuration SendGrid (Alternative à Resend)

SendGrid permet d'envoyer des emails à **n'importe quelle adresse** sans vérifier de domaine, ce qui est parfait pour le développement !

## ✅ Avantages de SendGrid

- ✅ Envoyer à n'importe quelle adresse (pas de limitation comme Resend)
- ✅ 100 emails/jour gratuits
- ✅ Pas besoin de vérifier un domaine pour les tests
- ✅ Simple à configurer

## 📋 Étapes de configuration

### Étape 1 : Créer un compte SendGrid

1. Allez sur **https://sendgrid.com**
2. Cliquez sur **"Start for free"**
3. Créez un compte (gratuit, 100 emails/jour)
4. Vérifiez votre email

### Étape 2 : Obtenir votre clé API

1. Connectez-vous à votre dashboard SendGrid
2. Allez dans **Settings** → **API Keys** (menu de gauche)
3. Cliquez sur **"Create API Key"**
4. Donnez un nom (ex: "MyRent Development")
5. Choisissez **"Full Access"** ou **"Restricted Access"** (avec permissions Mail Send)
6. **Copiez la clé API** (elle commence par `SG.` et ne sera affichée qu'une seule fois !)

### Étape 3 : Configurer votre projet

Ajoutez dans votre fichier `.env` :

```env
# Clé API SendGrid (remplace Resend si configurée)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"

# Email de l'expéditeur (peut être n'importe quoi pour les tests)
SENDGRID_FROM_EMAIL="noreply@myrent.app"

# URL de votre application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Étape 4 : Redémarrer le serveur

```bash
npm run dev
```

### Étape 5 : Tester

1. Créez un compte avec **n'importe quelle adresse email**
2. Vous devriez recevoir l'email de bienvenue ! 🎉

## 🔄 Priorité des services

Le système utilise automatiquement :
1. **SendGrid** si `SENDGRID_API_KEY` est configurée
2. **Resend** si seulement `RESEND_API_KEY` est configurée
3. **Mode développement** (logs dans la console) si aucun n'est configuré

## 🚨 Problèmes courants

### 1. "Invalid API key"
- Vérifiez que votre clé API est correcte
- Assurez-vous qu'il n'y a pas d'espaces avant/après la clé
- Vérifiez que vous avez bien redémarré le serveur

### 2. "Forbidden" ou erreur 403
- Vérifiez que votre clé API a les permissions "Mail Send"
- Créez une nouvelle clé API avec les bonnes permissions

### 3. Emails dans les spams
- Vérifiez votre dossier spam/courrier indésirable
- En production, vérifiez votre domaine dans SendGrid pour améliorer la délivrabilité

## 📊 Comparaison SendGrid vs Resend

| Fonctionnalité | SendGrid | Resend |
|----------------|----------|--------|
| Emails gratuits/jour | 100 | 100 |
| Envoyer à n'importe quelle adresse (sans domaine) | ✅ Oui | ❌ Non (limité à l'adresse vérifiée) |
| Vérification de domaine requise | ❌ Non (pour les tests) | ✅ Oui (pour envoyer à d'autres) |
| Facilité de configuration | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 💡 Recommandation

Pour le **développement** : Utilisez **SendGrid** (plus simple, pas de limitation)
Pour la **production** : Utilisez **Resend** ou **SendGrid** avec un domaine vérifié (meilleure délivrabilité)

