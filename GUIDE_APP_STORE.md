# Guide : Publier MyRent dans l'App Store

Pour publier votre application dans l'App Store, vous devez créer une application native iOS. La PWA actuelle ne peut pas être soumise directement à l'App Store.

## 🎯 Solution recommandée : Capacitor

**Capacitor** permet de transformer votre application Next.js en application native iOS/Android sans réécrire le code.

## 📋 Prérequis

1. **Mac avec macOS** (requis pour développer iOS)
2. **Xcode** (téléchargez depuis l'App Store Mac)
3. **Compte développeur Apple** (99$/an) - https://developer.apple.com
4. **Node.js** (déjà installé)

## 🚀 Étapes d'installation

### Étape 1 : Installer Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init
```

Lors de l'initialisation, vous devrez fournir :
- **App name** : MyRent
- **App ID** : com.myrent.app (ou votre propre ID)
- **Web dir** : out (pour Next.js export statique)

### Étape 2 : Configurer Next.js pour l'export statique

Modifiez `next.config.js` pour permettre l'export statique :

```javascript
const nextConfig = {
  output: 'export', // Export statique
  images: {
    unoptimized: true, // Nécessaire pour l'export statique
  },
  // ... reste de la config
}
```

### Étape 3 : Build et export

```bash
npm run build
npx cap add ios
npx cap sync
```

### Étape 4 : Ouvrir dans Xcode

```bash
npx cap open ios
```

## 🎨 Configuration iOS

### Icônes et Splash Screens

1. Dans Xcode, allez dans `App/App/Assets.xcassets`
2. Remplacez les icônes par vos propres icônes (1024x1024px minimum)
3. Configurez les splash screens

### Configuration de l'app

1. Sélectionnez le projet dans Xcode
2. Allez dans "Signing & Capabilities"
3. Sélectionnez votre équipe de développement
4. Configurez le Bundle Identifier (ex: `com.myrent.app`)

## 📱 Test sur simulateur/device

1. Dans Xcode, sélectionnez un simulateur ou votre iPhone
2. Cliquez sur "Run" (▶️)
3. L'app s'ouvrira dans le simulateur ou sur votre iPhone

## 🏪 Préparation pour l'App Store

### 1. Créer un compte développeur Apple

- Allez sur https://developer.apple.com
- Inscrivez-vous (99$/an)
- Acceptez les accords

### 2. Créer un App ID

1. Allez sur https://developer.apple.com/account
2. Identifiers → App IDs
3. Créez un nouvel App ID avec votre Bundle Identifier

### 3. Créer un certificat de distribution

1. Certificates → Production
2. Créez un certificat "App Store and Ad Hoc"

### 4. Créer un profil de provisioning

1. Profiles → Distribution
2. Créez un profil "App Store"
3. Sélectionnez votre App ID et certificat

### 5. Archiver l'application

Dans Xcode :
1. Product → Archive
2. Attendez que l'archive soit créée
3. Organizer s'ouvrira automatiquement

### 6. Soumettre à l'App Store

1. Dans Organizer, sélectionnez votre archive
2. Cliquez sur "Distribute App"
3. Sélectionnez "App Store Connect"
4. Suivez les instructions

### 7. App Store Connect

1. Allez sur https://appstoreconnect.apple.com
2. Créez une nouvelle app
3. Remplissez les informations :
   - Nom : MyRent
   - Langue principale : Français
   - Bundle ID : celui que vous avez créé
   - SKU : identifiant unique

4. Configurez les métadonnées :
   - Description
   - Captures d'écran (obligatoires)
   - Icône (1024x1024px)
   - Catégorie
   - Mots-clés
   - URL de support
   - Politique de confidentialité

5. Soumettez pour révision

## ⚠️ Points importants

### Limitations de l'export statique Next.js

- Pas de Server-Side Rendering (SSR)
- Pas d'API Routes (toutes les routes API doivent être externes)
- Pas de fonctions serveur

### Solutions pour les API Routes

Vous avez deux options :

1. **Garder les API sur Vercel** : Votre app native appellera les APIs hébergées sur Vercel
2. **Créer un backend séparé** : Déployez vos APIs sur un serveur séparé

### Configuration pour API externes

Modifiez votre code pour utiliser l'URL de production :

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://myrent-ca.vercel.app';
```

## 🔄 Workflow de développement

1. **Développement** : `npm run dev` (comme d'habitude)
2. **Build** : `npm run build` (crée le dossier `out/`)
3. **Sync Capacitor** : `npx cap sync` (copie les fichiers dans iOS)
4. **Test** : `npx cap open ios` (ouvre dans Xcode)

## 📝 Checklist avant soumission

- [ ] Compte développeur Apple actif
- [ ] App ID créé
- [ ] Certificat de distribution créé
- [ ] Profil de provisioning créé
- [ ] Icônes configurées (toutes les tailles)
- [ ] Splash screens configurés
- [ ] Bundle Identifier unique
- [ ] Version et build number configurés
- [ ] Description de l'app rédigée
- [ ] Captures d'écran préparées (toutes les tailles)
- [ ] Politique de confidentialité (obligatoire)
- [ ] URL de support
- [ ] Catégorie sélectionnée
- [ ] Mots-clés définis
- [ ] Testé sur device réel
- [ ] Pas d'erreurs dans Xcode

## 💰 Coûts

- **Compte développeur Apple** : 99$/an
- **Soumission App Store** : Gratuite
- **Commission App Store** : 30% (15% après 1M$ de revenus)

## 🆚 Alternatives

### Option 1 : Capacitor (Recommandé)
✅ Garde votre code existant
✅ Support iOS et Android
✅ Accès aux fonctionnalités natives
❌ Nécessite un Mac pour iOS

### Option 2 : React Native
✅ Performance native
✅ Accès complet aux APIs iOS/Android
❌ Nécessite de réécrire l'application

### Option 3 : Expo
✅ Plus simple que React Native
✅ Pas besoin de Mac pour développer
❌ Nécessite de réécrire l'application
❌ Limitations pour certaines fonctionnalités natives

## 📚 Ressources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Apple Developer Documentation](https://developer.apple.com/documentation)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

## 🎯 Prochaines étapes

1. Installer Capacitor
2. Configurer Next.js pour l'export statique
3. Tester sur simulateur iOS
4. Créer un compte développeur Apple
5. Préparer les assets (icônes, screenshots)
6. Soumettre à l'App Store

