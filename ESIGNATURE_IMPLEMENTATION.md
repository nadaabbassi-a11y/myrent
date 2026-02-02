# Implémentation complète - Système de signature électronique TAL

## 📋 Résumé

Système complet de signature électronique pour les baux TAL du Québec avec :
- Signature séquentielle (locataire → propriétaire)
- Génération de PDF immuable après finalisation
- Documents annexes séparés
- Audit trail complet
- Conformité légale TAL

---

## 1️⃣ SCHÉMA PRISMA

### Fichier : `prisma/schema.prisma`

**Modifications apportées :**

1. **Nouveaux enums** :
   - `LeaseStatus` : DRAFT, TENANT_SIGNED, OWNER_SIGNED, FINALIZED
   - `AnnexDocumentType` : PAYMENT_CONSENT, CREDIT_CHECK_AUTH, ELECTRONIC_COMMS

2. **Modèle `Lease` mis à jour** :
   - Ajout de `status`, `documentId`, `documentHash`, `finalizedAt`, `pdfUrl`, `pdfVersion`
   - Relations vers `LeaseSignature`, `LeaseOwnerSignature`, `AnnexDocument`, `AuditLog`

3. **Nouveaux modèles** :
   - `LeaseSignature` : Signature du locataire
   - `LeaseOwnerSignature` : Signature du propriétaire
   - `AnnexDocument` : Documents annexes (paiement, crédit, communications)
   - `AnnexSignature` : Signatures des documents annexes
   - `AuditLog` : Journal d'audit pour toutes les actions

**Migration :**
```bash
npx prisma migrate dev --name add_esignature_system
npx prisma generate
```

---

## 2️⃣ UTILITAIRES CRÉÉS

### `lib/document-hash.ts`
- `generateDocumentHash()` : SHA-256 hash pour intégrité
- `generateDocumentId()` : ID unique pour chaque PDF finalisé

### `lib/pdf-generator.ts`
- `generateLeasePDF()` : Génère le PDF final avec :
  - Contenu TAL (sections 1-5)
  - Page de signatures (section 6)
  - Document ID et hash
  - Footer "Signé électroniquement via MyRent"

### `lib/storage.ts`
- `storePDF()` : Stockage local (dev) ou Vercel Blob (prod)
- `getPDF()` : Récupération du PDF

### `lib/request-utils.ts`
- `getClientIP()` : Extraction IP depuis headers
- `getUserAgent()` : Extraction User Agent

### `lib/audit-log.ts`
- `createAuditLog()` : Création d'entrées d'audit standardisées

---

## 3️⃣ ROUTES API

### `POST /api/leases/[leaseId]/sign-tenant`
**Rôle** : TENANT uniquement
**Body** :
```json
{
  "consentGiven": true,
  "initials": "J.D."
}
```
**Actions** :
- Crée `LeaseSignature`
- Met à jour `Lease.status` → `TENANT_SIGNED` ou `FINALIZED` (si owner a signé)
- Crée audit log `LEASE_TENANT_SIGNED`

### `POST /api/leases/[leaseId]/sign-owner`
**Rôle** : LANDLORD uniquement
**Body** :
```json
{
  "consentGiven": true,
  "initials": "M.D." // optionnel
}
```
**Actions** :
- Crée `LeaseOwnerSignature`
- Met à jour `Lease.status` → `OWNER_SIGNED` ou `FINALIZED` (si tenant a signé)
- Crée audit log `LEASE_OWNER_SIGNED`

### `POST /api/leases/[leaseId]/finalize`
**Rôle** : TENANT ou LANDLORD (propriétaire du bail)
**Actions** :
- Vérifie que les deux signatures existent
- Génère le PDF avec `generateLeasePDF()`
- Calcule le hash SHA-256
- Génère un `documentId` unique
- Stocke le PDF (local ou Vercel Blob)
- Met à jour `Lease` : `status=FINALIZED`, `pdfUrl`, `documentId`, `documentHash`, `finalizedAt`
- Crée audit logs : `LEASE_FINALIZED`, `PDF_GENERATED`

### `GET /api/leases/[leaseId]/pdf`
**Rôle** : TENANT ou LANDLORD (propriétaire du bail)
**Actions** :
- Vérifie que le bail est finalisé
- Récupère le PDF depuis le stockage
- Crée audit log : `PDF_VIEWED` ou `PDF_DOWNLOADED`
- Retourne le PDF avec headers appropriés

### `POST /api/annex/[annexId]/sign`
**Rôle** : TENANT ou LANDLORD
**Body** :
```json
{
  "consentGiven": true
}
```
**Actions** :
- Crée `AnnexSignature`
- Crée audit log `ANNEX_SIGNED`

