# Instructions pour déployer la PWA sur Vercel

## ✅ Ce qui a été configuré

1. ✅ `next-pwa` installé et configuré
2. ✅ `manifest.json` créé dans `/public/`
3. ✅ Métadonnées PWA ajoutées dans `app/layout.tsx`
4. ✅ Icônes SVG générées
5. ✅ Service Worker configuré (généré automatiquement lors du build)

## 🚀 Déploiement

### Étape 1 : Commiter les changements

```bash
git add .
git commit -m "Ajout PWA pour installation iPhone"
git push origin main
```

### Étape 2 : Vérifier le déploiement Vercel

1. Allez sur https://vercel.com
2. Ouvrez votre projet "myrent"
3. Vérifiez que le déploiement est réussi
4. Attendez que le build soit terminé

### Étape 3 : Vérifier que tout fonctionne

Une fois déployé, vérifiez que ces URLs sont accessibles :

- ✅ `https://myrent-ca.vercel.app/manifest.json` (doit retourner le JSON)
- ✅ `https://myrent-ca.vercel.app/icon-192x192.svg` (doit afficher l'icône)
- ✅ `https://myrent-ca.vercel.app/icon-512x512.svg` (doit afficher l'icône)
- ✅ `https://myrent-ca.vercel.app/apple-touch-icon.svg` (doit afficher l'icône)

## 📱 Installation sur iPhone

### Sur iPhone (Safari uniquement)

1. **Ouvrez Safari** (pas Chrome ou autre)
2. **Allez sur** : `https://myrent-ca.vercel.app`
3. **Appuyez sur le bouton de partage** (carré avec flèche vers le haut)
4. **Faites défiler** et sélectionnez **"Sur l'écran d'accueil"**
5. **Personnalisez le nom** si nécessaire
6. **Appuyez sur "Ajouter"**

L'app apparaîtra sur votre écran d'accueil ! 🎉

## ⚠️ Notes importantes

### Sur macOS
- Le menu de partage Safari sur macOS ne montre **PAS** l'option "Sur l'écran d'accueil"
- Cette option n'apparaît **QUE sur iPhone/iPad**
- C'est normal ! Vous devez tester sur un iPhone réel

### Icônes SVG vs PNG
- Actuellement, les icônes sont en SVG (fonctionne mais pas optimal pour iOS)
- Pour une meilleure compatibilité iOS, convertissez-les en PNG :
  1. Allez sur https://realfavicongenerator.net/
  2. Uploadez votre logo
  3. Téléchargez les PNG
  4. Remplacez les fichiers SVG dans `/public/`
  5. Mettez à jour `manifest.json` pour pointer vers les PNG

### Service Worker
- Le service worker est **désactivé en développement**
- Il sera **automatiquement généré** lors du build Vercel
- Les fichiers seront dans `/public/sw.js` après le build

## 🔍 Dépannage

### L'option "Sur l'écran d'accueil" n'apparaît pas sur iPhone

Vérifiez que :
1. ✅ Vous utilisez **Safari** (pas Chrome)
2. ✅ Le site est en **HTTPS** (Vercel le fournit automatiquement)
3. ✅ Le `manifest.json` est accessible
4. ✅ Les icônes sont accessibles

### Le manifest.json retourne 404

1. Vérifiez que le fichier est bien dans `/public/manifest.json`
2. Vérifiez que le fichier est commité dans Git
3. Redéployez sur Vercel

### Les icônes ne s'affichent pas

1. Vérifiez que les fichiers SVG sont dans `/public/`
2. Vérifiez que les chemins dans `manifest.json` sont corrects
3. Testez l'accès direct aux URLs des icônes

## 📝 Prochaines étapes

1. ✅ Déployer sur Vercel
2. ✅ Tester l'installation sur iPhone
3. ⏳ Convertir les icônes en PNG (optionnel mais recommandé)
4. ⏳ Tester le fonctionnement hors ligne
5. ⏳ Configurer les notifications push (optionnel)

