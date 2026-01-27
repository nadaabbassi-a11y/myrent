# Éléments manquants pour rendre l'application fonctionnelle

## 🔴 CRITIQUE (Nécessaire pour le fonctionnement de base)

### 1. Authentification
- [ ] `/app/auth/signin/page.tsx` - Page de connexion
- [ ] `/app/auth/signup/page.tsx` - Page d'inscription
- [ ] `/app/api/auth/[...nextauth]/route.ts` - Configuration NextAuth
- [ ] `/lib/auth.ts` - Configuration et helpers NextAuth
- [ ] `/types/next-auth.d.ts` - Types TypeScript pour NextAuth
- [ ] Variables d'environnement (`.env`) :
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `GOOGLE_CLIENT_ID` (optionnel)
  - `GOOGLE_CLIENT_SECRET` (optionnel)
  - `APPLE_CLIENT_ID` (optionnel)
  - `APPLE_CLIENT_SECRET` (optionnel)

### 2. Base de données
- [ ] `/prisma/schema.prisma` - Schema complet avec tous les modèles
- [ ] `/lib/prisma.ts` - Client Prisma singleton
- [ ] Migration Prisma initiale
- [ ] Script de seed (`/prisma/seed.ts`)

### 3. Pages de détails
- [ ] `/app/listings/[id]/page.tsx` - Page de détails d'un listing

### 4. Composants essentiels manquants
- [ ] `/components/image-gallery.tsx` - Galerie d'images
- [ ] `/components/virtual-tour-viewer.tsx` - Visite virtuelle
- [ ] `/components/model3d-viewer.tsx` - Modèle 3D
- [ ] `/components/apply-button.tsx` - Bouton de candidature
- [ ] `/components/budget-income-filter.tsx` - Filtre budget/revenu
- [ ] `/components/income-consent-modal.tsx` - Modal de consentement
- [ ] `/components/map-view.tsx` - Vue carte (Leaflet)
- [ ] `/components/leaflet-map.tsx` - Carte Leaflet pour détails

### 5. Composants UI manquants
- [ ] `/components/ui/select.tsx` - Select dropdown
- [ ] `/components/ui/label.tsx` - Label pour formulaires
- [ ] `/components/ui/toast.tsx` - Toast notifications
- [ ] `/components/ui/toaster.tsx` - Provider Toast
- [ ] `/components/ui/use-toast.ts` - Hook pour Toast
- [ ] `/components/ui/dialog.tsx` - Dialog/Modal

## 🟡 IMPORTANT (Fonctionnalités utilisateur)

### 6. Pages Tenant
- [ ] `/app/tenant/dashboard/page.tsx` - Tableau de bord locataire
- [ ] `/app/tenant/dossier/page.tsx` - Gestion du dossier locataire
- [ ] `/app/tenant/profile/page.tsx` - Profil locataire
- [ ] `/app/tenant/applications/page.tsx` - Liste des candidatures
- [ ] `/app/tenant/applications/[id]/page.tsx` - Détails d'une candidature

### 7. Pages Landlord
- [ ] `/app/landlord/dashboard/page.tsx` - Tableau de bord propriétaire
- [ ] `/app/landlord/listings/page.tsx` - Liste des annonces
- [ ] `/app/landlord/listings/new/page.tsx` - Créer une annonce
- [ ] `/app/landlord/listings/[id]/page.tsx` - Détails/Éditer une annonce
- [ ] `/app/landlord/applications/page.tsx` - Liste des candidatures
- [ ] `/app/landlord/applications/[id]/page.tsx` - Détails d'une candidature

### 8. API Routes
- [ ] `/app/api/applications/route.ts` - POST: Créer candidature
- [ ] `/app/api/applications/[id]/route.ts` - GET/PUT: Gérer candidature
- [ ] `/app/api/listings/route.ts` - GET/POST: Liste/Créer listings
- [ ] `/app/api/listings/[id]/route.ts` - GET/PUT/DELETE: Gérer listing
- [ ] `/app/api/leases/route.ts` - Gérer les baux
- [ ] `/app/api/leases/[id]/route.ts` - Détails/modifier bail

## 🟢 OPTIONNEL (Améliorations)

### 9. Fonctionnalités avancées
- [ ] `/app/messages/page.tsx` - Messagerie
- [ ] `/app/messages/[threadId]/page.tsx` - Conversation
- [ ] `/app/tenant/payments/page.tsx` - Historique des paiements
- [ ] `/app/landlord/payments/page.tsx` - Paiements reçus

### 10. Utilitaires et helpers
- [ ] `/lib/rbac.ts` - Contrôle d'accès basé sur les rôles
- [ ] `/lib/file-storage.ts` - Gestion du stockage de fichiers
- [ ] `/lib/validation.ts` - Schémas Zod réutilisables

### 11. Pages supplémentaires
- [ ] `/app/not-found.tsx` - Page 404 personnalisée
- [ ] `/app/error.tsx` - Page d'erreur

## 📋 Résumé

**Total estimé :**
- 🔴 Critique : ~15 fichiers
- 🟡 Important : ~15 fichiers  
- 🟢 Optionnel : ~10 fichiers

**Priorité d'implémentation :**
1. Authentification + Base de données (CRITIQUE)
2. Pages de détails + Composants essentiels (CRITIQUE)
3. Pages Tenant/Landlord (IMPORTANT)
4. API Routes (IMPORTANT)
5. Fonctionnalités avancées (OPTIONNEL)


