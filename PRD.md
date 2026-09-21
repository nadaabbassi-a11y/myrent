# MyRent — Document produit (PRD)

**Version :** 1.2  
**Date :** 21 septembre 2026  
**Statut :** Vision figée — référence pour le développement  
**Fondatrice :** Nada Abbassi · nadaabbassi.0012@gmail.com  
**Documents liés :** [`PITCH.md`](PITCH.md) · [`PITCH_SLIDES.md`](PITCH_SLIDES.md) · [`ONE_PAGER.md`](ONE_PAGER.md)

---

## 1. Résumé exécutif

**MyRent** est une plateforme québécoise de gestion locative **centrée sur le propriétaire**. Elle couvre le cycle complet d'une location :

> **Publier → Paperasse → Gérer le loyer**

L'objectif n'est pas d'être un portail locataire généraliste, mais un **hub opérationnel** pour les propriétaires qui veulent :

1. Diffuser leurs annonces sur les plateformes québécoises et centraliser les leads
2. Gérer la paperasse légale (candidature, crédit, bail TAL)
3. Encaisser les loyers et suivre la relation locataire au quotidien

**Promesse produit :** *Une annonce, un pipeline, un bail, des loyers — sans friction.*

**Différenciateur :** Seule plateforme québécoise qui unifie **syndication locale + bail TAL + encaissement** dans un pipeline visuel unique.

---

## 2. Problème

Les propriétaires québécois jonglent aujourd'hui entre :

| Douleur | Réalité actuelle | Coût estimé |
|---------|------------------|-------------|
| Diffusion | Republier manuellement sur 5–7 plateformes | 2–4 h / annonce |
| Leads | Messages éparpillés (FB, Kijiji, SMS, courriel) | Leads perdus |
| Paperasse | Candidatures par courriel, baux Word, signatures papier | 5–10 h / location |
| Loyers | Virements Interac, chèques, aucun suivi | Retards, litiges |
| Vacance | Délai moyen entre locataires | 1–3 mois de loyer perdu |

Les outils existants sont soit **trop généralistes** (portails locataires type Kijiji), soit **trop fragmentés** (un outil par tâche), soit **réservés aux gestionnaires professionnels** (Buildium, Yardi).

---

## 3. Vision produit

### 3.1 Positionnement

MyRent = **3 produits en 1**, accessibles via une navigation simple :

```
┌─────────────────────────────────────────────────────────────┐
│  ANNONCES          PAPERASSE           GESTION              │
│  (Advertise)       (Paperwork)         (Rent Management)    │
├─────────────────────────────────────────────────────────────┤
│  Publier partout   Candidatures        Loyers               │
│  Leads & RDV       Crédit & bail       Communications       │
│  Messages          Signatures          Dépenses             │
└─────────────────────────────────────────────────────────────┘
```

**Comparaison concurrentielle :**

| Capacité | Kijiji / FB | RentSpree | Buildium | **MyRent** |
|----------|-------------|-----------|----------|------------|
| Annonces Québec | ✅ | ❌ | ❌ | ✅ |
| Syndication multi-plateformes | ❌ | ❌ | ❌ | ✅ |
| Bail TAL québécois | ❌ | ❌ | ⚠️ | ✅ |
| Pipeline visuel | ❌ | ⚠️ | ⚠️ | ✅ |
| Paiements Stripe CAD | ❌ | ✅ | ✅ | ✅ |
| FR natif | ✅ | ❌ | ❌ | ✅ |

### 3.2 Utilisateur principal

| Persona | Priorité | Profil | Besoin |
|---------|----------|--------|--------|
| **Marie, proprio 1–2 logements** | P0 | 35–55 ans, Montréal | Simplicité, pas d'agence |
| **Jean, proprio 3–10 logements** | P1 | Semi-pro, Québec | Pipeline, vue portfolio |
| **Sophie, locataire** | P2 | Cherche logement | Postuler, signer, payer — vite |

> **Principe :** L'expérience propriétaire est le cœur du produit. L'expérience locataire sert le flux propriétaire, pas l'inverse.

### 3.3 Fil conducteur — le Pipeline

Chaque annonce suit un parcours linéaire visible :

```
Annonce publiée → Leads → Candidature → Bail signé → Loyer encaissé
      📢            👥         📋            ✍️            💰
```

