# Proposition : Gestion des Co-locataires

## Analyse de la situation actuelle

Actuellement, une `Application` est liée à un seul `TenantProfile` (locataire principal). Pour gérer plusieurs personnes sur le même bail, nous devons permettre :

1. **Plusieurs personnes sur une même application**
2. **Chaque personne remplit ses propres informations**
3. **Possibilité pour le locataire principal de remplir les infos des co-applicants (avec consentement)**

## Options envisagées

### Option 1 : Application partagée avec invitations individuelles (RECOMMANDÉE)

**Principe :**
- Le locataire principal crée l'application et ajoute des co-applicants (nom + email)
- Chaque co-applicant reçoit une invitation par email avec un lien unique
- Chaque personne remplit ses propres informations via son lien
- Le locataire principal peut voir l'avancement de tous les co-applicants
- Option : Le locataire principal peut aussi remplir les infos des co-applicants (avec consentement explicite)

**Avantages :**
- ✅ Chaque personne contrôle ses propres données
- ✅ Plus sécurisé (chaque personne a son propre compte)
- ✅ Traçabilité claire (qui a rempli quoi)
- ✅ Flexible : permet aussi au locataire principal de remplir pour les autres si besoin

**Inconvénients :**
- ⚠️ Nécessite que chaque personne ait un email
- ⚠️ Plus de complexité technique

### Option 2 : Tout remplir dans un seul compte

**Principe :**
- Le locataire principal remplit toutes les informations de tous les co-applicants dans son compte
- Pas besoin d'invitations ni de comptes séparés

**Avantages :**
- ✅ Simple et rapide
- ✅ Pas besoin d'emails pour les co-applicants
- ✅ Moins de complexité technique

**Inconvénients :**
- ❌ Le locataire principal a accès aux données personnelles des autres
- ❌ Pas de consentement explicite de chaque personne
- ❌ Moins sécurisé
- ❌ Problèmes légaux potentiels (RGPD, protection des données)

### Option 3 : Approche hybride (MEILLEURE SOLUTION)

**Principe :**
- Le locataire principal peut ajouter des co-applicants
- **Par défaut** : Envoi d'invitations pour que chacun remplisse ses infos
- **Option "Remplir pour eux"** : Le locataire principal peut choisir de remplir les infos des co-applicants lui-même
  - Nécessite un consentement explicite (case à cocher)
  - Affiche un avertissement sur la protection des données
  - Les co-applicants reçoivent quand même un email pour vérifier/valider leurs informations

**Avantages :**
- ✅ Flexibilité maximale
- ✅ Sécurité par défaut (chacun remplit ses infos)
- ✅ Option pratique pour les familles/couples qui préfèrent gérer ensemble
- ✅ Consentement explicite requis
- ✅ Validation possible par les co-applicants même si rempli par le principal

**Inconvénients :**
- ⚠️ Plus complexe à implémenter
- ⚠️ Nécessite une interface claire pour gérer les deux modes

## Recommandation : Option 3 (Hybride)

### Structure de données proposée

```prisma
model CoApplicant {
  id            String   @id @default(cuid())
  applicationId String
  email         String?
  name          String
  role          String   @default("CO_APPLICANT") // CO_APPLICANT, GUARANTOR, etc.
  status        String   @default("PENDING") // PENDING, INVITED, COMPLETED, FILLED_BY_PRIMARY
  invitationToken String? @unique
  filledByPrimary Boolean @default(false)
  consentGiven   Boolean @default(false)
  completedAt    DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  application    Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  user          User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  userId        String?
  
  @@map("co_applicants")
}

model Application {
  // ... champs existants ...
  coApplicants  CoApplicant[]
  primaryTenantId String // ID du locataire principal (peut être différent de tenantId si on veut distinguer)
}
```

### Flux utilisateur proposé

1. **Création de l'application**
   - Le locataire principal remplit ses informations
   - Section "Co-applicants" apparaît

2. **Ajout de co-applicants**
   - Le locataire principal clique sur "Ajouter un co-applicant"
   - Formulaire : Nom, Email (optionnel), Relation (conjoint, colocataire, garant, etc.)
   - Deux options :
     - **"Envoyer une invitation"** (par défaut) : L'invitation est envoyée, la personne remplit ses infos
     - **"Je remplirai les informations"** : Case à cocher avec consentement explicite

3. **Si invitation envoyée**
   - Email avec lien unique
   - La personne crée un compte (ou se connecte si elle en a déjà un)
   - Remplit ses informations
   - Statut passe à "COMPLETED"

4. **Si rempli par le principal**
   - Le locataire principal remplit toutes les infos du co-applicant
   - Un email est quand même envoyé au co-applicant pour :
     - Vérifier les informations
     - Donner son consentement
     - Créer un compte s'il le souhaite
   - Statut passe à "FILLED_BY_PRIMARY" puis "VERIFIED" après validation

5. **Suivi de l'application**
   - Le locataire principal voit l'avancement de tous les co-applicants
   - Indicateurs visuels : ✅ Complété, ⏳ En attente, 📧 Invitation envoyée

### Interface proposée

```
┌─────────────────────────────────────────┐
│ Application - [Nom du logement]         │
├─────────────────────────────────────────┤
│                                         │
│ Locataire principal                    │
│ ✅ Complété                            │
│                                         │
│ Co-applicants                          │
│ ┌───────────────────────────────────┐  │
│ │ 👤 Marie Dupont                  │  │
│ │ 📧 marie@example.com             │  │
│ │ ⏳ En attente de réponse          │  │
│ │ [Renvoyer l'invitation]          │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ 👤 Jean Martin                    │  │
│ │ ✅ Complété                       │  │
│ └───────────────────────────────────┘  │
│                                         │
│ [+ Ajouter un co-applicant]            │
│                                         │
└─────────────────────────────────────────┘
```

## Questions à considérer

1. **Consentement RGPD** : Doit-on exiger un consentement explicite pour que le principal remplisse les infos des autres ?
   - **Réponse recommandée : OUI** - Case à cocher obligatoire avec texte explicite

2. **Validation** : Les co-applicants doivent-ils valider les infos remplies par le principal ?
   - **Réponse recommandée : OUI** - Email avec lien de validation

3. **Comptes multiples** : Un co-applicant peut-il avoir plusieurs applications en cours ?
   - **Réponse recommandée : OUI** - Chaque application est indépendante

4. **Garants** : Doit-on distinguer les co-locataires des garants ?
   - **Réponse recommandée : OUI** - Champ "role" dans CoApplicant

## Prochaines étapes

1. ✅ Valider l'approche avec l'utilisateur
2. ⏳ Créer le modèle `CoApplicant` dans Prisma
3. ⏳ Créer l'API pour gérer les co-applicants
4. ⏳ Créer l'interface pour ajouter/gérer les co-applicants
5. ⏳ Créer le système d'invitations pour les co-applicants
6. ⏳ Créer la page de remplissage pour les co-applicants
7. ⏳ Ajouter la validation/consentement

