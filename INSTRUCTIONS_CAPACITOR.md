# Instructions : Configuration Capacitor pour App Store

## ✅ Capacitor installé

Capacitor a été installé et configuré. Voici les prochaines étapes.

## ⚠️ Important : Configuration des APIs

Votre application utilise des API Routes Next.js. Pour l'App Store, vous devez :

### Option 1 : Garder les APIs sur Vercel (Recommandé)

Modifiez votre code pour utiliser l'URL de production Vercel pour toutes les requêtes API :

```typescript
// Créez un fichier lib/api-config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://myrent-ca.vercel.app';

export const apiUrl = (path: string) => {
  return `${API_BASE_URL}${path}`;
};
```

Puis dans vos composants, utilisez :
```typescript
const response = await fetch(apiUrl('/api/your-endpoint'));
```

### Option 2 : Export statique (Limité)

Si vous voulez un export statique complet, vous devrez :
1. Déplacer toutes vos API Routes vers un backend séparé
2. Ou utiliser des fonctions serverless externes

## 🚀 Étapes suivantes

### 1. Configurer Next.js pour l'export statique (Optionnel)

Si vous voulez un export statique complet, modifiez `next.config.js` :

```javascript
const nextConfig = {
  output: 'export', // Export statique
  images: {
    unoptimized: true, // Nécessaire pour l'export statique
  },
  // ... reste de la config
}
```

**⚠️ Attention** : Cela désactivera toutes les API Routes. Vous devrez les héberger ailleurs.

### 2. Build et sync

```bash
# Build normal (recommandé - garde les APIs sur Vercel)
npm run build

# OU build statique (si vous avez déplacé les APIs)
npm run build:static

# Sync avec Capacitor
npm run cap:sync
```

### 3. Ouvrir dans Xcode

```bash
npm run cap:open:ios
```

**Prérequis** :
- Mac avec macOS
- Xcode installé (depuis l'App Store Mac)
- CocoaPods installé : `sudo gem install cocoapods`

### 4. Configuration dans Xcode

1. **Sélectionnez le projet** dans le navigateur de fichiers
2. **Allez dans "Signing & Capabilities"**
3. **Sélectionnez votre équipe** de développement
4. **Vérifiez le Bundle Identifier** : `com.myrent.app`

### 5. Test sur simulateur

1. Dans Xcode, sélectionnez un simulateur (ex: iPhone 15)
2. Cliquez sur **Run** (▶️)
3. L'app s'ouvrira dans le simulateur

## 📱 Préparation App Store

### Prérequis

1. **Compte développeur Apple** (99$/an)
   - Allez sur https://developer.apple.com
   - Inscrivez-vous

2. **Xcode** installé et à jour

3. **Certificats et profils** créés dans Apple Developer Portal

### Checklist

- [ ] Compte développeur Apple actif
- [ ] Xcode installé
- [ ] CocoaPods installé
- [ ] App testée sur simulateur
- [ ] App testée sur device réel
- [ ] Icônes configurées (1024x1024px minimum)
- [ ] Splash screens configurés
- [ ] Bundle ID unique configuré
- [ ] Certificat de distribution créé
- [ ] Profil de provisioning créé

## 🎨 Configuration des assets

### Icônes

1. Préparez une icône 1024x1024px
2. Dans Xcode : `App/App/Assets.xcassets/AppIcon.appiconset`
3. Ajoutez toutes les tailles requises

### Splash Screen

1. Dans Xcode : `App/App/Assets.xcassets`
2. Configurez les splash screens pour toutes les tailles d'écran

## 📦 Archiver et soumettre

1. Dans Xcode : **Product → Archive**
2. Attendez la fin de l'archivage
3. **Organizer** s'ouvrira automatiquement
4. Sélectionnez votre archive
5. Cliquez sur **"Distribute App"**
6. Sélectionnez **"App Store Connect"**
7. Suivez les instructions

## 🔗 App Store Connect

1. Allez sur https://appstoreconnect.apple.com
2. Créez une nouvelle app
3. Remplissez les métadonnées :
   - Nom, description, catégorie
   - Captures d'écran (obligatoires)
   - Icône 1024x1024px
   - Politique de confidentialité (obligatoire)
   - URL de support

4. Soumettez pour révision

## 💡 Recommandation

Pour votre cas, je recommande de **garder les APIs sur Vercel** et de faire pointer l'app native vers ces APIs. C'est plus simple et vous gardez toutes vos fonctionnalités.

Voulez-vous que je modifie votre code pour pointer vers les APIs Vercel ?

