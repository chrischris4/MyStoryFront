# Deployer le Backend NestJS sur Railway

## 1. Preparer le backend

### package.json
Verifie que tu as ces scripts :
```json
"scripts": {
  "build": "nest build",
  "start": "node dist/main.js",
  "start:prod": "node dist/main.js"
}
```

### Procfile (optionnel)
Cree un fichier `Procfile` a la racine :
```
web: npm run start:prod
```

## 2. Creer le service sur Railway

1. Va sur https://railway.app
2. Clique sur **New Project**
3. Selectionne **Deploy from GitHub repo**
4. Connecte ton compte GitHub si pas deja fait
5. Selectionne le repo de ton backend

## 3. Configurer le deploiement automatique

Railway detecte automatiquement les push sur `main` :
1. Dans les settings du service, va dans **Settings > Source**
2. Verifie que **Automatic Deployments** est active
3. Verifie que la branche est `main`

## 4. Variables d'environnement

Dans Railway, va dans **Variables** et ajoute :

```
DATABASE_URL=postgresql://...  (ta DB Railway)
JWT_SECRET=ton_secret_jwt
JWT_REFRESH_SECRET=ton_refresh_secret
PORT=3000
NODE_ENV=production
```

## 5. Configurer le domaine

1. Va dans **Settings > Networking**
2. Clique sur **Generate Domain**
3. Tu obtiendras une URL genre : `https://ton-app.up.railway.app`

## 6. Mettre a jour l'app React Native

Dans ton `.env` du front :
```
EXPO_PUBLIC_API_BASE_URL=https://ton-app.up.railway.app
```

## 7. Build de production

```bash
eas build --platform android --profile production
```

---

## Resume du workflow

```
Push sur main -> Railway detecte -> Build automatique -> Deploy
```

Chaque `git push origin main` declenchera un nouveau deploiement automatique.
