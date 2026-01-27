# 🔐 Comment vérifier un domaine dans Resend

Pour envoyer des emails à **n'importe quelle adresse**, vous devez vérifier votre propre domaine dans Resend.

## 📋 Étapes pour vérifier un domaine

### Étape 1 : Avoir un domaine

Vous devez avoir un domaine (ex: `votredomaine.com`, `monsite.fr`, etc.). Si vous n'en avez pas, vous pouvez :
- Acheter un domaine sur [Namecheap](https://www.namecheap.com/), [GoDaddy](https://www.godaddy.com/), ou [Google Domains](https://domains.google/)
- Utiliser un sous-domaine gratuit (voir alternatives ci-dessous)

### Étape 2 : Ajouter le domaine dans Resend

1. Allez sur **https://resend.com/domains**
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine (ex: `votredomaine.com`)
4. Cliquez sur **"Add"**

### Étape 3 : Configurer les enregistrements DNS

Resend vous donnera des enregistrements DNS à ajouter. Exemple :

```
Type: TXT
Name: @
Value: resend-verification=xxxxxxxxxxxxx

Type: MX
Name: @
Value: feedback-smtp.resend.com
Priority: 10

Type: TXT
Name: resend._domainkey
Value: (une longue chaîne de caractères)
```

### Étape 4 : Ajouter les enregistrements dans votre registrar

1. Connectez-vous à votre registrar (Namecheap, GoDaddy, etc.)
2. Allez dans la gestion DNS de votre domaine
3. Ajoutez les enregistrements fournis par Resend
4. Attendez la propagation DNS (peut prendre quelques minutes à 48h)

### Étape 5 : Vérifier dans Resend

1. Retournez sur **https://resend.com/domains**
2. Cliquez sur **"Verify"** ou attendez la vérification automatique
3. Une fois vérifié (✅), vous pouvez utiliser ce domaine

### Étape 6 : Mettre à jour votre configuration

Dans votre fichier `.env` :

```env
RESEND_FROM_EMAIL="MyRent <noreply@votredomaine.com>"
```

Remplacez `votredomaine.com` par votre domaine vérifié.

## 🚀 Alternatives si vous n'avez pas de domaine

### Option 1 : Utiliser Mailtrap (pour le développement)

Mailtrap est un service qui capture les emails en développement sans les envoyer réellement. C'est parfait pour tester.

1. Créez un compte sur **https://mailtrap.io** (gratuit)
2. Obtenez vos identifiants SMTP
3. Installez `nodemailer` : `npm install nodemailer`
4. Modifiez `lib/email.ts` pour utiliser Mailtrap

### Option 2 : Utiliser SendGrid (alternative à Resend)

SendGrid offre un plan gratuit (100 emails/jour) et permet d'envoyer sans vérification de domaine pour les tests.

1. Créez un compte sur **https://sendgrid.com**
2. Obtenez votre clé API
3. Installez `@sendgrid/mail` : `npm install @sendgrid/mail`
4. Modifiez `lib/email.ts` pour utiliser SendGrid

### Option 3 : Utiliser un sous-domaine gratuit

Certains services offrent des sous-domaines gratuits que vous pouvez utiliser :
- **Freenom** : https://www.freenom.com/ (domaines gratuits)
- **No-IP** : https://www.noip.com/ (sous-domaines gratuits)

## ⚡ Solution rapide : Mailtrap pour le développement

Si vous voulez tester rapidement sans configurer de domaine, je peux modifier le code pour utiliser Mailtrap. Dites-moi si vous voulez que je fasse cela !

