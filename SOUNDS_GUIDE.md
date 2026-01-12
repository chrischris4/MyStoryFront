# 🔊 Guide d'installation des sons

## Téléchargement rapide (recommandé)

### Option 1 : Mixkit (Gratuit, sans inscription)
1. Allez sur https://mixkit.co/free-sound-effects/click/
2. Téléchargez ces sons :
   - "UI Click" → renommer en `click.mp3`
   - "Pop Up" → renommer en `pop.mp3`
   - "Success" → renommer en `success.mp3`
   - "Error" → renommer en `error.mp3`
   - "Toggle" → renommer en `toggle.mp3`

3. Placez-les dans `assets/sounds/`

### Option 2 : Freesound (Gratuit, inscription requise)
1. Allez sur https://freesound.org/
2. Cherchez : "UI click sound", "button pop", "success notification"
3. Téléchargez et renommez selon la liste ci-dessus

### Option 3 : Sons générés (Plus rapide !)
Utilisez https://sfxr.me/ pour générer des sons simples en quelques secondes.

## Structure attendue

```
MyStoryFront/
  assets/
    sounds/
      click.mp3      ← Son pour clics de boutons
      pop.mp3        ← Son pour actions rapides
      success.mp3    ← Son pour actions réussies
      error.mp3      ← Son pour erreurs
      toggle.mp3     ← Son pour switchs
```

## Utilisation dans le code

```typescript
import { useSound } from '~/hooks/useSound';
import * as Haptics from 'expo-haptics';

const MyComponent = () => {
  const { playSound } = useSound();

  const handlePress = () => {
    // Vibration tactile
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Son audio
    playSound('click');

    // Votre logique
  };

  return <Button onPress={handlePress}>Click me</Button>;
};
```

## Sons déjà intégrés

Le hook est déjà configuré ! Il suffit d'ajouter les fichiers MP3.

Sons disponibles :
- `click` - Clics normaux
- `pop` - Actions rapides
- `success` - Succès
- `error` - Erreurs
- `toggle` - Switchs/toggles

## Conseils

- Fichiers légers (< 50kb par fichier)
- Durée courte (< 0.5 secondes)
- Volume modéré
- Format : MP3 ou WAV
