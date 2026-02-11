# Bot Facebook Marketplace - Intégration MyRent

## 🎯 Objectif
Créer un bot qui :
1. Surveille les messages Facebook Marketplace pour une annonce
2. Envoie automatiquement un message avec un lien vers la page MyRent
3. Permet aux intéressés de prendre rendez-vous directement sur MyRent

## ⚠️ Limitations et Contraintes

### 1. API Facebook Graph API
- **Facebook Messenger API** : Nécessite une application approuvée par Facebook
- **Permissions requises** : `pages_messaging`, `pages_read_engagement`
- **App Review** : Facebook doit approuver votre application (processus long et strict)
- **Limitations** : 
  - Pas d'accès direct aux messages Marketplace via l'API officielle
  - Marketplace utilise un système de messagerie séparé
  - Restrictions sur l'automatisation des messages

### 2. Alternatives Possibles

#### Option A : Webhook + Facebook Messenger (Recommandé)
- Utiliser Facebook Messenger pour les conversations
- Créer une page Facebook business
- Utiliser les webhooks pour recevoir les messages
- Répondre automatiquement avec un lien MyRent

#### Option B : Intégration manuelle avec lien personnalisé (✅ Implémenté)
- ✅ Configuration du message automatique par listing dans MyRent
- ✅ Utilisation des réponses automatiques via Facebook Business Suite
- ✅ Chaque listing peut avoir son propre message avec son propre lien MyRent
- 📖 **Guide détaillé** : Voir [GUIDE_FACEBOOK_BUSINESS_SUITE.md](./GUIDE_FACEBOOK_BUSINESS_SUITE.md)

#### Option C : Bot externe (Zapier, Make.com)
- Utiliser des outils d'automatisation tiers
- Connecter Facebook Messenger à MyRent via webhooks
- Moins de contrôle mais plus simple à mettre en place

## 🛠️ Implémentation Technique

### Architecture Proposée

```
Facebook Marketplace
    ↓ (Message reçu)
Facebook Messenger Webhook
    ↓ (Webhook reçu)
API MyRent (/api/webhooks/facebook)
    ↓ (Traitement)
Envoi message automatique avec lien MyRent
    ↓
Redirection vers /listings/[id]?source=marketplace
```

### Étapes d'Implémentation

1. **Créer une application Facebook**
   - Aller sur developers.facebook.com
   - Créer une nouvelle application
   - Configurer Messenger comme produit

2. **Configurer les webhooks**
   - Endpoint : `https://votre-domaine.com/api/webhooks/facebook`
   - Vérifier le token avec Facebook
   - S'abonner aux événements `messages`, `messaging_postbacks`

3. **Créer l'API webhook dans MyRent**
   - Route : `/api/webhooks/facebook`
   - Recevoir les messages
   - Détecter les messages liés à une annonce
   - Envoyer une réponse automatique

4. **Lier Marketplace à MyRent**
   - Ajouter un champ `marketplaceUrl` ou `marketplaceId` au modèle `Listing`
   - Créer une interface pour lier une annonce Marketplace à un listing MyRent

## 📋 Structure de Données Implémentée

### Schéma Prisma

```prisma
model LandlordProfile {
  // ... champs existants
  marketplaceBotEnabled   Boolean   @default(false)  // Activer le bot
  marketplaceAutoMessage  String?   // Message de réponse automatique
}

model Listing {
  // ... champs existants
  marketplaceUrl      String?  // URL de l'annonce Marketplace
  marketplaceId       String?  // ID de l'annonce Marketplace
}
```

### Configuration

Chaque propriétaire peut maintenant :
1. **Activer le bot** dans son profil (`/landlord/profile`)
2. **Configurer le message automatique** avec le placeholder `[LIEN]`
3. **Lier ses annonces Marketplace** à ses listings MyRent (via `marketplaceUrl` et `marketplaceId`)

## 🔧 Code d'Exemple

### API Webhook Facebook

```typescript
// app/api/webhooks/facebook/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Vérifier le token Facebook
  if (body.object === 'page') {
    body.entry.forEach((entry: any) => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;
      const message = webhookEvent.message;
      
      if (message && message.text) {
        // Trouver le listing associé
        // Envoyer la réponse automatique avec lien MyRent
        sendAutoReply(senderId, listingId);
      }
    });
  }
  
  return NextResponse.json({ status: 'ok' });
}
```

## ⚡ Solution Alternative Plus Simple

### Utiliser des Réponses Automatiques Facebook Business Suite
1. Activer les réponses automatiques dans Facebook Business Suite
2. Configurer un message avec le lien MyRent
3. Le message sera envoyé automatiquement aux nouveaux contacts

### Avantages :
- ✅ Pas besoin d'API complexe
- ✅ Configuration simple
- ✅ Conforme aux politiques Facebook
- ✅ Gratuit

### Inconvénients :
- ❌ Moins de personnalisation
- ❌ Pas de suivi automatique
- ❌ Message générique

## 🚀 Recommandation

Pour commencer rapidement, je recommande :

1. **Phase 1** : Ajouter un champ `marketplaceUrl` aux listings
2. **Phase 2** : Créer une interface pour lier Marketplace à MyRent
3. **Phase 3** : Utiliser les réponses automatiques Facebook Business Suite
4. **Phase 4** (optionnel) : Implémenter un webhook Facebook si besoin de plus de contrôle

Souhaitez-vous que je commence par implémenter la Phase 1 et 2 ?

