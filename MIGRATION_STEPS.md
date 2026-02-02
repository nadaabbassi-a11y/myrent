# Étapes de migration - Système de signature électronique

## 📦 1. Installation des dépendances

```bash
npm install pdf-lib @vercel/blob
```

## 🔧 2. Variables d'environnement

Ajoutez à `.env.local` :

```env
# Pour Vercel Blob Storage (production uniquement)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

**Note** : Pour le développement local, les PDFs seront stockés dans `/public/leases/`. Le token Vercel Blob n'est nécessaire qu'en production.

## 📊 3. Migration Prisma

```bash
# 1. Vérifier que le schéma est à jour
# Le fichier prisma/schema.prisma a été modifié avec les nouveaux modèles

# 2. Créer la migration
npx prisma migrate dev --name add_esignature_system

# OU si vous préférez push (développement uniquement)
npx prisma db push

# 3. Régénérer le client Prisma
npx prisma generate
```

## ✅ 4. Vérification

Après la migration, vérifiez que les nouveaux modèles existent :

```bash
# Ouvrir Prisma Studio
npx prisma studio

# Vérifier que vous voyez :
# - LeaseStatus enum
# - AnnexDocumentType enum
# - LeaseSignature
# - LeaseOwnerSignature
# - AnnexDocument
# - AnnexSignature
# - AuditLog
```

## 🧪 5. Test local

1. **Créer un bail** (via acceptation d'une candidature)
2. **Accéder à** `/tenant/leases/[leaseId]`
3. **Remplir le formulaire TAL** (sections 1-5)
4. **Cocher la case** "J'ai lu et accepté"
5. **Entrer les initiales**
6. **Cliquer "Signer le bail"**
7. **Vérifier** :
   - Le statut passe à `TENANT_SIGNED`
   - Une entrée `LeaseSignature` est créée
   - Un log d'audit est créé
8. **En tant que propriétaire**, accéder à `/landlord/leases/[leaseId]` (à créer)
9. **Signer en tant que propriétaire**
10. **Vérifier** :
    - Le statut passe à `FINALIZED`
    - Le PDF est généré automatiquement
    - Le PDF est stocké (local ou Vercel Blob)
    - Un `documentId` unique est créé
    - Un hash SHA-256 est calculé

## 🔍 6. Vérification des logs d'audit

```sql
-- Dans Prisma Studio ou votre client SQL
SELECT * FROM audit_logs 
WHERE lease_id = 'votre_lease_id' 
ORDER BY created_at DESC;
```

Vous devriez voir :
- `LEASE_TENANT_SIGNED`
- `LEASE_OWNER_SIGNED`
- `LEASE_FINALIZED`
- `PDF_GENERATED`
- `PDF_VIEWED` ou `PDF_DOWNLOADED`

## 🚀 7. Déploiement

1. **Ajouter la variable d'environnement** `BLOB_READ_WRITE_TOKEN` sur Vercel
2. **Pousser les changements** sur GitHub
3. **Vercel déploiera automatiquement** avec la migration Prisma
4. **Vérifier** que les PDFs sont stockés dans Vercel Blob (pas local)

## ⚠️ 8. Notes importantes

- Les baux existants auront `status = DRAFT` par défaut
- Les champs `signedAt` et `signedBy` sont dépréciés mais conservés pour compatibilité
- Les nouveaux baux créés auront automatiquement 3 documents annexes créés
- Le PDF finalisé est **immutable** - toute modification crée une nouvelle version


