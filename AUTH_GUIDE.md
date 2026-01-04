# Guide d'Authentification - MyStoryFront

## 📋 Vue d'ensemble

Ce projet utilise un système d'authentification robuste avec :
- ✅ Context API pour la gestion globale de l'état d'auth
- ✅ Service API centralisé avec gestion automatique des tokens
- ✅ Routes protégées
- ✅ Déconnexion automatique en cas d'erreur 401
- ✅ Stockage sécurisé avec AsyncStorage

## 🏗️ Architecture

### 1. AuthContext (`src/context/AuthContext.tsx`)

Le contexte d'authentification gère l'état global de l'utilisateur.

**Fonctionnalités:**
- `user`: Informations de l'utilisateur connecté
- `token`: Token d'authentification JWT
- `isAuthenticated`: Booléen indiquant si l'utilisateur est connecté
- `isLoading`: Booléen pour l'état de chargement initial
- `login(token, userData?)`: Connecter un utilisateur
- `logout()`: Déconnecter l'utilisateur
- `updateUser(userData)`: Mettre à jour les infos utilisateur
- `checkAuth()`: Vérifier si le token est toujours valide

**Utilisation dans un composant:**
```tsx
import { useAuth } from '~/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Text>Non connecté</Text>;
  }

  return (
    <View>
      <Text>Bonjour {user?.email}</Text>
      <Button title="Déconnexion" onPress={logout} />
    </View>
  );
}
```

### 2. Service API (`src/services/api.ts`)

Service centralisé pour toutes les requêtes API.

**Fonctionnalités:**
- Gestion automatique du token d'authentification
- Gestion des erreurs HTTP avec classe `ApiError`
- Déconnexion automatique en cas d'erreur 401
- Méthodes HTTP de base (GET, POST, PUT, PATCH, DELETE)
- Méthodes spécialisées pour les endpoints courants

**Utilisation:**
```tsx
import { api, ApiError } from '~/services/api';

// Dans un composant
const fetchStories = async () => {
  try {
    const stories = await api.getStories();
    setStories(stories);
  } catch (error) {
    if (error instanceof ApiError) {
      Alert.alert('Erreur', error.message);
    }
  }
};

// Appel personnalisé
const updateStory = async (id: number, data: any) => {
  try {
    const result = await api.patch(`/story/${id}`, data);
    return result;
  } catch (error) {
    console.error(error);
  }
};
```

**Méthodes disponibles:**

#### Authentification
```tsx
api.login(email, password)           // POST /auth/login
api.register(email, password, username?) // POST /auth/register
api.getProfile()                     // GET /auth/profile
```

#### Stories
```tsx
api.getStories()                     // GET /story
api.getSharedStories()               // GET /story/shared
api.getStoryDetail(id)               // GET /story/detail/:id
api.toggleStoryShared(id)            // PATCH /story/:id/toggle-shared
api.deleteStory(id)                  // DELETE /story/:id
```

#### Favoris
```tsx
api.getFavoriteStories()             // GET /favorite-story/me
api.addFavorite(storyId)             // POST /favorite-story
api.removeFavorite(storyId)          // DELETE /favorite-story
```

### 3. Routes Protégées (`src/components/ProtectedRoute.tsx`)

Composant qui protège les routes nécessitant une authentification.

**Fonctionnement:**
- Vérifie si l'utilisateur est authentifié
- Affiche un loader pendant la vérification
- Redirige vers Login si non authentifié

**Utilisation dans AppNavigator:**
```tsx
<Stack.Screen name="Home">
  {(props) => (
    <ProtectedRoute>
      <HomeScreen {...props} />
    </ProtectedRoute>
  )}
</Stack.Screen>
```

## 🔧 Configuration

### Dans App.tsx

L'AuthProvider doit envelopper toute l'application:

```tsx
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### Dans AppNavigator.tsx

Configurer le gestionnaire de déconnexion automatique:

```tsx
function AppNavigatorContent() {
  const { logout } = useAuth();

  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  // Routes...
}
```

## 📝 Exemples de Refactorisation

### Avant (ancien système):
```tsx
const fetchStory = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('Non authentifié');

    const response = await fetch(`http://192.168.1.95:3000/story/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur');
    }

    const data = await response.json();
    setStory(data);
  } catch (err) {
    setError(err.message);
  }
};
```

### Après (nouveau système):
```tsx
import { api, ApiError } from '~/services/api';

const fetchStory = async () => {
  try {
    const data = await api.getStoryDetail(id);
    setStory(data);
  } catch (error) {
    if (error instanceof ApiError) {
      setError(error.message);
    }
  }
};
```

## 🔐 Sécurité

### Stockage du Token
- Le token est stocké dans AsyncStorage
- La clé utilisée: `'accessToken'`
- Le token est automatiquement ajouté aux requêtes

### Gestion des Erreurs 401
- Erreur 401 = token invalide/expiré
- Déconnexion automatique
- Redirection vers Login
- Nettoyage du storage

### Routes Protégées
Toutes les routes sensibles sont protégées:
- Home
- Stories
- SharedStories
- CreateStory
- StoryDetail
- BillingScreen
- SettingsScreen

## 🚀 Migration des Écrans Existants

Pour migrer un écran vers le nouveau système:

1. **Importer le service API:**
```tsx
import { api, ApiError } from '~/services/api';
```

2. **Utiliser le hook useAuth si besoin:**
```tsx
import { useAuth } from '~/context/AuthContext';
const { user, logout } = useAuth();
```

3. **Remplacer les appels fetch par le service API:**
```tsx
// Avant
const token = await AsyncStorage.getItem('accessToken');
const response = await fetch('...', {
  headers: { Authorization: `Bearer ${token}` }
});

// Après
const data = await api.get('/endpoint');
```

4. **Gérer les erreurs avec ApiError:**
```tsx
try {
  const data = await api.getStories();
} catch (error) {
  if (error instanceof ApiError) {
    Alert.alert('Erreur', error.message);
  }
}
```

## 📚 Best Practices

1. **Toujours utiliser le service API** au lieu de fetch direct
2. **Gérer les erreurs** avec try/catch et ApiError
3. **Ne pas stocker le token manuellement** - utiliser AuthContext
4. **Protéger toutes les routes sensibles** avec ProtectedRoute
5. **Vérifier `isLoading`** avant d'accéder à `user` ou `isAuthenticated`

## 🐛 Debugging

### Vérifier si l'utilisateur est connecté:
```tsx
const { user, token, isAuthenticated } = useAuth();
console.log({ user, token, isAuthenticated });
```

### Vérifier les erreurs API:
```tsx
try {
  await api.getStories();
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Data:', error.data);
  }
}
```

### Forcer la déconnexion:
```tsx
const { logout } = useAuth();
await logout();
```

## 🔄 Prochaines Améliorations Possibles

- [ ] Refresh token automatique
- [ ] Remember me
- [ ] Biometric authentication
- [ ] Token encryption
- [ ] Request queuing pendant refresh
- [ ] Offline mode avec cache
