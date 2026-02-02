# ✅ Vérifier votre adresse email dans SendGrid

SendGrid nécessite de vérifier votre adresse email avant de pouvoir envoyer des emails.

## 📋 Étapes pour vérifier votre email

### Étape 1 : Accéder à la vérification

1. Connectez-vous à votre dashboard SendGrid
2. Allez dans **Settings** → **Sender Authentication** (menu de gauche)
3. Cliquez sur **"Verify a Single Sender"**

### Étape 2 : Ajouter votre adresse email

1. Cliquez sur **"Create New Sender"**
2. Remplissez le formulaire :
   - **From Email Address** : Votre adresse email (ex: `nadaabbassitechno@gmail.com`)
   - **From Name** : Votre nom ou "MyRent"
   - **Reply To** : La même adresse ou une autre
   - **Address** : Votre adresse
   - **City** : Votre ville
   - **State** : Votre état/province
   - **Country** : Votre pays
   - **Zip Code** : Votre code postal

3. Cochez la case pour accepter les conditions
4. Cliquez sur **"Create"**

### Étape 3 : Vérifier votre email

1. SendGrid va envoyer un email de vérification à votre adresse
2. Ouvrez votre boîte email
3. Cliquez sur le lien de vérification dans l'email de SendGrid
4. Votre adresse sera maintenant vérifiée ✅

### Étape 4 : Mettre à jour votre configuration

Une fois vérifiée, mettez à jour votre fichier `.env` :

```env
SENDGRID_FROM_EMAIL="votre-email-verifie@gmail.com"
```

Ou utilisez la variable `SENDGRID_VERIFIED_EMAIL` :

```env
SENDGRID_VERIFIED_EMAIL="votre-email-verifie@gmail.com"
```

## 🚨 Erreur "The from address does not match a verified Sender Identity"

Cette erreur signifie que l'adresse email utilisée comme expéditeur n'est pas vérifiée dans SendGrid.

**Solution :**
1. Vérifiez votre adresse email dans SendGrid (voir étapes ci-dessus)
2. Utilisez exactement la même adresse dans `SENDGRID_FROM_EMAIL`
3. Redémarrez votre serveur

## 💡 Astuce

Vous pouvez vérifier plusieurs adresses email dans SendGrid. Utilisez celle que vous préférez comme expéditeur.

## 📖 Documentation SendGrid

Pour plus d'informations : https://sendgrid.com/docs/for-developers/sending-email/sender-identity/


