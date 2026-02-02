# Plan de test - Système de signature électronique

## 🧪 Tests à effectuer

### Test 1 : Signature locataire ✅

**Prérequis** : Bail créé (via acceptation candidature)

**Étapes** :
1. Se connecter en tant que locataire
2. Accéder à `/tenant/leases/[leaseId]`
3. Remplir le formulaire TAL (sections 1-5)
4. Cocher la case "J'ai lu et accepté"
5. Entrer les initiales (ex: "J.D.")
6. Cliquer sur "Signer le bail"

**Résultats attendus** :
- ✅ Status du bail = `TENANT_SIGNED`
- ✅ `LeaseSignature` créée avec toutes les métadonnées
- ✅ Audit log `LEASE_TENANT_SIGNED` créé
- ✅ Page affiche "En attente de la signature du propriétaire"
- ✅ Bouton "Signer" désactivé après signature

**Vérifications DB** :
```sql
SELECT * FROM lease_signatures WHERE lease_id = '[leaseId]';
SELECT * FROM audit_logs WHERE lease_id = '[leaseId]' AND action = 'LEASE_TENANT_SIGNED';
SELECT status FROM leases WHERE id = '[leaseId]'; -- Doit être 'TENANT_SIGNED'
```

---

### Test 2 : Signature propriétaire ✅

**Prérequis** : Bail avec `TENANT_SIGNED`

**Étapes** :
1. Se connecter en tant que propriétaire
2. Accéder à `/landlord/leases/[leaseId]`
3. Cocher la case "J'ai lu et accepté"
4. Entrer les initiales (optionnel, ex: "M.D.")
5. Cliquer sur "Signer le bail"

**Résultats attendus** :
- ✅ Status du bail = `FINALIZED` (car tenant a déjà signé)
- ✅ `LeaseOwnerSignature` créée
- ✅ Audit log `LEASE_OWNER_SIGNED` créé
- ✅ Page propose la finalisation automatique

**Vérifications DB** :
```sql
SELECT * FROM lease_owner_signatures WHERE lease_id = '[leaseId]';
SELECT * FROM audit_logs WHERE lease_id = '[leaseId]' AND action = 'LEASE_OWNER_SIGNED';
SELECT status FROM leases WHERE id = '[leaseId]'; -- Doit être 'FINALIZED'
```

---

### Test 3 : Finalisation et génération PDF ✅

**Prérequis** : Les deux signatures existent

**Étapes** :
1. Appeler `POST /api/leases/[leaseId]/finalize`
2. Vérifier la réponse

**Résultats attendus** :
- ✅ `documentId` créé (format: `LEASE-timestamp-random`)
- ✅ `documentHash` calculé (SHA-256, 64 caractères hex)
- ✅ `pdfUrl` stocké (local ou Vercel Blob)
- ✅ `finalizedAt` enregistré
- ✅ `pdfVersion` = 1
- ✅ Audit logs : `LEASE_FINALIZED`, `PDF_GENERATED`
- ✅ PDF contient :
  - Sections TAL (1-5)
  - Page de signatures (section 6)
  - Document ID
  - Hash (tronqué)
  - Footer "Signé électroniquement via MyRent"

**Vérifications DB** :
```sql
SELECT document_id, document_hash, pdf_url, finalized_at, pdf_version 
FROM leases 
WHERE id = '[leaseId]';
-- document_id ne doit pas être NULL
-- document_hash ne doit pas être NULL
-- pdf_url ne doit pas être NULL
```

**Vérification PDF** :
- Ouvrir le PDF généré
- Vérifier toutes les sections
- Vérifier les signatures (noms, dates, initiales)
- Vérifier le document ID et hash

---

### Test 4 : Téléchargement/Visualisation PDF ✅

**Prérequis** : Bail finalisé

**Étapes** :
1. `GET /api/leases/[leaseId]/pdf`
2. Vérifier la réponse

**Résultats attendus** :
- ✅ PDF retourné (Content-Type: `application/pdf`)
- ✅ Headers corrects :
  - `Content-Disposition: inline; filename="bail-[documentId].pdf"`
  - `Cache-Control: private, max-age=3600`
- ✅ Audit log `PDF_VIEWED` ou `PDF_DOWNLOADED` créé
- ✅ PDF lisible et complet

**Vérifications** :
```sql
SELECT * FROM audit_logs 
WHERE lease_id = '[leaseId]' 
AND action IN ('PDF_VIEWED', 'PDF_DOWNLOADED')
ORDER BY created_at DESC;
```

---

### Test 5 : Sécurité et autorisations ✅

#### 5.1 Accès non autorisé
**Étapes** :
1. Se connecter avec un compte qui n'est ni le locataire ni le propriétaire
2. Tenter d'accéder à `/api/leases/[leaseId]/sign-tenant`
3. Tenter d'accéder à `/api/leases/[leaseId]/pdf`

**Résultats attendus** :
- ✅ 403 Forbidden pour toutes les routes

#### 5.2 Signature par mauvais rôle
**Étapes** :
1. Locataire tente de signer via `/sign-owner`
2. Propriétaire tente de signer via `/sign-tenant`

**Résultats attendus** :
- ✅ 403 Forbidden

#### 5.3 Double signature
**Étapes** :
1. Signer une première fois (succès)
2. Tenter de signer une deuxième fois

**Résultats attendus** :
- ✅ 400 Bad Request avec message "déjà signé"

#### 5.4 Finalisation sans les deux signatures
**Étapes** :
1. Créer un bail (status = DRAFT)
2. Appeler `POST /api/leases/[leaseId]/finalize` sans signatures

**Résultats attendus** :
- ✅ 400 Bad Request "Les deux signatures sont requises"

---