Le propriétaire voit **où en est chaque logement** en un coup d'œil, sans naviguer entre 6 sections disjointes.

---

## 4. Les trois piliers

### Pilier 1 — Annonces (Advertise)

**Objectif :** Publier une fois, être visible partout, ne manquer aucun lead.

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Création d'annonce | Formulaire riche (photos, carte, équipements) | ✅ Implémenté |
| Catalogue public MyRent | Page `/listings` | ✅ Implémenté |
| **Publier partout** | Hub syndication plateformes québécoises | ✅ V1 (manuel) |
| Copie auto du texte d'annonce | Génération FR + lien MyRent | ✅ Implémenté |
| Suivi syndication par plateforme | Marquer publié + URL externe | ✅ Implémenté |
| Syndication API automatique | Push vers Kijiji, Facebook, etc. | 🔲 V2 |
| Calendrier de visites | Créneaux, réservation en ligne | ✅ Implémenté |
| Demandes de visite | Acceptation / refus | ✅ Implémenté |
| Messagerie pré-location | Fil par annonce / candidat | ✅ Implémenté |
| Facebook Marketplace | Lien + message auto Business Suite | ✅ Partiel |
| Bot Facebook webhook | Réponses automatiques via API | 🔲 V2 |

**Plateformes cibles (Québec) :**

| Plateforme | V1 (manuel) | V2 (API) |
|------------|-------------|----------|
| Facebook Marketplace | ✅ | 🔲 |
| Kijiji | ✅ | 🔲 |
| LesPAC | ✅ | 🔲 |
| DuProprio | ✅ | 🔲 |
| Kangalou | ✅ | 🔲 |
| LogisQuébec | ✅ | 🔲 |
| Centris | Info (courtiers) | — |

---

### Pilier 2 — Paperasse (Paperwork)

**Objectif :** De la candidature au bail signé, conforme au TAL québécois.

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Candidature en ligne | Wizard 8 étapes (CORPIQ) | ✅ Implémenté |
| Co-applicants / garants | Invitations par token | ✅ Implémenté |
| Consentements légaux | Crédit, références, partage données | ✅ Implémenté |
| Examen propriétaire | Accepter / refuser candidature | ✅ Implémenté |
| Vérification de crédit | Collecte consentement | ✅ Implémenté |
| Pull crédit automatique | Equifax / CORPIQ API | 🔲 V2 |
| Bail TAL québécois | Génération, sections JSON | ✅ Implémenté |
| Signature électronique | Locataire + propriétaire | ✅ Implémenté |
| PDF immutable + audit log | Traçabilité légale | ✅ Implémenté |
| Annexes | Paiement, crédit, comms électroniques | ✅ Implémenté |
| Entrée flexible | Candidature directe, bail manuel | ✅ Implémenté |

---

### Pilier 3 — Gestion (Rent Management)

**Objectif :** Encaisser les loyers et gérer la relation locataire post-bail.

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Tableau de bord loyers | Vue par bail actif | ✅ Implémenté |
| Paiements Stripe | Dépôt + loyers mensuels | ✅ Implémenté |
| Webhooks + reçus PDF | Confirmation automatique | ✅ Implémenté |
| Setup carte récurrente | Abonnement locataire | ⚠️ Partiel |
| Messagerie locataire | Fil par bail | ✅ Implémenté |
| **Module dépenses** | Réparations, taxes, assurances | 🔲 V2 |
| Rappels de paiement auto | Email / notification | 🔲 V2 |
| Vue comptable mensuelle | Revenus − dépenses = net | 🔲 V2 |

---

## 5. Architecture de navigation

### 5.1 Navigation propriétaire (3 onglets)

```
[ Annonces ]  [ Paperasse ]  [ Gestion ]
```

| Onglet | Hub | Sous-pages |
|--------|-----|------------|
| **Annonces** | `/landlord/advertise` | Pipeline, Publier partout, Mes annonces, Messages, Visites, RDV, Disponibilités |
| **Paperasse** | `/landlord/paperwork` | Candidatures, Baux, Actions rapides |
| **Gestion** | `/landlord/management` | Suivi loyers, Communications, Dépenses |

### 5.2 Pages transversales

