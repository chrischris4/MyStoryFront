# Guide de Publication - Flun (Google Play Store)

## Vue d'ensemble

Ce document récapitule toutes les étapes pour publier Flun sur le Google Play Store avec les achats in-app (jetons et abonnements).

---

## 1. Prérequis

### Comptes nécessaires
- [ ] **Compte Google Play Console** - 25$ une fois
  - https://play.google.com/console/
  - Créer un compte développeur
  - Vérification d'identité (peut prendre quelques jours)

- [ ] **Compte Expo/EAS** - Gratuit
  - https://expo.dev/
  - `npx eas-cli login`

### Backend
- [ ] Backend déployé en production (pas localhost)
- [ ] Base de données en production
- [ ] Variables d'environnement configurées

---

## 2. Configuration des Achats In-App (Google Play)

### 2.1 Créer l'application sur Google Play Console

1. Aller sur https://play.google.com/console/
2. Créer une nouvelle application
3. Remplir les informations de base :
   - Nom : Flun
   - Langue par défaut : Français
   - Type : Application
   - Gratuit / Payant : Gratuit (avec achats in-app)

### 2.2 Créer les produits In-App (Jetons)

Dans Google Play Console > Monétisation > Produits intégrés à l'application :

| Product ID | Nom | Prix | Type |
|------------|-----|------|------|
| `tokens_pack_5` | 5 Jetons | 4,99 € | Consommable |
| `tokens_pack_10` | 10 Jetons | 9,99 € | Consommable |
| `tokens_pack_20` | 20 Jetons | 18,99 € | Consommable |

**Pour chaque produit :**
1. Cliquer "Créer un produit"
2. ID du produit : `tokens_pack_5` (doit correspondre au code)
3. Nom : "5 Jetons"
4. Description : "Pack de 5 jetons pour créer des histoires"
5. Prix : Définir le prix
6. Statut : Actif

### 2.3 Créer les abonnements

Dans Google Play Console > Monétisation > Abonnements :

| Product ID | Nom | Prix mensuel | Prix annuel |
|------------|-----|--------------|-------------|
| `explorer_monthly` | Explorateur Mensuel | 4,99 € | - |
| `explorer_yearly` | Explorateur Annuel | - | 49,99 € |
| `adventurer_monthly` | Aventurier Mensuel | 14,99 € | - |
| `adventurer_yearly` | Aventurier Annuel | - | 149,99 € |
| `legend_monthly` | Légende Mensuel | 19,99 € | - |
| `legend_yearly` | Légende Annuel | - | 199,99 € |

**Pour chaque abonnement :**
1. Créer un abonnement de base (ex: "Explorateur")
2. Ajouter les offres (mensuel, annuel)
3. Configurer les avantages
4. Activer

### 2.4 Configurer l'API Google Play pour le Backend

Pour valider les achats côté serveur :

1. **Créer un Service Account dans Google Cloud Console**
   - Aller sur https://console.cloud.google.com/
   - Créer un projet ou utiliser celui existant
   - APIs & Services > Credentials > Create Service Account
   - Télécharger le fichier JSON

2. **Lier le Service Account à Google Play Console**
   - Google Play Console > Paramètres > Accès API
   - Lier le projet Google Cloud
   - Ajouter le Service Account avec permissions "Gérer les commandes"

3. **Configurer le Backend**
   ```env
   GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=./google-service-account.json
   ```

---

## 3. Configuration Backend

### 3.1 Endpoints nécessaires

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/products` | GET | Liste des packs de jetons |
| `/products/verify-purchase` | POST | Valider un achat de jetons |
| `/subscriptions/plans` | GET | Liste des plans d'abonnement |
| `/subscriptions/verify-purchase` | POST | Valider un abonnement |

### 3.2 Variables d'environnement Backend

```env
# Google Play Billing
GOOGLE_PLAY_PACKAGE_NAME=com.flun.app
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=./google-service-account.json

# Base de données
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=...
```

### 3.3 Validation des achats (important!)

Le backend DOIT valider chaque achat avec l'API Google Play pour éviter la fraude :

```typescript
// Exemple de validation Google Play
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: './google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/androidpublisher'],
});

const androidPublisher = google.androidpublisher({ version: 'v3', auth });