### `POST /api/leases/[leaseId]/create-annexes`
**Rôle** : LANDLORD uniquement
**Actions** :
- Crée les 3 documents annexes par défaut (appelé automatiquement lors de la création du bail)

---

## 4️⃣ MISE À JOUR UI

### Page locataire : `/tenant/leases/[id]`

**Modifications apportées :**

1. **Interface `Lease` mise à jour** :
   - Ajout de `status`, `documentId`, `pdfUrl`, `finalizedAt`
   - Ajout de `tenantSignature` et `ownerSignature`

2. **Fonction `handleSign()` modifiée** :
   - Appelle `/api/leases/[leaseId]/sign-tenant` au lieu de l'ancienne route
   - Envoie seulement `consentGiven` et `initials`
   - Auto-finalise si les deux ont signé

3. **Nouvelle fonction `handleFinalize()`** :
   - Appelle `/api/leases/[leaseId]/finalize`
   - Recharge les données après finalisation

4. **Fonction `renderLeaseStatus()`** :
   - Affiche le statut selon `lease.status`
   - Affiche les signatures existantes
   - Affiche le lien PDF si finalisé

5. **Bouton "Signer"** :
   - Désactivé si `!signatureConsent || !tenantInitials.trim()`
   - Affiche "Signature en cours..." pendant le traitement

6. **Affichage conditionnel** :
   - Si `FINALIZED` : Affiche seulement le statut et le lien PDF
   - Si `TENANT_SIGNED` : Affiche "En attente de la signature du propriétaire"
   - Si `DRAFT` : Affiche le formulaire complet

### Page propriétaire : `/landlord/leases/[id]` (à créer)

Créer une page similaire pour le propriétaire avec :
- Formulaire TAL (lecture seule ou pré-rempli)
- Checkbox "J'ai lu et accepté"
- Champ initiales (optionnel)
- Bouton "Signer en tant que propriétaire"
- Appel à `/api/leases/[leaseId]/sign-owner`

---

## 5️⃣ CRÉATION AUTOMATIQUE DES ANNEXES

Lors de la création d'un bail (dans `app/api/applications/[id]/accept/route.ts`), les 3 documents annexes sont automatiquement créés :
- PAYMENT_CONSENT
- CREDIT_CHECK_AUTH
- ELECTRONIC_COMMS

---

## 6️⃣ PLAN DE TEST

### Test 1 : Signature locataire
```bash
1. Créer un bail (accepter une candidature)
2. Accéder à /tenant/leases/[leaseId]
3. Remplir le formulaire TAL
4. Cocher "J'ai lu et accepté"
5. Entrer initiales "J.D."
6. Cliquer "Signer le bail"
7. Vérifier :
   ✓ Status = TENANT_SIGNED
   ✓ LeaseSignature créée
   ✓ Audit log LEASE_TENANT_SIGNED créé
   ✓ Page affiche "En attente de la signature du propriétaire"
```

### Test 2 : Signature propriétaire
```bash
1. Se connecter en tant que propriétaire
2. Accéder à /landlord/leases/[leaseId]
3. Cocher "J'ai lu et accepté"
4. Entrer initiales (optionnel)
5. Cliquer "Signer en tant que propriétaire"
6. Vérifier :
   ✓ Status = FINALIZED (si tenant a signé)
   ✓ LeaseOwnerSignature créée
   ✓ Audit log LEASE_OWNER_SIGNED créé
```

### Test 3 : Finalisation automatique
```bash
1. Après les deux signatures, vérifier que :
   ✓ Status = FINALIZED
   ✓ PDF généré automatiquement (ou proposer bouton "Finaliser")
2. Appeler POST /api/leases/[leaseId]/finalize
3. Vérifier :
   ✓ documentId créé (format: LEASE-timestamp-random)
   ✓ documentHash calculé (SHA-256)
   ✓ pdfUrl stocké (local ou Vercel Blob)
   ✓ finalizedAt enregistré
   ✓ Audit logs : LEASE_FINALIZED, PDF_GENERATED
```

### Test 4 : Téléchargement PDF
```bash
1. GET /api/leases/[leaseId]/pdf
2. Vérifier :
   ✓ PDF retourné (Content-Type: application/pdf)
   ✓ Audit log PDF_VIEWED créé
   ✓ PDF contient toutes les sections TAL
   ✓ PDF contient les signatures (noms, dates, initiales)
   ✓ PDF contient documentId et hash
   ✓ Footer "Signé électroniquement via MyRent"
```