| Page | URL | Rôle |
|------|-----|------|
| Pipeline | `/landlord/pipeline` | Vue d'ensemble annonce → loyer |
| Publier partout | `/landlord/publish` | Syndication multi-plateformes |
| Profil | `/landlord/profile` | Config propriétaire, Facebook |

---

## 6. Parcours utilisateur type

### 6.1 Propriétaire — nouvelle location

```
1. Créer une annonce                    [Annonces]
2. Publier sur Kijiji + Facebook        [Publier partout]
3. Recevoir messages & demandes visite  [Annonces → Messages / Visites]
4. Confirmer un RDV                     [Annonces → RDV]
5. Recevoir candidature                 [Paperasse → Candidatures]
6. Accepter + générer bail              [Paperasse → Baux]
7. Signatures électroniques             [Paperasse → Bail]
8. Locataire paie dépôt + loyer         [Gestion → Loyers]
9. Suivi mensuel                        [Gestion]
```

---

## 7. Métriques de succès

### 7.1 North Star

> **Nombre de baux signés via MyRent par mois**

### 7.2 Métriques par pilier

| Pilier | Métrique clé | Cible V1 | Cible V2 |
|--------|--------------|----------|----------|
| Annonces | Annonces syndiquées (≥1 plateforme) | 80 % | 95 % |
| Annonces | Leads / annonce | ≥ 3 | ≥ 5 |
| Paperasse | Taux candidature → bail | ≥ 20 % | ≥ 30 % |
| Paperasse | Délai candidature → bail | < 14 j | < 10 j |
| Gestion | Loyers via Stripe | ≥ 70 % | ≥ 85 % |
| Gestion | Rétention proprio M3 | ≥ 60 % | ≥ 75 % |

---

## 8. Roadmap détaillée

### Phase 0 — MVP technique ✅ (complété)

| Livrable | Statut |
|----------|--------|
| Auth proprio / locataire | ✅ |
| CRUD annonces + photos | ✅ |
| Wizard candidature 8 étapes | ✅ |
| Bail TAL + e-signature + PDF | ✅ |
| Paiements Stripe (dépôt + mensuel) | ✅ |
| Messagerie + visites + RDV | ✅ |

### Phase 1 — Vision produit ✅ (en cours, Q4 2026)

| Livrable | Priorité | Statut | Critère de done |
|----------|----------|--------|-----------------|
| Navigation 3 piliers | P0 | ✅ | Onglets visibles sur toutes pages proprio |
| Pages hub | P0 | ✅ | 3 hubs + sous-liens |
| Publier partout | P0 | ✅ | 6 plateformes + copie auto + suivi |
| Pipeline visuel | P0 | ✅ | 5 étapes cliquables par annonce |
| Messagerie proprio | P0 | ✅ | Page `/landlord/messages` |
| Migration DB syndication | P0 | 🔲 | `listing_syndications` en prod |
| Onboarding proprio guidé | P1 | 🔲 | 5 étapes first-run |
| Tests E2E parcours complet | P1 | 🔲 | Annonce → bail → paiement |
| Landing page alignée 3 piliers | P2 | 🔲 | Homepage = message proprio |