// Pour les produits (jetons)
const response = await androidPublisher.purchases.products.get({
  packageName: 'com.flun.app',
  productId: 'tokens_pack_5',
  token: purchaseToken,
});

// Pour les abonnements
const response = await androidPublisher.purchases.subscriptions.get({
  packageName: 'com.flun.app',
  subscriptionId: 'explorer_monthly',
  token: purchaseToken,
});
```

---

## 4. Configuration Frontend

### 4.1 app.json

```json
{
  "expo": {
    "name": "Flun",
    "slug": "flun",
    "android": {
      "package": "com.flun.app",
      "versionCode": 1,
      "permissions": [
        "com.android.vending.BILLING"
      ]
    }
  }
}
```

### 4.2 Hooks créés

- `useIAP.ts` - Initialisation et gestion IAP
- `usePurchaseProduct.ts` - Achat de jetons
- `usePurchaseSubscription.ts` - Achat d'abonnements
- `useProducts.ts` - Liste des produits
- `useSubscriptionPlans.ts` - Liste des plans

### 4.3 Package name

Le `package` dans app.json DOIT correspondre à celui de Google Play Console :
```
com.flun.app
```

---

## 5. Build et Test

### 5.1 Build de développement (APK)

```bash
npx eas build --platform android --profile preview
```

### 5.2 Tester les achats (Sandbox)

1. Ajouter des testeurs dans Google Play Console :
   - Paramètres > Gestion des licences
   - Ajouter les emails des testeurs

2. Publier l'app en "Test interne" (pas en production)

3. Les testeurs peuvent faire des achats sans être débités

### 5.3 Build de production (AAB)

```bash
npx eas build --platform android --profile production
```

---

## 6. Publication

### 6.1 Checklist avant publication

**Assets :**
- [ ] Icône 1024x1024 (icon.png)
- [ ] Icône adaptative 1024x1024 (adaptive-icon.png)
- [ ] Splash screen (splash.png)
- [ ] Screenshots (min 2, recommandé 8)
  - Téléphone : 1080x1920 ou 1440x2560
- [ ] Feature graphic : 1024x500
- [ ] Vidéo promo (optionnel)

**Textes :**
- [ ] Titre : Flun (max 30 caractères)
- [ ] Description courte (max 80 caractères)
- [ ] Description longue (max 4000 caractères)
- [ ] Notes de mise à jour

**Légal :**
- [ ] Politique de confidentialité (URL obligatoire)
- [ ] Conditions d'utilisation
- [ ] Déclaration sur les achats in-app

**Catégorie :**
- [ ] Catégorie : Éducation > Créativité des enfants (ou similaire)
- [ ] Classification du contenu (questionnaire à remplir)

### 6.2 Soumettre

```bash
npx eas submit --platform android
```

Ou manuellement :
1. Télécharger l'AAB depuis EAS
2. L'uploader dans Google Play Console > Version de production
3. Remplir toutes les informations
4. Soumettre pour examen

### 6.3 Délai d'examen

- Première soumission : 3-7 jours
- Mises à jour : 1-3 jours

---

## 7. Post-publication

### 7.1 Webhooks Google Play (optionnel mais recommandé)

Pour gérer les événements (renouvellement, annulation, remboursement) :

1. Configurer un endpoint webhook côté backend
2. Configurer Cloud Pub/Sub dans Google Cloud
3. Lier à Google Play Console

### 7.2 Monitoring

- Suivre les revenus dans Google Play Console
- Monitorer les erreurs d'achat dans ton backend
- Configurer des alertes

---

## 8. Ressources

- [Documentation Expo IAP](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)
- [Google Play Billing](https://developer.android.com/google/play/billing)
- [react-native-iap](https://react-native-iap.dooboolab.com/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

## Notes importantes

1. **Ne JAMAIS faire confiance au client** - Toujours valider les achats côté serveur
2. **Tester en sandbox** avant de publier en production
3. **Garder les Product IDs cohérents** entre le code et Google Play Console
4. **Les prix peuvent varier** selon les pays (Google gère ça automatiquement)
5. **Les abonnements se renouvellent automatiquement** - Gérer les annulations

---

*Dernière mise à jour : Janvier 2025*
