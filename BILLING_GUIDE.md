# 📱 Guide Complet - Système de Paiements In-App

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Configuration App Store (iOS)](#configuration-app-store-ios)
3. [Configuration Google Play (Android)](#configuration-google-play-android)
4. [Backend - Validation des achats](#backend---validation-des-achats)
5. [Frontend - Intégration complète](#frontend---intégration-complète)
6. [Tests avant publication](#tests-avant-publication)
7. [Checklist de publication](#checklist-de-publication)

---

## 🎯 Vue d'ensemble

### Architecture actuelle
- ✅ Frontend : `react-native-iap` installé et configuré
- ✅ BillingScreen : Interface utilisateur fonctionnelle
- ⚠️ **MANQUANT** : Validation serveur des achats (CRITIQUE pour la sécurité)
- ⚠️ **MANQUANT** : Système de gestion des jetons côté backend

### Produits à configurer

| Product ID | Type | Plateforme | Prix | Description |
|------------|------|------------|------|-------------|
| `tokens_pack_100` | Consumable | iOS & Android | $9.99 | Pack de 10 jetons |
| `tokens_pack_500` | Consumable | iOS & Android | $18.99 | Pack de 20 jetons |
| `premium_monthly` | Auto-Renewable Subscription | iOS & Android | $14.99/mois | Abonnement Premium mensuel + 10 jetons/mois |
| `premium_yearly` | Auto-Renewable Subscription | iOS & Android | $149.99/an | Abonnement Premium annuel + 120 jetons/an |

---

## 🍎 Configuration App Store (iOS)

### Étape 1 : Configuration du compte Apple Developer

1. **Inscription Apple Developer Program**
   - Coût : $99/an
   - URL : https://developer.apple.com/programs/

2. **App Store Connect - Créer l'app**
   - Aller sur : https://appstoreconnect.apple.com/
   - Apps → ➕ Nouvelle app
   - Remplir les informations :
     - Nom de l'app
     - Langue principale
     - Bundle ID (ex: `com.votrenom.mystory`)
     - SKU (ex: `mystory-app-001`)

### Étape 2 : Configuration bancaire et fiscale

**CRITIQUE** : Sans cela, vous ne pouvez PAS vendre d'achats in-app !

1. **App Store Connect** → Agreements, Tax, and Banking
2. Compléter :
   - ✅ Paid Applications Agreement (accepter)
   - ✅ Tax Information (informations fiscales)
   - ✅ Banking Information (coordonnées bancaires pour recevoir les paiements)

### Étape 3 : Créer les produits In-App Purchase

1. **App Store Connect** → Votre app → Features → In-App Purchases
2. Pour chaque produit :

#### Produit 1 : Pack 10 jetons
```
Type: Consumable
Reference Name: Pack 10 jetons
Product ID: tokens_pack_100
Price: Tier 10 ($9.99)

Localizations (Français):
- Display Name: Pack 10 jetons
- Description: Obtenez 10 jetons pour créer vos histoires

Localizations (English):
- Display Name: 10 Tokens Pack
- Description: Get 10 tokens to create your stories

Review Screenshot: (capture d'écran de votre BillingScreen)
```

#### Produit 2 : Pack 20 jetons
```
Type: Consumable
Reference Name: Pack 20 jetons
Product ID: tokens_pack_500
Price: Tier 19 ($18.99)

Localizations (Français):
- Display Name: Pack 20 jetons
- Description: Obtenez 20 jetons pour créer vos histoires

Localizations (English):
- Display Name: 20 Tokens Pack
- Description: Get 20 tokens to create your stories
```

#### Produit 3 : Premium Mensuel
```
Type: Auto-Renewable Subscription
Reference Name: Premium Mensuel
Product ID: premium_monthly
Duration: 1 Month
Price: Tier 15 ($14.99)

Subscription Group: Premium (créer si nécessaire)

Localizations (Français):
- Display Name: Abonnement Premium Mensuel
- Description: Accès aux histoires partagées + 10 jetons/mois

Localizations (English):
- Display Name: Premium Monthly Subscription
- Description: Access to shared stories + 10 tokens/month

Review Screenshot: (capture d'écran)
```

#### Produit 4 : Premium Annuel
```
Type: Auto-Renewable Subscription
Reference Name: Premium Annuel
Product ID: premium_yearly
Duration: 1 Year
Price: Tier 150 ($149.99)

Subscription Group: Premium (même groupe que monthly)

Localizations (Français):
- Display Name: Abonnement Premium Annuel
- Description: Accès aux histoires partagées + 120 jetons/an

Localizations (English):
- Display Name: Premium Yearly Subscription
- Description: Access to shared stories + 120 tokens/year
```

### Étape 4 : Créer des comptes Sandbox Testers

Pour tester les achats AVANT la publication :

1. **App Store Connect** → Users and Access → Sandbox Testers
2. ➕ Ajouter un testeur
   - Email : utilisez un email qui n'existe PAS dans iCloud (ex: `test1@votrenom.com`)
   - Mot de passe
   - Prénom/Nom
   - Pays : France

**⚠️ IMPORTANT** : N'utilisez JAMAIS ces comptes pour vous connecter à iCloud !

---

## 🤖 Configuration Google Play (Android)

### Étape 1 : Créer un compte Google Play Developer

1. **Inscription**
   - Coût : $25 (unique)
   - URL : https://play.google.com/console/signup

2. **Google Play Console** → Créer une application
   - Nom de l'app
   - Langue par défaut
   - Type : Application / Jeu
   - Gratuit ou payant : Gratuit (avec achats in-app)

### Étape 2 : Configuration du profil marchand

**CRITIQUE** : Requis pour les achats in-app et abonnements

1. **Google Play Console** → Paramètres → Compte développeur → Profil marchand
2. Compléter :
   - Informations commerciales
   - Informations bancaires
   - Informations fiscales

### Étape 3 : Configurer les produits In-App

1. **Google Play Console** → Votre app → Monétisation → Produits in-app

#### Créer les Consumables (jetons)

**Produit 1 : Pack 10 jetons**
```
Product ID: tokens_pack_100
Nom: Pack 10 jetons
Description: Obtenez 10 jetons pour créer vos histoires
Prix: €9.99 (ou équivalent selon pays)
Status: Actif
```

**Produit 2 : Pack 20 jetons**
```
Product ID: tokens_pack_500
Nom: Pack 20 jetons
Description: Obtenez 20 jetons pour créer vos histoires
Prix: €18.99
Status: Actif
```

#### Créer les Subscriptions

1. **Google Play Console** → Monétisation → Abonnements

**Abonnement 1 : Premium Mensuel**
```
Product ID: premium_monthly
Nom: Abonnement Premium Mensuel
Description: Accès aux histoires partagées + 10 jetons par mois

Période d'abonnement: 1 mois
Prix: €14.99/mois

Période d'essai gratuite (optionnel): 7 jours
Essai gratuit avant paiement: Oui

Gestion des renouvellements: Automatique
```

**Abonnement 2 : Premium Annuel**
```
Product ID: premium_yearly
Nom: Abonnement Premium Annuel
Description: Accès aux histoires partagées + 120 jetons par an

Période d'abonnement: 1 an
Prix: €149.99/an

Période d'essai gratuite (optionnel): 7 jours
```

### Étape 4 : Comptes testeurs (License Testing)

1. **Google Play Console** → Paramètres → Comptes testeurs avec licence
2. Ajouter des adresses Gmail pour tester les achats gratuitement
3. Ces comptes pourront acheter sans être facturés

---

## 🔐 Backend - Validation des achats

### ⚠️ CRITIQUE : Pourquoi la validation serveur est obligatoire ?

**Sans validation serveur** :
- ❌ Un utilisateur peut simuler un achat avec un faux reçu
- ❌ Risque de fraude massive
- ❌ Créditer des jetons sans paiement réel

**Avec validation serveur** :
- ✅ Vérification auprès d'Apple/Google
- ✅ Sécurité garantie
- ✅ Historique des transactions
- ✅ Détection des fraudes

### Architecture backend à implémenter

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   App RN    │────────▶│  Backend     │────────▶│ Apple/Google│
│             │  reçu   │  NestJS      │ verify  │   Servers   │
│             │◀────────│              │◀────────│             │
└─────────────┘ valide  └──────────────┘ validé  └─────────────┘
                              │
                              ▼
                        ┌──────────┐
                        │ Database │
                        │ (tokens) │
                        └──────────┘
```

### 1. Installer les dépendances backend

```bash
cd MyStoryBack  # votre backend NestJS

# Pour valider les reçus iOS
npm install @apple/app-store-server-api

# Pour valider les reçus Android
npm install google-play-billing-validator

# Pour gérer les JWT Apple
npm install node-jose
```

### 2. Créer la table `user_tokens`

```sql
-- migrations/create-user-tokens.sql

-- Table pour stocker les jetons de chaque utilisateur
CREATE TABLE user_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tokens INTEGER NOT NULL DEFAULT 0,
  premium_until TIMESTAMP NULL,  -- NULL = pas premium, sinon date d'expiration
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table historique des achats
CREATE TABLE purchase_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(100) NOT NULL,
  transaction_id VARCHAR(255) NOT NULL UNIQUE,  -- Pour éviter les doublons
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
  receipt TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  tokens_credited INTEGER DEFAULT 0,
  amount_paid DECIMAL(10, 2),
  currency VARCHAR(3),
  purchased_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX idx_purchase_history_user_id ON purchase_history(user_id);
CREATE INDEX idx_purchase_history_transaction_id ON purchase_history(transaction_id);
```

### 3. Créer l'entité `UserTokens`

```typescript
// src/user-tokens/user-tokens.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('user_tokens')
export class UserTokens {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ default: 0 })
  tokens: number;

  @Column({ name: 'premium_until', type: 'timestamp', nullable: true })
  premiumUntil: Date | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### 4. Créer l'entité `PurchaseHistory`

```typescript
// src/billing/purchase-history.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('purchase_history')
export class PurchaseHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'transaction_id', unique: true })
  transactionId: string;

  @Column()
  platform: 'ios' | 'android';

  @Column({ type: 'text' })
  receipt: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ name: 'tokens_credited', default: 0 })
  tokensCredited: number;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountPaid: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ name: 'purchased_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  purchasedAt: Date;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### 5. Service de validation des achats

```typescript
// src/billing/billing.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTokens } from '../user-tokens/user-tokens.entity';
import { PurchaseHistory } from './purchase-history.entity';

// Pour iOS
import { AppStoreServerAPIClient, Environment } from '@apple/app-store-server-api';

// Pour Android
import { Verifier } from 'google-play-billing-validator';

@Injectable()
export class BillingService {
  private appleClient: AppStoreServerAPIClient;
  private androidVerifier: Verifier;

  constructor(
    @InjectRepository(UserTokens)
    private userTokensRepo: Repository<UserTokens>,
    @InjectRepository(PurchaseHistory)
    private purchaseHistoryRepo: Repository<PurchaseHistory>,
  ) {
    // Configuration Apple (à mettre dans .env)
    this.appleClient = new AppStoreServerAPIClient(
      process.env.APPLE_PRIVATE_KEY,
      process.env.APPLE_KEY_ID,
      process.env.APPLE_ISSUER_ID,
      process.env.APPLE_BUNDLE_ID,
      Environment.Production, // ou Environment.Sandbox pour les tests
    );

    // Configuration Google (à mettre dans .env)
    this.androidVerifier = new Verifier({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    });
  }

  async verifyPurchase(
    userId: number,
    productId: string,
    receipt: string,
    platform: 'ios' | 'android',
    transactionId: string,
  ) {
    // 1. Vérifier si cette transaction n'a pas déjà été traitée
    const existingPurchase = await this.purchaseHistoryRepo.findOne({
      where: { transactionId },
    });

    if (existingPurchase && existingPurchase.verified) {
      throw new BadRequestException('Cette transaction a déjà été traitée');
    }

    // 2. Vérifier le reçu auprès d'Apple ou Google
    let isValid = false;
    let purchaseData: any = null;

    if (platform === 'ios') {
      isValid = await this.verifyAppleReceipt(receipt);
    } else if (platform === 'android') {
      purchaseData = await this.verifyGoogleReceipt(receipt, productId);
      isValid = !!purchaseData;
    }

    if (!isValid) {
      throw new BadRequestException('Reçu d\'achat invalide');
    }

    // 3. Déterminer combien de jetons créditer
    const tokensToCredit = this.getTokensForProduct(productId);
    const isPremiumSubscription = productId.includes('premium');

    // 4. Créditer les jetons
    let userTokens = await this.userTokensRepo.findOne({ where: { userId } });

    if (!userTokens) {
      userTokens = this.userTokensRepo.create({
        userId,
        tokens: tokensToCredit,
        premiumUntil: isPremiumSubscription ? this.calculatePremiumExpiry(productId) : null,
      });
    } else {
      userTokens.tokens += tokensToCredit;
      if (isPremiumSubscription) {
        userTokens.premiumUntil = this.calculatePremiumExpiry(productId);
      }
      userTokens.updatedAt = new Date();
    }

    await this.userTokensRepo.save(userTokens);

    // 5. Enregistrer l'achat dans l'historique
    const purchase = this.purchaseHistoryRepo.create({
      userId,
      productId,
      transactionId,
      platform,
      receipt,
      verified: true,
      tokensCredited: tokensToCredit,
      verifiedAt: new Date(),
    });

    await this.purchaseHistoryRepo.save(purchase);

    return {
      success: true,
      tokensCredited: tokensToCredit,
      totalTokens: userTokens.tokens,
      isPremium: !!userTokens.premiumUntil && userTokens.premiumUntil > new Date(),
      premiumUntil: userTokens.premiumUntil,
    };
  }

  private async verifyAppleReceipt(receipt: string): Promise<boolean> {
    try {
      // Utiliser l'API Apple pour vérifier le reçu
      // Documentation: https://developer.apple.com/documentation/appstoreserverapi
      const response = await this.appleClient.verifyReceipt(receipt);
      return response.status === 0; // 0 = valide
    } catch (error) {
      console.error('Erreur validation Apple:', error);
      return false;
    }
  }

  private async verifyGoogleReceipt(receipt: string, productId: string): Promise<any> {
    try {
      const response = await this.androidVerifier.verifyINAPP({
        packageName: process.env.ANDROID_PACKAGE_NAME,
        productId,
        purchaseToken: receipt,
      });
      return response;
    } catch (error) {
      console.error('Erreur validation Google:', error);
      return null;
    }
  }

  private getTokensForProduct(productId: string): number {
    const tokenMap = {
      tokens_pack_100: 10,
      tokens_pack_500: 20,
      premium_monthly: 10,
      premium_yearly: 120,
    };
    return tokenMap[productId] || 0;
  }

  private calculatePremiumExpiry(productId: string): Date {
    const now = new Date();
    if (productId === 'premium_monthly') {
      now.setMonth(now.getMonth() + 1);
    } else if (productId === 'premium_yearly') {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now;
  }

  async getUserTokens(userId: number) {
    let userTokens = await this.userTokensRepo.findOne({ where: { userId } });

    if (!userTokens) {
      userTokens = this.userTokensRepo.create({
        userId,
        tokens: 0,
        premiumUntil: null,
      });
      await this.userTokensRepo.save(userTokens);
    }

    const isPremium = !!userTokens.premiumUntil && userTokens.premiumUntil > new Date();

    return {
      tokens: userTokens.tokens,
      isPremium,
      premiumUntil: userTokens.premiumUntil,
    };
  }

  async consumeToken(userId: number): Promise<boolean> {
    const userTokens = await this.userTokensRepo.findOne({ where: { userId } });

    if (!userTokens || userTokens.tokens < 1) {
      throw new BadRequestException('Pas assez de jetons');
    }

    userTokens.tokens -= 1;
    userTokens.updatedAt = new Date();
    await this.userTokensRepo.save(userTokens);

    return true;
  }

  async getPurchaseHistory(userId: number) {
    return this.purchaseHistoryRepo.find({
      where: { userId },
      order: { purchasedAt: 'DESC' },
    });
  }
}
```

### 6. Controller pour les endpoints billing

```typescript
// src/billing/billing.controller.ts

import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('verify-purchase')
  async verifyPurchase(
    @CurrentUser() user: any,
    @Body() body: {
      productId: string;
      receipt: string;
      platform: 'ios' | 'android';
      transactionId: string;
    },
  ) {
    return this.billingService.verifyPurchase(
      user.userId,
      body.productId,
      body.receipt,
      body.platform,
      body.transactionId,
    );
  }

  @Get('tokens')
  async getTokens(@CurrentUser() user: any) {
    return this.billingService.getUserTokens(user.userId);
  }

  @Post('consume-token')
  async consumeToken(@CurrentUser() user: any) {
    await this.billingService.consumeToken(user.userId);
    return { success: true };
  }

  @Get('history')
  async getPurchaseHistory(@CurrentUser() user: any) {
    return this.billingService.getPurchaseHistory(user.userId);
  }
}
```

### 7. Variables d'environnement (.env)

```env
# iOS (App Store)
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIGT...\n-----END PRIVATE KEY-----
APPLE_KEY_ID=ABCD1234XY
APPLE_ISSUER_ID=12345678-1234-1234-1234-123456789012
APPLE_BUNDLE_ID=com.votrenom.mystory

# Android (Google Play)
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
ANDROID_PACKAGE_NAME=com.votrenom.mystory
```

### 8. Module Billing

```typescript
// src/billing/billing.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { UserTokens } from '../user-tokens/user-tokens.entity';
import { PurchaseHistory } from './purchase-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTokens, PurchaseHistory])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
```

---

## 📱 Frontend - Intégration complète

### 1. Ajouter les méthodes API

```typescript
// src/services/api.ts

// Ajouter ces méthodes à la classe ApiService

async verifyPurchase(data: {
  productId: string;
  receipt: string;
  platform: 'ios' | 'android';
  transactionId: string;
}) {
  return this.post<{
    success: boolean;
    tokensCredited: number;
    totalTokens: number;
    isPremium: boolean;
    premiumUntil?: Date;
  }>('/billing/verify-purchase', data);
}

async getUserTokens() {
  return this.get<{
    tokens: number;
    isPremium: boolean;
    premiumUntil?: Date;
  }>('/billing/tokens');
}

async consumeToken() {
  return this.post<{ success: boolean }>('/billing/consume-token');
}

async getPurchaseHistory() {
  return this.get<any[]>('/billing/history');
}
```

### 2. Créer un contexte pour les tokens

```typescript
// src/context/TokensContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { api } from '~/services/api';
import { useAuth } from './AuthContext';

type TokensContextType = {
  tokens: number;
  isPremium: boolean;
  premiumUntil: Date | null;
  loading: boolean;
  refreshTokens: () => Promise<void>;
  consumeToken: () => Promise<boolean>;
};

const TokensContext = createContext<TokensContextType>({
  tokens: 0,
  isPremium: false,
  premiumUntil: null,
  loading: true,
  refreshTokens: async () => {},
  consumeToken: async () => false,
});

export const useTokens = () => useContext(TokensContext);

export const TokensProvider = ({ children }: { children: ReactNode }) => {
  const [tokens, setTokens] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const refreshTokens = async () => {
    if (!isAuthenticated) return;

    try {
      const data = await api.getUserTokens();
      setTokens(data.tokens);
      setIsPremium(data.isPremium);
      setPremiumUntil(data.premiumUntil ? new Date(data.premiumUntil) : null);
    } catch (error) {
      console.error('Erreur lors de la récupération des jetons:', error);
    } finally {
      setLoading(false);
    }
  };

  const consumeToken = async (): Promise<boolean> => {
    try {
      await api.consumeToken();
      await refreshTokens();
      return true;
    } catch (error) {
      console.error('Erreur lors de la consommation du jeton:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshTokens();
  }, [isAuthenticated]);

  return (
    <TokensContext.Provider
      value={{
        tokens,
        isPremium,
        premiumUntil,
        loading,
        refreshTokens,
        consumeToken,
      }}
    >
      {children}
    </TokensContext.Provider>
  );
};
```

### 3. Mettre à jour App.tsx

```typescript
// App.tsx

import { ThemeProvider } from '~/context/ThemeContext';
import { AuthProvider } from '~/context/AuthContext';
import { TokensProvider } from '~/context/TokensContext';  // AJOUTER
import './global.css';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <AuthProvider>
        <TokensProvider>  {/* AJOUTER */}
          <ThemeProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </TokensProvider>
      </AuthProvider>
    </>
  );
}
```

### 4. Améliorer BillingScreen avec validation serveur

```typescript
// src/screens/BillingScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Dimensions, Platform } from 'react-native';
import BottomNavBar from '~/navigation/BottomNavBar';
import ShopButton from '~/components/ShopButton';
import { useTheme } from '~/context/ThemeContext';
import { useTokens } from '~/context/TokensContext';  // AJOUTER
import { api } from '~/services/api';  // AJOUTER

let RNIap;
if (__DEV__) {
  // ... code de simulation existant
} else {
  RNIap = require('react-native-iap');
}

export default function BillingScreen() {
  const itemSkus = ['tokens_pack_100', 'tokens_pack_500', 'premium_monthly', 'premium_yearly'];
  const [products, setProducts] = useState<RNIap.Product[]>([]);
  const { isNight } = useTheme();
  const { tokens, isPremium, refreshTokens } = useTokens();  // AJOUTER
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        const items = await RNIap.getProducts({ skus: itemSkus });
        const subs = await RNIap.getSubscriptions({ skus: itemSkus });
        setProducts([...items, ...subs]);
      } catch (err) {
        console.warn('Erreur IAP init:', err);
      }
    };

    initIAP();

    // MODIFIER : Validation serveur
    const purchaseUpdate = RNIap.purchaseUpdatedListener(async (purchase: RNIap.Purchase) => {
      const receipt = purchase.transactionReceipt;

      if (receipt) {
        try {
          setPurchasing(true);

          // ✅ VALIDATION SERVEUR
          const response = await api.verifyPurchase({
            productId: purchase.productId,
            receipt,
            platform: Platform.OS as 'ios' | 'android',
            transactionId: purchase.transactionId,
          });

          if (response.success) {
            // Rafraîchir les tokens
            await refreshTokens();

            const message = purchase.productId.includes('premium')
              ? `🎉 Bienvenue Premium !\n\nVous avez reçu ${response.tokensCredited} jetons`
              : `✅ Jetons achetés !\n\nVous avez reçu ${response.tokensCredited} jetons\nTotal: ${response.totalTokens} jetons`;

            Alert.alert('Achat validé', message);
          }

          // Finaliser la transaction
          await RNIap.finishTransaction({ purchase, isConsumable: true });
        } catch (error) {
          console.error('Erreur validation achat:', error);
          Alert.alert(
            'Erreur',
            'Impossible de valider votre achat. Veuillez contacter le support.'
          );
        } finally {
          setPurchasing(false);
        }
      }
    });

    const purchaseError = RNIap.purchaseErrorListener((error: any) => {
      console.warn('Erreur d\'achat', error);
      Alert.alert('Erreur', error.message);
      setPurchasing(false);
    });

    return () => {
      purchaseUpdate.remove();
      purchaseError.remove();
      RNIap.endConnection();
    };
  }, []);

  const buy = async (sku: string) => {
    if (purchasing) {
      Alert.alert('Patience', 'Un achat est déjà en cours...');
      return;
    }

    try {
      setPurchasing(true);
      await RNIap.requestPurchase({ sku });
    } catch (err) {
      console.warn('Erreur achat', err);
      setPurchasing(false);
    }
  };

  // ... reste du code UI existant

  return (
    <View className="flex-1 pt-4 px-4 relative" style={{ backgroundColor: isNight ? '#020205' : '#87CEEB' }}>
      {/* ... étoiles et décor existant */}

      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginTop: 20 }}>
        🛒 Boutique
      </Text>

      {/* AJOUTER : Affichage des jetons */}
      <View className="bg-white rounded-2xl p-4 mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-600 text-sm">Vos jetons</Text>
          <Text className="text-2xl font-bold text-purple-600">{tokens} 🪙</Text>
        </View>
        {isPremium && (
          <View className="bg-yellow-100 px-4 py-2 rounded-full">
            <Text className="text-yellow-800 font-semibold">⭐ Premium</Text>
          </View>
        )}
      </View>

      {/* ... reste du code existant pour les boutons d'achat */}

      <BottomNavBar />
    </View>
  );
}
```

### 5. Modifier CreateStoryScreen pour consommer un jeton

```typescript
// src/screens/CreateStoryScreen.tsx

