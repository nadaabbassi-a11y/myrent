# Guide : Entrée flexible dans le processus

Ce guide explique comment permettre aux utilisateurs d'entrer dans le processus à n'importe quelle étape, sans avoir à passer par toutes les étapes précédentes.

## 🎯 Cas d'usage

### 1. Annonces externes (Facebook Marketplace, etc.)

**Scénario :** Un propriétaire a déjà publié son annonce sur Facebook Marketplace et a déjà fait une visite avec un locataire. Il veut maintenant utiliser la plateforme pour gérer la candidature et le bail.

**Solution :** Utiliser l'**Application directe** (sans visite)

1. Aller dans **Actions rapides** → **Application directe**
2. Entrer l'ID de l'annonce et l'email du locataire
3. Le locataire recevra un lien pour postuler directement, sans avoir besoin de réserver une visite

**API :** `POST /api/applications/create-direct`

```json
{
  "listingId": "cml5ohvx30005xrn0ssab1758",
  "tenantEmail": "locataire@example.com"
}
```

### 2. Application déjà acceptée

**Scénario :** Un propriétaire a déjà accepté une candidature et veut créer le bail directement, sans passer par toutes les étapes.

**Solution :** Créer un bail depuis une application acceptée

1. Aller dans **Actions rapides** → **Bail depuis application**
2. Entrer l'ID de l'application acceptée
3. Remplir les informations du bail (dates, loyer, caution, conditions)
4. Le bail sera créé et accessible immédiatement

**API :** `POST /api/leases/create-from-application`

```json
{
  "applicationId": "cml5ohvx30005xrn0ssab1758",
  "startDate": "2024-03-01T00:00:00Z",
  "endDate": "2025-03-01T00:00:00Z",
  "monthlyRent": 1200,
  "deposit": 600,
  "terms": "Conditions particulières du bail..."
}
```

### 3. Bail existant à importer

**Scénario :** Un propriétaire a déjà un bail signé (sur papier ou via un autre système) et veut l'importer dans la plateforme pour utiliser la gestion de loyer.

**Solution :** Créer un bail manuellement

1. Aller dans **Actions rapides** → **Bail manuel**
2. Entrer l'ID de l'annonce et l'email du locataire
3. Remplir toutes les informations du bail
4. Le bail sera créé avec le statut "FINALIZED" et accessible immédiatement dans la gestion de loyer

**API :** `POST /api/leases/create-manual`

```json
{
  "listingId": "cml5ohvx30005xrn0ssab1758",
  "tenantEmail": "locataire@example.com",
  "startDate": "2024-03-01T00:00:00Z",
  "endDate": "2025-03-01T00:00:00Z",
  "monthlyRent": 1200,
  "deposit": 600,
  "terms": "Conditions particulières du bail..."
}
```

## 📋 Modifications apportées

### Schéma Prisma

- `appointmentId` dans `Application` est maintenant **optionnel** (`String?`)
- Permet de créer des applications sans visite préalable

### Nouvelles routes API

1. **`/api/applications/create-direct`** - Créer une application sans visite
2. **`/api/leases/create-from-application`** - Créer un bail depuis une application acceptée
3. **`/api/leases/create-manual`** - Créer un bail manuellement

### Nouvelle page

- **`/landlord/quick-actions`** - Interface pour utiliser toutes ces fonctionnalités

## 🔗 Accès direct à la gestion de loyer

La gestion de loyer fonctionne déjà pour tous les baux, qu'ils aient été créés via le processus normal ou manuellement. Il suffit d'accéder à :

- **Propriétaire :** `/landlord/rent-management/[leaseId]`
- **Locataire :** `/tenant/rent-management/[leaseId]`

## ⚠️ Prérequis

- Le locataire doit avoir un compte sur la plateforme (avec l'email fourni)
- L'annonce doit appartenir au propriétaire qui fait la requête
- Pour les applications directes, le locataire doit exister avec le rôle "TENANT"

## 🚀 Utilisation

1. Connectez-vous en tant que propriétaire
2. Allez dans le menu → **Actions rapides**
3. Choisissez l'action appropriée selon votre situation
4. Remplissez le formulaire
5. Le système créera automatiquement les entités nécessaires

## 📝 Notes

- Les applications créées directement ont le statut "DRAFT" - le locataire doit compléter sa candidature
- Les baux créés manuellement ont le statut "FINALIZED" - ils sont immédiatement accessibles
- Tous les baux (créés normalement ou manuellement) sont accessibles dans la gestion de loyer

