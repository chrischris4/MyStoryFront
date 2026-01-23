import { useState, useEffect, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useUserStore } from '~/store/useUserStore';
import { API_BASE_URL } from '~/config/api';

// Configuration du comportement des notifications
// Ne pas afficher si l'app est au premier plan (l'utilisateur voit déjà le contenu)
Notifications.setNotificationHandler({
  handleNotification: async () => {
    const isAppInForeground = AppState.currentState === 'active';

    return {
      shouldShowBanner: !isAppInForeground,
      shouldShowList: !isAppInForeground,
      shouldPlaySound: !isAppInForeground,
      shouldSetBadge: true,
    };
  },
});

export type NotificationData = {
  type?: string;
  storyId?: string;
  groupId?: string;
  [key: string]: any;
};

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const accessToken = useUserStore((state) => state.accessToken);

  // Enregistrer le token sur le backend
  const registerTokenOnBackend = async (token: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ pushToken: token }),
      });

      if (!response.ok) {
        console.error('Failed to register push token on backend');
      }
    } catch (err) {
      console.error('Error registering push token:', err);
    }
  };

  // Obtenir le token Expo Push
  const registerForPushNotifications = async (): Promise<string | null> => {
    if (!Device.isDevice) {
      setError('Les notifications push nécessitent un appareil physique');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setError('Permission de notification refusée');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

      // Config spécifique Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#38b6ff',
        });
      }

      return token;
    } catch (err) {
      console.error('Error getting push token:', err);
      setError("Erreur lors de l'obtention du token");
      return null;
    }
  };

  useEffect(() => {
    // Enregistrer pour les notifications
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        registerTokenOnBackend(token);
      }
    });

    // Listener pour les notifications reçues (app au premier plan)
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listener pour quand l'utilisateur tap sur une notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationData;
      handleNotificationResponse(data);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [accessToken]);

  // Gérer le tap sur une notification (navigation, etc.)
  const handleNotificationResponse = (data: NotificationData) => {
    // Tu peux ajouter la logique de navigation ici
    // Par exemple: if (data.type === 'new_story') navigate('Story', { id: data.storyId })
    console.log('Notification tapped:', data);
  };

  return {
    expoPushToken,
    notification,
    error,
  };
}
