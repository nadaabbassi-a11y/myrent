# 📧 Configuration de l'envoi d'emails

## Pourquoi je ne reçois pas les emails ?

**Raison principale :** La clé API Resend n'est pas configurée dans votre fichier `.env`.

En mode développement (sans clé API), les emails sont **loggés dans la console du serveur** au lieu d'être envoyés.

## ✅ Solution : Configurer Resend

### Étape 1 : Créer un compte Resend

1. Allez sur **https://resend.com**
2. Cliquez sur **"Sign Up"** (gratuit)
3. Créez un compte (100 emails/jour gratuits)
4. Vérifiez votre email

### Étape 2 : Obtenir votre clé API

1. Connectez-vous à votre dashboard Resend
2. Allez dans **"API Keys"** (menu de gauche)
3. Cliquez sur **"Create API Key"**
4. Donnez un nom (ex: "MyRent Development")
5. **Copiez la clé API** (elle commence par `re_` et ne sera affichée qu'une seule fois !)

### Étape 3 : Configurer votre projet

1. Créez un fichier `.env.local` à la racine du projet (ou modifiez `.env` s'il existe)
2. Ajoutez ces lignes :

```env
# Clé API Resend (obligatoire pour envoyer des emails)
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Email de l'expéditeur (utilisez onboarding@resend.dev pour les tests)
RESEND_FROM_EMAIL="MyRent <onboarding@resend.dev>"

# URL de votre application (pour les liens dans les emails)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. **Redémarrez votre serveur** (`npm run dev`)

### Étape 4 : Tester

1. Créez un nouveau compte
2. Vérifiez votre boîte email (et le dossier spam)
3. Vous devriez recevoir l'email de bienvenue !

## 🔍 Vérifier si ça fonctionne

### Dans la console du serveur, vous devriez voir :

**Sans clé API (mode développement) :**
```
⚠️ Mode développement: Email non envoyé (pas de clé API Resend)
📧 Email de bienvenue qui aurait été envoyé: { to: '...', ... }
```

**Avec clé API :**
```
✅ Email de bienvenue envoyé avec succès: re_xxxxx
```

## 🚨 Problèmes courants

### 1. "Invalid API key"
- Vérifiez que votre clé API est correcte
- Assurez-vous qu'il n'y a pas d'espaces avant/après la clé
- Vérifiez que vous avez bien redémarré le serveur après avoir ajouté la clé

### 2. "Domain not verified"
- En développement, utilisez `onboarding@resend.dev` comme expéditeur
- Pour la production, vous devrez vérifier votre domaine dans Resend

### 3. Emails dans les spams
- Vérifiez votre dossier spam/courrier indésirable
- En production, configurez SPF/DKIM pour votre domaine

## 📝 Alternative : Utiliser un autre service

Si vous préférez utiliser un autre service d'envoi d'emails :
- **SendGrid** : https://sendgrid.com
- **Mailgun** : https://mailgun.com
- **Amazon SES** : https://aws.amazon.com/ses

Vous devrez modifier le fichier `lib/email.ts` pour utiliser leur SDK.

## 💡 Mode développement

Si vous ne voulez pas configurer Resend tout de suite, le système fonctionne quand même :
- Les emails sont loggés dans la console
- L'inscription fonctionne normalement
- Aucune erreur n'est générée

Pour voir les emails "virtuels", regardez la console du serveur (terminal où vous avez lancé `npm run dev`).


