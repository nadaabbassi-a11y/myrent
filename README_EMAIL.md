# Configuration de l'envoi d'emails

## Pour recevoir des emails de bienvenue

Pour activer l'envoi d'emails, vous devez configurer Resend :

### 1. Créer un compte Resend

1. Allez sur https://resend.com
2. Créez un compte gratuit (100 emails/jour)
3. Vérifiez votre email

### 2. Obtenir votre clé API

1. Dans le dashboard Resend, allez dans "API Keys"
2. Cliquez sur "Create API Key"
3. Donnez un nom (ex: "MyRent Development")
4. Copiez la clé API (commence par `re_`)

### 3. Configurer les variables d'environnement

Créez ou modifiez votre fichier `.env` à la racine du projet :

```env
# Clé API Resend
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Email de l'expéditeur (doit être vérifié dans Resend)
RESEND_FROM_EMAIL="MyRent <noreply@votredomaine.com>"

# URL de l'application (pour les liens dans les emails)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Vérifier votre domaine (optionnel)

Pour utiliser votre propre domaine :
1. Allez dans "Domains" dans Resend
2. Ajoutez votre domaine
3. Suivez les instructions DNS
4. Utilisez votre domaine dans `RESEND_FROM_EMAIL`

### Mode développement

Si vous n'avez pas de clé API, le système fonctionne en mode développement :
- Les emails sont loggés dans la console du serveur
- L'inscription fonctionne normalement
- Aucune erreur n'est générée

Pour voir les logs d'email, regardez la console du serveur (terminal où vous avez lancé `npm run dev`).

