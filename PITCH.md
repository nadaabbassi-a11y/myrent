# MyRent — Pitch investisseur

**Durée cible :** 10 minutes · 10 slides  
**Version :** 1.1 · Septembre 2026  
**Fondatrice :** Nada Abbassi  
**Contact :** nadaabbassi.0012@gmail.com  
**GitHub :** [github.com/nadaabbassi-a11y/myrent](https://github.com/nadaabbassi-a11y/myrent)  
**Deck slides :** [`PITCH_SLIDES.md`](PITCH_SLIDES.md)

---

## Slide 1 — Titre

# MyRent
### La plateforme québécoise qui gère vos locations de A à Z

**Publier → Paperasse → Loyers**

*Une annonce. Un pipeline. Un bail. Des loyers.*

---

## Slide 2 — Le problème

### Les propriétaires québécois perdent temps et argent à chaque location

| Aujourd'hui | Conséquence |
|-------------|-------------|
| 5–7 plateformes à gérer manuellement | 3 h perdues par annonce |
| Messages éparpillés (FB, Kijiji, SMS) | Leads manqués |
| Baux Word + signatures papier | Risque légal, lenteur |
| Loyers par Interac sans suivi | Retards, conflits |

**Résultat :** 1 à 3 mois de vacance = **1 500 à 4 500 $ perdus** par turnover.

> *« Je passe plus de temps à gérer mes annonces qu'à gérer mes locataires. »*  
> — Propriétaire 3 logements, Montréal

---

## Slide 3 — La solution

### MyRent = 3 produits en 1 pour le propriétaire québécois

```
   ANNONCES              PAPERASSE              GESTION
   ─────────             ─────────              ───────
   Publier partout       Candidatures           Loyers Stripe
   Kijiji, FB, LesPAC…   Crédit + bail TAL      Communications
   Leads centralisés     E-signature            Dépenses
```

**Pipeline visuel unique :** le proprio voit en un coup d'œil où en est chaque logement.

```
Annonce → Leads → Candidature → Bail → Loyer
```

**Déjà construit :** MVP fonctionnel avec bail TAL, Stripe, e-signature, syndication 6 plateformes.

---

## Slide 4 — Produit (demo)

### Ce qui existe aujourd'hui

| Module | État | Différenciateur |
|--------|------|-----------------|
| Publier partout | ✅ Live | 6 plateformes QC, copie auto |
| Pipeline visuel | ✅ Live | Aucun concurrent local |
| Candidature CORPIQ | ✅ Live | 8 étapes conformes |
| Bail TAL + e-signature | ✅ Live | PDF immutable + audit |
| Paiements Stripe | ✅ Live | Dépôt + mensuel |
| Navigation 3 piliers | ✅ Live | UX simplifiée |

**Site :** [myrent.ca](https://myrent.ca)  
**Demo live :** [myrent.ca/landlord/pipeline](https://myrent.ca/landlord/pipeline) *(staging : [myrent-ca.vercel.app](https://myrent-ca.vercel.app))*  
**Codebase :** 95 commits · 81 routes API · 60 pages · ~43 K lignes TypeScript

---

## Slide 5 — Marché

### Un marché de niche sous-servi au Québec

| | Taille | Notes |
|---|--------|-------|
| **TAM** | ~500 K proprios locatifs QC | Statistique Canada |
| **SAM** | ~150 K (1–10 logements) | Cible MyRent |
| **SAM $** | **54 M$/an** | 150 K × 30 $/mois |
| **SOM (3 ans)** | 5 000 proprios | Montréal + Québec |

**Pourquoi le Québec d'abord :**
- Bail TAL unique — barrière à l'entrée pour compétiteurs US
- Forte culture petites annonces (Kijiji, LesPAC, FB)
- 80 % des locations gérées sans agence

**Expansion :** Ontario (2028), Alberta (2029) — templates baux provinciaux.

---

## Slide 6 — Business model

### SaaS + transactions

| Revenu | Modèle | Marge |
|--------|--------|-------|
| Abonnement proprio | 19–89 $/mois | 85 % |
| Vérification crédit | 15 $/dossier | 60 % |
| Frais paiement | % GMV loyers | Pass-through + marge |

**Grille :**

| Gratuit | Essentiel 19 $ | Pro 39 $ | Portfolio 89 $ |
|---------|----------------|----------|----------------|
| 1 annonce | 3 annonces + syndication | Illimité + crédit | Multi-users + rapports |

**Unit economics cible (M12) :**
- CAC : 50 $ (organique + CORPIQ)
- LTV : 360 $ (12 mois × 30 $)
- **LTV/CAC : 7×**

---

## Slide 7 — Traction & roadmap

### Où nous en sommes

| Métrique | Aujourd'hui | M6 | M12 |
|----------|-------------|-----|-----|
| Proprios inscrits | **Pre-lancement** | 100 | 500 |
| Baux signés / mois | 0 | 5 | 30 |
| MRR | **0 $ (pre-revenue)** | 375 $ | 2 250 $ |
| MVP fonctionnel | **~90 %** | 100 % | + crédit auto |
| Commits / API / pages | 95 / 81 / 60 | — | — |

**Roadmap :**
- **Q4 2026** — Beta 10 proprios, prod stable
- **Q1 2027** — Crédit auto, dépenses, billing
- **Q3 2027** — 1 000 proprios, MRR 25 K$
- **2028** — Ontario, break-even

---

## Slide 8 — Concurrence

| | Kijiji | RentSpree (US) | Buildium | **MyRent** |
|---|--------|----------------|----------|------------|
| Marché Québec | ✅ | ❌ | ❌ | ✅ |
| Syndication multi | ❌ | ❌ | ❌ | ✅ |
| Bail TAL | ❌ | ❌ | ⚠️ | ✅ |
| Pipeline visuel | ❌ | ⚠️ | ⚠️ | ✅ |
| FR natif | ✅ | ❌ | ❌ | ✅ |
| Prix accessible | ✅ | $ | $$$ | ✅ |

**Moat :**
1. Conformité TAL native
2. Intégration plateformes québécoises
3. Pipeline proprio-first (pas portail locataire)
4. Données proprio (historique baux, paiements)

---

## Slide 9 — Équipe & ask

### Équipe

| Rôle | Profil |
|------|--------|
| **Nada Abbassi** — Fondatrice & CEO | Produit, design, développement full-stack. MVP livré seule (Next.js 14, Prisma, Stripe, bail TAL). |
| Tech | 95 commits · 81 API routes · architecture 3 piliers + pipeline |
| Conseillers | CORPIQ, juriste TAL *(recrutement Phase 2)* |

### The Ask

**Levée seed : 500 K $ – 750 K $**

| Utilisation | % |
|-------------|---|
| Produit (Phase 2 auto + mobile) | 40 % |
| Acquisition proprios (CORPIQ, SEO, ads) | 30 % |
| Opérations + support FR | 15 % |
| Légal / conformité TAL | 15 % |

**Runway :** 18 mois → 1 000 proprios payants, MRR 25 K$

---

## Slide 10 — Vision

### Devenir le système d'exploitation des propriétaires québécois

**2026** — Simplifier la location pour 1 000 proprios  
**2027** — Standard de facto au Québec (bail + paiement)  
**2028** — Expansion Canada + API gestionnaires  
**2030** — 50 000 proprios · 10 M$ ARR

> *« Un propriétaire ne devrait jamais republier la même annonce deux fois manuellement. »*

**MyRent** — [myrent.ca](https://myrent.ca) · [nadaabbassi.0012@gmail.com](mailto:nadaabbassi.0012@gmail.com)

---

## Appendix — FAQ investisseurs

**Q : Pourquoi pas Kijiji ?**  
R : Kijiji = annonce. MyRent = cycle complet. Partenaire potentiel, pas concurrent.

**Q : Chicken-and-egg locataires ?**  
R : Les locataires viennent de Kijiji/FB via lien MyRent. Pas besoin de masse locataire initiale.

**Q : Réglementation TAL ?**  
R : Templates validés, audit logs, PDF immutable. Consultation juridique prévue Phase 2.

**Q : Revenus sans abonnement au début ?**  
R : Gratuit pour traction → conversion Essentiel post-bail signé (moment de valeur max).

**Q : Sortie ?**  
R : Acquisition par PropTech (Altus, Brookfield) ou expansion bootstrap → Series A 2028.
