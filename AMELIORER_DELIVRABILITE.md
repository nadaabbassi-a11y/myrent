# 📬 Améliorer la délivrabilité des emails (Éviter les spams)

Si vos emails vont dans les spams, voici comment améliorer la délivrabilité.

## 🎯 Solutions rapides

### 1. Vérifier un domaine dans SendGrid (Recommandé)

Au lieu d'utiliser une adresse email simple (`@gmail.com`), vérifiez votre propre domaine :

1. Allez dans **SendGrid** → **Settings** → **Sender Authentication**
2. Cliquez sur **"Authenticate Your Domain"**
3. Suivez les instructions pour ajouter les enregistrements DNS :
   - **SPF** (Sender Policy Framework)
   - **DKIM** (DomainKeys Identified Mail)
   - **DMARC** (Domain-based Message Authentication)

4. Une fois vérifié, utilisez une adresse de votre domaine :
   ```env
   SENDGRID_FROM_EMAIL="noreply@votredomaine.com"
   ```

### 2. Améliorer le contenu de l'email

Les emails que nous envoyons sont déjà optimisés, mais vous pouvez :
- Éviter les mots déclencheurs de spam (gratuit, gagner, etc.)
- Utiliser un texte équilibré (pas seulement des images)
- Inclure un lien de désinscription (si nécessaire)

### 3. Configurer SPF/DKIM manuellement

Si vous avez un domaine, ajoutez ces enregistrements DNS :

**SPF :**
```
Type: TXT
Name: @
Value: v=spf1 include:sendgrid.net ~all
```

**DKIM :**
SendGrid vous donnera les enregistrements DKIM spécifiques à votre domaine.

**DMARC :**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:votre-email@votredomaine.com
```

### 4. Demander à vos utilisateurs de marquer comme "Non spam"

Quand un utilisateur reçoit l'email dans les spams :
1. Ouvrez l'email
2. Marquez-le comme "Non spam" / "Not spam"
3. Ajoutez l'expéditeur aux contacts

Cela aide les filtres à apprendre que vos emails sont légitimes.

### 5. Utiliser un service de réchauffage d'IP (Production)

Pour la production, utilisez un service de réchauffage d'IP comme :
- **Warmbox** : https://warmbox.io
- **Mailwarm** : https://mailwarm.com

## 🔍 Vérifier la délivrabilité

### Outils de test :

1. **Mail Tester** : https://www.mail-tester.com
   - Envoyez un email à l'adresse fournie
   - Obtenez un score de délivrabilité

2. **MXToolbox** : https://mxtoolbox.com
   - Vérifiez vos enregistrements SPF/DKIM

3. **Google Postmaster Tools** : https://postmaster.google.com
   - Surveillez la délivrabilité pour Gmail

## ⚠️ Causes communes des spams

1. **Pas de domaine vérifié** : Utiliser `@gmail.com` ou `@resend.dev` peut être filtré
2. **Pas de SPF/DKIM** : Les filtres ne peuvent pas vérifier l'authenticité
3. **Contenu suspect** : Trop d'images, liens suspects, etc.
4. **Réputation IP** : L'IP de SendGrid peut être sur liste noire (rare)

## 💡 Solution immédiate

Pour améliorer rapidement la délivrabilité :

1. **Vérifiez votre domaine dans SendGrid** (si vous en avez un)
2. **Utilisez une adresse de votre domaine** comme expéditeur
3. **Demandez aux premiers utilisateurs** de marquer comme "Non spam"

## 📊 Statistiques SendGrid

Dans votre dashboard SendGrid, vous pouvez voir :
- Taux de délivrabilité
- Taux d'ouverture
- Taux de clics
- Emails marqués comme spam

Utilisez ces données pour identifier les problèmes.

## 🚀 Pour la production

Pour une meilleure délivrabilité en production :
1. Vérifiez votre propre domaine
2. Configurez SPF, DKIM, DMARC
3. Utilisez un service de réchauffage d'IP
4. Surveillez votre réputation avec Google Postmaster Tools