### Test 6 : Documents annexes ✅

#### 6.1 Création automatique
**Prérequis** : Acceptation d'une candidature (création de bail)

**Vérifications** :
```sql
SELECT * FROM annex_documents WHERE lease_id = '[leaseId]';
-- Doit retourner 3 documents :
-- 1. PAYMENT_CONSENT
-- 2. CREDIT_CHECK_AUTH
-- 3. ELECTRONIC_COMMS
```

#### 6.2 Signature d'un document annexe
**Étapes** :
1. `POST /api/annex/[annexId]/sign` avec `{ "consentGiven": true }`
2. Vérifier la réponse

**Résultats attendus** :
- ✅ `AnnexSignature` créée
- ✅ Audit log `ANNEX_SIGNED` créé
- ✅ Métadonnées (IP, user agent, etc.) enregistrées

**Vérifications DB** :
```sql
SELECT * FROM annex_signatures WHERE annex_id = '[annexId]';
SELECT * FROM audit_logs WHERE annex_id = '[annexId]' AND action = 'ANNEX_SIGNED';
```

#### 6.3 Double signature d'annexe
**Étapes** :
1. Signer une première fois
2. Tenter de signer une deuxième fois

**Résultats attendus** :
- ✅ 400 Bad Request "Vous avez déjà signé ce document"

---

### Test 7 : Validation des champs ✅

#### 7.1 Signature sans consentement
**Étapes** :
1. Tenter de signer avec `consentGiven: false`

**Résultats attendus** :
- ✅ 400 Bad Request "Vous devez cocher la case pour confirmer votre signature"

#### 7.2 Signature locataire sans initiales
**Étapes** :
1. Cocher la case mais ne pas entrer d'initiales
2. Tenter de signer

**Résultats attendus** :
- ✅ 400 Bad Request "Les initiales sont requises"

#### 7.3 Initiales trop longues
**Étapes** :
1. Entrer des initiales de plus de 10 caractères

**Résultats attendus** :
- ✅ Validation côté client empêche la soumission
- ✅ Message d'erreur approprié

---

### Test 8 : Immutabilité du PDF ✅

**Prérequis** : Bail finalisé avec PDF

**Étapes** :
1. Tenter de modifier le bail après finalisation
2. Vérifier que le PDF reste inchangé

**Résultats attendus** :
- ✅ Le bail ne peut plus être modifié (status = FINALIZED)
- ✅ Le PDF stocké reste identique
- ✅ Le hash du document reste le même
- ✅ Toute modification créerait une nouvelle version (non implémenté pour MVP)

---

### Test 9 : Audit trail complet ✅

**Vérifications** :
```sql
-- Vérifier tous les logs d'audit pour un bail
SELECT 
  action,
  entity,
  created_at,
  metadata
FROM audit_logs
WHERE lease_id = '[leaseId]'
ORDER BY created_at ASC;

-- Doit contenir (dans l'ordre) :
-- 1. LEASE_TENANT_SIGNED
-- 2. LEASE_OWNER_SIGNED
-- 3. LEASE_FINALIZED
-- 4. PDF_GENERATED
-- 5. PDF_VIEWED (ou PDF_DOWNLOADED)
```

**Résultats attendus** :
- ✅ Tous les événements sont enregistrés
- ✅ Métadonnées complètes (IP, user agent, document version, etc.)
- ✅ Timestamps corrects
- ✅ User IDs corrects

---

### Test 10 : Stockage PDF ✅

#### 10.1 Développement local
**Vérifications** :
- ✅ PDF stocké dans `/public/leases/lease-[id]-v1-[timestamp].pdf`
- ✅ Fichier accessible via URL `/leases/...`
- ✅ Fichier lisible et complet

#### 10.2 Production (Vercel Blob)
**Prérequis** : `BLOB_READ_WRITE_TOKEN` configuré

**Vérifications** :
- ✅ PDF stocké dans Vercel Blob
- ✅ `pdfUrl` pointe vers `https://*.blob.vercel-storage.com/...`
- ✅ PDF accessible publiquement
- ✅ PDF lisible et complet

---

## ✅ Checklist de validation

- [ ] Test 1 : Signature locataire
- [ ] Test 2 : Signature propriétaire
- [ ] Test 3 : Finalisation et PDF
- [ ] Test 4 : Téléchargement PDF
- [ ] Test 5.1 : Accès non autorisé
- [ ] Test 5.2 : Mauvais rôle
- [ ] Test 5.3 : Double signature
- [ ] Test 5.4 : Finalisation sans signatures
- [ ] Test 6.1 : Création annexes
- [ ] Test 6.2 : Signature annexe
- [ ] Test 6.3 : Double signature annexe
- [ ] Test 7.1 : Validation consentement
- [ ] Test 7.2 : Validation initiales
- [ ] Test 8 : Immutabilité
- [ ] Test 9 : Audit trail
- [ ] Test 10 : Stockage PDF

---

## 🐛 Problèmes connus et solutions

### Problème : PDF ne se génère pas
**Solution** : Vérifier que `pdf-lib` est installé et que les deux signatures existent

### Problème : Erreur Vercel Blob
**Solution** : Vérifier que `BLOB_READ_WRITE_TOKEN` est défini en production

### Problème : Hash ne correspond pas
**Solution** : Vérifier que le contenu du PDF n'a pas été modifié après génération

### Problème : Audit logs manquants
**Solution** : Vérifier que `createAuditLog` est appelé dans toutes les routes

---

## 📊 Métriques à surveiller

- Temps de génération PDF (devrait être < 2s)
- Taille des PDFs générés (devrait être < 500KB)
- Nombre de signatures par jour
- Taux d'erreur de signature
- Temps de réponse des API routes