**Traction actuelle (sept. 2026) :**
- MVP ~90 % fonctionnel · 95 commits · 81 routes API · 60 pages · ~43 K lignes TS
- Pre-revenue · beta privée 10 proprios ciblée Q4 2026
- Repo : [github.com/nadaabbassi-a11y/myrent](https://github.com/nadaabbassi-a11y/myrent)

**Jalons Phase 1 :**
- **Nov 2026** — Prod stable, 10 proprios beta
- **Déc 2026** — 50 annonces actives, 5 baux signés via plateforme

### Phase 2 — Automatisation & rétention (Q1–Q2 2027)

| Livrable | Priorité | Impact business |
|----------|----------|-----------------|
| Pull crédit Equifax / CORPIQ | P0 | Réduction fraude, confiance proprio |
| Rappels paiement auto | P0 | Réduction impayés, rétention |
| Module dépenses | P1 | Rétention multi-logements |
| Vue comptable mensuelle | P1 | Upsell tier Multi |
| Syndication API (Facebook, Kijiji) | P1 | Différenciateur vs concurrence |
| Bot Facebook webhook | P2 | Automatisation leads |
| Paiements récurrents Stripe complets | P1 | GMV ↑ |

**Jalons Phase 2 :**
- **Mar 2027** — 200 proprios actifs, MRR 5 000 $
- **Jun 2027** — 500 proprios, 50 baux/mois

### Phase 3 — Scale & monétisation (Q3 2027 – Q1 2028)

| Livrable | Priorité | Impact business |
|----------|----------|-----------------|
| Billing Stripe (freemium → Pro → Multi) | P0 | Revenus récurrents |
| Vue portfolio multi-logements | P1 | Upsell Multi |
| Rapports fiscaux T776 | P2 | Lock-in proprio |
| Intégration QuickBooks | P2 | Pro / Multi |
| App iOS (Capacitor) | P2 | Acquisition mobile |
| Partenariat CORPIQ / associations | P1 | Distribution |
| Expansion Ontario (bail provincial) | P3 | TAM × 3 |

**Jalons Phase 3 :**
- **Sep 2027** — 1 000 proprios, MRR 25 000 $
- **Dec 2027** — Break-even opérationnel

### Phase 4 — Plateforme (2028+)

- API ouverte pour gestionnaires
- Marketplace services (inspection, plomberie) — **seulement si demande utilisateurs**
- IA : rédaction annonce, scoring candidat
- Assurance locative intégrée (partenariat)

---

## 9. Hors scope — politique explicite

### 9.1 Jamais (sauf pivot majeur)

| Élément | Raison | Réévaluation |
|---------|--------|--------------|
| Portail locataire type « Zillow » | Locataire = secondaire, pas de SEO massif locataire | Non |
| Immobilier commercial / industriel | Complexité réglementaire différente | 2028+ |
| Centris / MLS integration | Réservé courtiers licenciés OACIQ | Non |
| Vente immobilière | Hors mission location | Non |
| Crypto / paiements alternatifs | Complexité sans demande | Non |

### 9.2 Pas maintenant (V2+)

| Élément | Raison | Quand |
|---------|--------|-------|
| Comptabilité complète | Buildium le fait déjà — focus pipeline | Phase 3 |
| Matterport / 3D / VR | Nice-to-have, faible impact conversion | Sur demande |
| Marketplace services | Distraction du core pipeline | Phase 4 si traction |
| Gestion copropriété | Segment différent | Non planifié |
| RH / paie employés immeuble | Hors scope résidentiel | Non |

### 9.3 Locataire — périmètre minimal volontaire

| Inclus | Exclu |
|--------|-------|
| Recherche + filtres basiques | Favoris avancés, alertes ML |
| Candidature wizard | « Dossier locataire portable » cross-plateforme |
| Signature + paiement | Social features, avis propriétaires |
| Messagerie avec proprio | Chat inter-locataires |

---

## 10. Modèle économique — détaillé

### 10.1 Sources de revenus

| Source | Type | Phase | Marge estimée |
|--------|------|-------|---------------|
| Abonnement proprio (SaaS) | Récurrent | Phase 3 | 85 % |
| Frais transaction paiement | % du loyer | Phase 1 | 0.5–1 % (Stripe take) |
| Commission syndication premium | Par annonce | Phase 2 | 90 % |
| Vérification crédit | Par dossier | Phase 2 | 60 % |
| Partenariats (assurance, CORPIQ) | Referral | Phase 3 | Variable |

### 10.2 Grille tarifaire proposée

| Tier | Prix/mois | Cible | Inclus | Limites |
|------|-----------|-------|--------|---------|
| **Gratuit** | 0 $ | Proprio 1 logement | 1 annonce active, paperasse complète, paiements | Pas de syndication, pas de pipeline |
| **Essentiel** | 19 $ | Proprio 1–2 logements | 3 annonces, Publier partout, Pipeline, Messages | Support courriel |
| **Pro** | 39 $ | Proprio 3–10 logements | Illimité, crédit (5/mois), rappels auto | — |
| **Portfolio** | 89 $ | 10+ logements | Multi-users, dépenses, rapports, API | Support prioritaire |

**Add-ons :**
- Vérification crédit : 15 $ / dossier
- Bail supplémentaire (tier Gratuit) : 25 $ / bail signé
- Syndication boost (mise en avant MyRent) : 9 $ / annonce / mois

### 10.3 Projections financières (hypothèses)

| Métrique | M6 | M12 | M24 |
|----------|-----|-----|-----|
| Proprios inscrits | 100 | 500 | 2 000 |
| Proprios payants (15 %) | 15 | 75 | 400 |
| ARPU | 25 $ | 30 $ | 35 $ |
| MRR | 375 $ | 2 250 $ | 14 000 $ |
| Baux signés / mois | 5 | 30 | 150 |
| GMV loyers / mois | 7 500 $ | 45 000 $ | 225 000 $ |

*Hypothèses conservatrices — loyer moyen 1 500 $/mois, 1 bail actif / 3 proprios.*

### 10.4 Validation pricing (à faire)

- [ ] 10 entretiens propriétaires (willingness to pay)
- [ ] Test A/B landing page pricing
- [ ] Beta gratuite 3 mois → conversion Essentiel
- [ ] Benchmark : DuProprio (~80 $/publication), Buildium (~58 $/mois USD)

---

## 11. Marché (TAM / SAM / SOM)

| Niveau | Définition | Estimation | Source / hypothèse |
|--------|------------|------------|-------------------|
| **TAM** | Propriétaires locatifs au Québec | ~500 000 | Statistique Canada, ménages locataires ÷ ratio |
| **SAM** | Proprios 1–10 logements, tech-friendly | ~150 000 | 30 % du TAM |
| **SOM** | Capture 3 ans (Montréal + Québec) | ~5 000 | 3 % du SAM |

**Marché adressable en dollars :** 150 000 × 30 $/mois = **54 M$/an** (SAM)

---

## 12. Risques & mitigations

| Risque | Prob. | Impact | Mitigation |
|--------|-------|--------|------------|
| Syndication manuelle = friction | Haute | Moyen | Copie auto, pipeline, V2 API |
| Concurrence US (RentSpree) | Moyenne | Moyen | Moat TAL + FR + plateformes QC |
| Adoption proprios 50+ | Moyenne | Moyen | UX simple, support téléphone Pro |
| Conformité TAL / Loi 16 | Faible | Élevé | Audit logs, PDF immutable ✅ |
| APIs plateformes fermées | Haute | Moyen | Workflow manuel robuste |
| Chicken-and-egg (locataires) | Moyenne | Élevé | Leads viennent de Kijiji/FB, pas de MyRent |
| Churn post-bail signé | Moyenne | Élevé | Module Gestion + dépenses = rétention |

---

## 13. Contraintes techniques

| Contrainte | Impact |
|------------|--------|
| Pas d'API publique Kijiji/LesPAC | Syndication V1 = manuel |
| Facebook Marketplace API limitée | Business Suite + webhook V2 |
| Bail TAL = template légal | PDF généré, clauses fixes |
| Stripe Canada | CAD, PCI délégué |
| Loi 25 (Québec) | Consentements, hébergement données |

**Stack :** Next.js 14 · Prisma · PostgreSQL · Stripe · JWT · i18n FR/EN · PWA

---

## 14. Glossaire

| Terme | Définition |
|-------|------------|
| **TAL** | Tribunal administratif du logement |
| **CORPIQ** | Corporation des propriétaires immobiliers du Québec |
| **Syndication** | Diffusion multi-plateformes |
| **Pipeline** | Progression annonce → loyer (5 étapes) |
| **GMV** | Volume brut de loyers transitant par la plateforme |
| **MRR** | Revenu récurrent mensuel (abonnements) |

---

## 15. Annexes

### A. Routes propriétaire

Voir [`ONE_PAGER.md`](ONE_PAGER.md) section Architecture.

### B. Modèles de données clés

```
Listing → VisitRequest / Appointment / MessageThread / ListingSyndication
Listing → Application → Lease → Payment
```

### C. Documents connexes

| Document | Contenu |
|----------|---------|
| [`PITCH.md`](PITCH.md) | Pitch investisseur (10 slides) |
| [`ONE_PAGER.md`](ONE_PAGER.md) | Résumé 1 page |
| `BOT_MARKETPLACE.md` | Stratégie Facebook |
| `ESIGNATURE_IMPLEMENTATION.md` | E-signature TAL |
| `GUIDE_PAIEMENT_LOYER.md` | Stripe |

---

*Ce document est la référence produit pour MyRent v1.1. Toute fonctionnalité doit se rattacher à un pilier et avancer le pipeline annonce → loyer.*
