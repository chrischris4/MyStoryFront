# Flun — AI Story Creator

> Create magical, personalized stories with unique AI-generated illustrations. Available in French and English.

---

## Overview

**Flun** is a mobile application built with React Native and Expo that lets users create fully illustrated stories powered by AI. Users can design custom characters, build narratives, share stories with groups, and collect them in a personal library.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native 0.81 + Expo 54 |
| Language | TypeScript (strict) |
| Styling | TailwindCSS via NativeWind |
| State | Zustand + React Context |
| Data Fetching | TanStack React Query v5 |
| Navigation | React Navigation (native stack + bottom tabs) |
| Auth | JWT + Google OAuth (expo-auth-session) |
| Payments | Stripe + React Native IAP |
| i18n | i18next (EN / FR) |
| Forms | Formik + Yup |
| Animations | Lottie + Reanimated |
| Build | EAS Build (Expo Application Services) |

---

## Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Expo CLI** — `npm install -g expo-cli`
- **EAS CLI** — `npm install -g eas-cli`
- iOS Simulator (macOS) or Android Studio / physical device

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd MyStoryFront

# Install dependencies
npm install
```

---

## Environment Setup

Create a `.env` file at the root of the project:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com

EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your_web_client_id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your_ios_client_id
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_android_client_id
```

---

## Running the App

```bash
# Start the Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

---

## Project Structure

```
├── App.tsx                  # Root component — providers, fonts, navigation
├── src/
│   ├── screens/             # Screen-level components
│   │   ├── HomeScreen.tsx
│   │   ├── CreateStoryScreen.tsx
│   │   ├── StoriesScreen.tsx
│   │   ├── StoryDetailScreen.tsx
│   │   ├── GroupScreen.tsx
│   │   ├── BillingScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── auth/            # Login, Register, ForgotPassword
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React Query hooks (API calls)
│   ├── store/               # Zustand stores
│   ├── context/             # Auth, Theme, Sound contexts
│   ├── navigation/          # Stack & tab navigator setup
│   ├── services/            # Axios API client
│   ├── config/              # API base URL config
│   ├── utils/               # Error mapper, auth refresh, profanity filter
│   ├── i18n/                # Translations (en.json, fr.json)
│   └── types.ts             # Shared TypeScript types
├── assets/
│   ├── fonts/               # Baloo2 font family
│   ├── animations/          # Lottie JSON files
│   └── sounds/              # Audio assets
├── app.json                 # Expo app config
└── eas.json                 # EAS build profiles
```

---

## Key Features

- **AI Story Generation** — Create personalized illustrated stories with custom characters
- **Character Builder** — Human or animal characters with customizable traits
- **Groups & Sharing** — Share stories with friend groups or the community
- **Story Library** — Browse, favorite, and manage your story collection
- **Subscriptions** — Premium content via Stripe and in-app purchases
- **Multilingual** — Full French and English support
- **Dark / Light Mode** — System-aware theming
- **Offline-ready** — React Query caching for smooth UX

---

## Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in browser
npm run lint       # Run ESLint + Prettier checks
npm run format     # Auto-fix lint and formatting issues
npm run prebuild   # Generate native iOS/Android folders
```

---

## Building for Production

```bash
# Configure EAS
eas login
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

---

## License

Private — All rights reserved.
