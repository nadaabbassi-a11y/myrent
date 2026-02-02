# Guide d'implémentation - Système de signature électronique TAL

## 📋 Vue d'ensemble

Ce guide décrit l'implémentation complète du système de signature électronique pour les baux TAL (Tribunal administratif du logement) du Québec.

## 🔧 1. Installation des dépendances

```bash
npm install pdf-lib @vercel/blob
npm install --save-dev @types/node
```

## 📊 2. Migration Prisma

Le schéma Prisma a été mis à jour avec les nouveaux modèles. Exécutez la migration :

```bash
# Générer la migration
npx prisma migrate dev --name add_esignature_system

# Ou si vous préférez push (développement uniquement)
npx prisma db push

# Régénérer le client Prisma
npx prisma generate
```

## 🔐 3. Variables d'environnement

Ajoutez à votre `.env.local` :

```env
# Pour Vercel Blob Storage (production)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

# Assurez-vous que JWT_SECRET est défini
JWT_SECRET=votre_secret_jwt
```

**Note** : Pour obtenir le token Vercel Blob :
1. Allez sur https://vercel.com/dashboard
2. Settings → Storage → Create Database
3. Choisissez "Blob"
4. Copiez le token `BLOB_READ_WRITE_TOKEN`

## 📁 4. Structure des fichiers créés

### Schéma Prisma
- `prisma/schema.prisma` - Modifié avec les nouveaux modèles

### Utilitaires
- `lib/document-hash.ts` - Génération de hash SHA-256 et document ID
- `lib/pdf-generator.ts` - Génération de PDF avec pdf-lib
- `lib/storage.ts` - Stockage PDF (local dev / Vercel Blob prod)
- `lib/request-utils.ts` - Extraction IP et User Agent
- `lib/audit-log.ts` - Création de logs d'audit

### Routes API
- `app/api/leases/[leaseId]/sign-tenant/route.ts` - Signature locataire
- `app/api/leases/[leaseId]/sign-owner/route.ts` - Signature propriétaire
- `app/api/leases/[leaseId]/finalize/route.ts` - Finalisation et génération PDF
- `app/api/leases/[leaseId]/pdf/route.ts` - Téléchargement/visualisation PDF
- `app/api/annex/[annexId]/sign/route.ts` - Signature documents annexes

## 🎨 5. Mise à jour de l'UI

### Page locataire : `/tenant/leases/[id]`

La page existante doit être mise à jour pour :
1. Afficher le statut du bail (DRAFT, TENANT_SIGNED, OWNER_SIGNED, FINALIZED)
2. Afficher une checkbox "J'ai lu et accepté" (obligatoire)
3. Champ pour les initiales (obligatoire)
4. Bouton "Signer" désactivé jusqu'à ce que la checkbox soit cochée
5. Après signature, afficher le statut et permettre la finalisation si les deux ont signé
6. Lien pour télécharger/voir le PDF finalisé

### Page propriétaire : `/landlord/leases/[id]` (à créer)

Similaire à la page locataire mais pour la signature propriétaire.

## ✅ 6. Plan de test

### Tests locaux

1. **Test signature locataire** :
   ```bash
   # Créer un bail (via acceptation candidature)
   # Accéder à /tenant/leases/[leaseId]
   # Cocher la case + entrer initiales
   # Cliquer "Signer"
   # Vérifier : status = TENANT_SIGNED, signature créée, audit log créé
   ```

2. **Test signature propriétaire** :
   ```bash
   # Accéder à /landlord/leases/[leaseId]
   # Cocher la case + entrer initiales (optionnel)
   # Cliquer "Signer"
   # Vérifier : status = FINALIZED (si tenant a signé), signature créée
   ```

3. **Test finalisation automatique** :
   ```bash
   # Après les deux signatures, appeler POST /api/leases/[leaseId]/finalize
   # Vérifier : PDF généré, documentId créé, hash calculé, pdfUrl stocké
   ```

4. **Test téléchargement PDF** :
   ```bash
   # GET /api/leases/[leaseId]/pdf
   # Vérifier : PDF retourné, audit log "PDF_VIEWED" créé
   ```

5. **Test sécurité** :
   ```bash
   # Tentative d'accès par utilisateur non autorisé
   # Vérifier : 403 Forbidden
   ```

6. **Test documents annexes** :
   ```bash
   # Créer un document annexe (via API ou UI)
   # Signer le document annexe
   # Vérifier : signature créée, audit log créé
   ```

## 🔍 7. Vérification post-déploiement

1. Vérifier que les migrations Prisma sont appliquées
2. Vérifier que les variables d'environnement sont définies
3. Tester le flux complet : signature tenant → signature owner → finalisation → PDF
4. Vérifier les logs d'audit dans la base de données
5. Vérifier que les PDFs sont stockés correctement (Vercel Blob ou local)

## 📝 8. Notes importantes

- **Immutabilité** : Une fois finalisé, le PDF ne peut plus être modifié. Toute modification crée une nouvelle version.
- **Séparation des annexes** : Les consentements (paiement, crédit, communications) sont des documents séparés, pas intégrés au bail.
- **Audit trail** : Toutes les actions importantes sont enregistrées dans `AuditLog`.
- **Conformité TAL** : Le formulaire reproduit le contenu officiel du TAL sans modification.


