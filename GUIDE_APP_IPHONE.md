# Guide : Créer l'application iPhone (PWA)

Votre application Next.js a été configurée comme Progressive Web App (PWA), ce qui permet de l'installer sur iPhone comme une application native.

## ✅ Ce qui a été configuré

1. **Manifest.json** : Fichier de configuration PWA
2. **Service Worker** : Gestion du cache et fonctionnement hors ligne
3. **Métadonnées iOS** : Configuration pour l'installation sur iPhone
4. **Icônes** : Configuration des icônes d'application

## 📱 Installation sur iPhone

### Méthode 1 : Via Safari (Recommandé)

1. **Ouvrez Safari** sur votre iPhone (pas Chrome ou autre navigateur)
2. **Allez sur votre site Vercel** :
   - Allez sur https://vercel.com et connectez-vous
   - Ouvrez votre projet "myrent"
   - L'URL sera affichée (ex: `https://myrent.vercel.app` ou `https://myrent-*.vercel.app`)
   - Ou utilisez directement : `https://myrent.vercel.app` (si c'est votre nom de projet)
3. **Appuyez sur le bouton de partage** (carré avec flèche vers le haut)
4. **Faites défiler** et sélectionnez **"Sur l'écran d'accueil"**
5. **Personnalisez le nom** si nécessaire
6. **Appuyez sur "Ajouter"**

L'application apparaîtra maintenant sur votre écran d'accueil comme une app native !

### Méthode 2 : Via le menu Safari

1. Ouvrez Safari
2. Allez sur votre site
3. Appuyez sur le bouton **"Aa"** en haut à gauche
4. Sélectionnez **"Sur l'écran d'accueil"**

## 🎨 Générer les icônes

Les icônes doivent être générées. Voici les options :

### Option 1 : RealFaviconGenerator (Recommandé)
1. Allez sur https://realfavicongenerator.net/
2. Uploadez votre logo (format carré, minimum 512x512px)
3. Configurez les options iOS
4. Téléchargez et placez les fichiers dans `/public/` :
   - `icon-192x192.png`
   - `icon-512x512.png`
   - `apple-touch-icon.png` (180x180px)

### Option 2 : Créer manuellement
Utilisez un outil de design (Figma, Photoshop, etc.) pour créer :
- **192x192px** : `icon-192x192.png`
- **512x512px** : `icon-512x512.png`
- **180x180px** : `apple-touch-icon.png` (pour iPhone)

Placez-les dans le dossier `/public/`

## 🔧 Configuration avancée

### Personnaliser le nom de l'app
Modifiez `public/manifest.json` :
```json
{
  "name": "Votre nom d'app",
  "short_name": "Nom court"
}
```

### Changer la couleur du thème
Modifiez `app/layout.tsx` :
```typescript
themeColor: "#334155", // Votre couleur
```

### Ajouter des raccourcis
Les raccourcis sont déjà configurés dans `manifest.json`. Vous pouvez en ajouter d'autres.

## 🚀 Déploiement

1. **Générez les icônes** (voir ci-dessus)
2. **Testez en local** : `npm run build && npm start`
3. **Déployez sur Vercel** :
   ```bash
   git add .
   git commit -m "Ajout PWA pour iPhone"
   git push origin main
   ```
   Vercel déploiera automatiquement. Le service worker sera généré lors du build.
4. **Trouvez votre URL Vercel** :
   - Allez sur https://vercel.com
   - Connectez-vous et ouvrez votre projet
   - L'URL sera affichée (ex: `https://myrent.vercel.app`)
5. **Testez sur iPhone** : Ouvrez Safari, allez sur votre URL Vercel et installez l'app

## 📝 Notes importantes

- **HTTPS requis** : Les PWA nécessitent HTTPS (Vercel le fournit automatiquement)
- **Safari uniquement** : Sur iPhone, seul Safari permet l'installation
- **Service Worker** : Désactivé en développement, activé en production
- **Cache** : Les images et ressources sont mises en cache automatiquement

## 🐛 Dépannage

### L'app ne s'installe pas
- Vérifiez que vous utilisez Safari (pas Chrome)
- Vérifiez que le site est en HTTPS
- Vérifiez que les icônes existent dans `/public/`

### Les icônes ne s'affichent pas
- Vérifiez que les fichiers sont dans `/public/`
- Vérifiez les noms de fichiers (doivent correspondre exactement)
- Redémarrez le serveur après avoir ajouté les icônes

### Le service worker ne fonctionne pas
- Vérifiez la console du navigateur pour les erreurs
- Le service worker est désactivé en développement
- Testez en production (`npm run build && npm start`)

## 📱 Fonctionnalités PWA

Une fois installée, votre app aura :
- ✅ Icône sur l'écran d'accueil
- ✅ Lancement en plein écran (sans barre d'adresse)
- ✅ Cache des ressources pour fonctionnement hors ligne
- ✅ Expérience native
- ✅ Notifications push (à configurer séparément)

## 🔔 Prochaines étapes

1. **Générez les icônes** avec RealFavicongenerator
2. **Testez l'installation** sur un iPhone
3. **Personnalisez** les couleurs et le nom
4. **Configurez les notifications push** (optionnel)