### Test 5 : Sécurité
```bash
1. Tentative d'accès par utilisateur non autorisé :
   ✓ 403 Forbidden
2. Tentative de signature par mauvais rôle :
   ✓ 403 Forbidden
3. Tentative de signer deux fois :
   ✓ 400 Bad Request "déjà signé"
4. Tentative de finaliser sans les deux signatures :
   ✓ 400 Bad Request "Les deux signatures sont requises"
```

### Test 6 : Documents annexes
```bash
1. Créer un bail → vérifier 3 annexes créés
2. Signer un document annexe :
   ✓ POST /api/annex/[annexId]/sign
   ✓ AnnexSignature créée
   ✓ Audit log ANNEX_SIGNED créé
3. Vérifier qu'on ne peut pas signer deux fois :
   ✓ 400 Bad Request "déjà signé"
```

---

## 7️⃣ INSTALLATION ET DÉPLOIEMENT

### Dépendances à installer :
```bash
npm install pdf-lib @vercel/blob
```

### Variables d'environnement :
```env
# Production (Vercel)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

# Développement local
# Pas nécessaire - PDFs stockés dans /public/leases/
```

### Migration :
```bash
npx prisma migrate dev --name add_esignature_system
npx prisma generate
```

### Vérification post-migration :
```bash
npx prisma studio
# Vérifier les nouveaux modèles et enums
```

---

## 8️⃣ FICHIERS CRÉÉS/MODIFIÉS

### Schéma Prisma
- ✅ `prisma/schema.prisma` - Modifié

### Utilitaires
- ✅ `lib/document-hash.ts` - Nouveau
- ✅ `lib/pdf-generator.ts` - Nouveau
- ✅ `lib/storage.ts` - Nouveau
- ✅ `lib/request-utils.ts` - Nouveau
- ✅ `lib/audit-log.ts` - Nouveau

### Routes API
- ✅ `app/api/leases/[leaseId]/sign-tenant/route.ts` - Nouveau
- ✅ `app/api/leases/[leaseId]/sign-owner/route.ts` - Nouveau
- ✅ `app/api/leases/[leaseId]/finalize/route.ts` - Nouveau
- ✅ `app/api/leases/[leaseId]/pdf/route.ts` - Nouveau
- ✅ `app/api/annex/[annexId]/sign/route.ts` - Nouveau
- ✅ `app/api/leases/[leaseId]/create-annexes/route.ts` - Nouveau
- ✅ `app/api/leases/[id]/route.ts` - Modifié (ajout signatures)
- ✅ `app/api/applications/[id]/accept/route.ts` - Modifié (création annexes)

### UI
- ✅ `app/tenant/leases/[id]/page.tsx` - Modifié (nouvelle logique de signature)
- ⚠️ `app/landlord/leases/[id]/page.tsx` - À créer (similaire à tenant)

### Documentation
- ✅ `IMPLEMENTATION_GUIDE.md` - Nouveau
- ✅ `MIGRATION_STEPS.md` - Nouveau
- ✅ `ESIGNATURE_IMPLEMENTATION.md` - Ce fichier

---

## 9️⃣ NOTES IMPORTANTES

### Conformité légale
- ✅ Le formulaire TAL est reproduit sans modification
- ✅ Mention "formulaire reproduit" ajoutée
- ✅ Date/heure/identité enregistrées pour preuve légale
- ✅ Documents annexes séparés du bail principal

### Immutabilité
- ✅ Une fois finalisé, le PDF ne peut plus être modifié
- ✅ Toute modification crée une nouvelle version (`pdfVersion++`)
- ✅ Hash SHA-256 pour vérification d'intégrité

### Sécurité
- ✅ RBAC strict (tenant/landlord uniquement)
- ✅ Vérification de propriété du bail
- ✅ IP et User Agent enregistrés
- ✅ Audit trail complet

### Stockage
- ✅ Développement : `/public/leases/`
- ✅ Production : Vercel Blob Storage
- ✅ URLs stockées dans `Lease.pdfUrl`

---

## 🔟 PROCHAINES ÉTAPES

1. ✅ Créer la page propriétaire `/landlord/leases/[id]` pour signature
2. ✅ Tester le flux complet localement
3. ✅ Configurer Vercel Blob en production
4. ✅ Ajouter des tests automatisés (optionnel)
5. ✅ Documenter l'API pour l'équipe

---

## 📞 Support

En cas de problème :
1. Vérifier les logs d'audit dans `audit_logs`
2. Vérifier les erreurs dans la console serveur
3. Vérifier que les migrations Prisma sont appliquées
4. Vérifier les variables d'environnement