import { useTokens } from '~/context/TokensContext';

export default function CreateStoryScreen() {
  const { tokens, consumeToken } = useTokens();

  const handleCreateStory = async () => {
    // Vérifier qu'on a assez de jetons
    if (tokens < 1) {
      Alert.alert(
        'Pas assez de jetons',
        'Vous devez acheter des jetons pour créer une histoire',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Acheter', onPress: () => navigation.navigate('BillingScreen') },
        ]
      );
      return;
    }

    // ... votre logique de création d'histoire existante

    try {
      // Créer l'histoire via l'API
      const response = await api.createStory({ title, pages });

      // Consommer 1 jeton
      const consumed = await consumeToken();

      if (consumed) {
        Alert.alert('Succès', 'Votre histoire a été créée !');
        navigation.navigate('Stories');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer l\'histoire');
    }
  };

  // ... reste du code
}
```

---

## 🧪 Tests avant publication

### Tests iOS (Sandbox)

1. **Déconnectez-vous d'iCloud** sur votre iPhone de test
2. **Installez l'app** via TestFlight ou Xcode
3. **Lors du premier achat** : iOS vous demandera de vous connecter
4. Utilisez un compte **Sandbox Tester** créé dans App Store Connect
5. **Testez tous les scénarios** :
   - ✅ Achat de jetons pack 10
   - ✅ Achat de jetons pack 20
   - ✅ Abonnement mensuel
   - ✅ Abonnement annuel
   - ✅ Annulation d'achat
   - ✅ Restauration d'achats

### Tests Android (License Testing)

1. **Google Play Console** → Votre app → Tests internes
2. Upload l'APK/AAB
3. Ajoutez vos testeurs (adresses Gmail)
4. Les testeurs téléchargent l'app via le lien fourni
5. **Testez tous les scénarios** (même liste qu'iOS)

### Vérifications importantes

✅ Les jetons sont bien crédités après validation serveur
✅ Impossible d'acheter deux fois avec le même `transactionId`
✅ Les abonnements renouvellent automatiquement
✅ Les achats sont restaurables après désinstallation/réinstallation

---

## 📋 Checklist de publication

### iOS (App Store)

- [ ] Compte Apple Developer actif ($99/an payé)
- [ ] Informations bancaires et fiscales complétées dans App Store Connect
- [ ] Tous les produits IAP créés et approuvés
- [ ] App testée en Sandbox avec tous les produits
- [ ] Captures d'écran de l'app préparées (5.5", 6.5", iPad Pro)
- [ ] Icône de l'app (1024x1024px)
- [ ] Description de l'app en français et anglais
- [ ] Privacy Policy URL (obligatoire pour les apps avec achats)
- [ ] Build uploadé via Xcode ou Transporter
- [ ] Soumission pour review
- [ ] Attendre approbation (3-7 jours en moyenne)

### Android (Google Play)

- [ ] Compte Google Play Developer actif ($25 payé)
- [ ] Profil marchand complété
- [ ] Tous les produits IAP créés et activés
- [ ] App testée en "Internal Testing"
- [ ] Captures d'écran (Phone, 7", 10")
- [ ] Icône de l'app (512x512px)
- [ ] Feature Graphic (1024x500px)
- [ ] Description courte et longue
- [ ] Privacy Policy URL
- [ ] APK/AAB signé uploadé en Production
- [ ] Questionnaire de contenu complété
- [ ] Soumission pour review
- [ ] Attendre approbation (quelques heures à 7 jours)

---

## 🚨 Erreurs courantes et solutions

### "Sandbox account already used"
**Solution** : Créez un nouveau compte sandbox tester

### "Cannot connect to iTunes Store"
**Solution** : Vérifiez que vous êtes bien déconnecté d'iCloud avant de tester

### "Receipt validation failed"
**Solution** :
- Vérifiez que votre clé API Apple est correcte
- Assurez-vous d'utiliser le bon environnement (Sandbox vs Production)

### "Product not found"
**Solution** : Attendez 2-3 heures après la création du produit dans App Store Connect

### "Purchase already owned"
**Solution** :
- Pour les consumables : finishTransaction correctement
- Pour les subscriptions : attendez l'expiration ou annulez

---

## 💡 Recommandations finales

1. **Sécurité** : TOUJOURS valider côté serveur
2. **UX** : Affichez clairement le nombre de jetons restants
3. **Logs** : Enregistrez tous les achats pour le support client
4. **Restauration** : Implémentez un bouton "Restaurer les achats"
5. **Support** : Prévoyez un email de contact pour les problèmes d'achat
6. **Prix** : Testez différents prix points (A/B testing)
7. **Abonnements** : Rappelez les avantages Premium régulièrement
8. **Notifications** : Prévenez l'utilisateur quand ses jetons sont bas

---

## 📚 Ressources officielles

- [Apple In-App Purchase Documentation](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing Documentation](https://developer.android.com/google/play/billing)
- [react-native-iap Documentation](https://react-native-iap.dooboolab.com/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://support.google.com/googleplay/android-developer/topic/9858052)

---

**Bonne chance avec la publication de votre app ! 🚀**
