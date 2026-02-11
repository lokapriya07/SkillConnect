import { useEffect, useState, useRef, useCallback } from 'react';
import { Platform, Alert, Vibration } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let messageSound: Audio.Sound | null = null;

interface NotificationHook {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  unreadCount: number;
  notificationEnabled: boolean;
  registerForPushNotifications: () => Promise<void>;
  markMessagesAsRead: () => Promise<void>;
  decrementBadge: () => Promise<void>;
}

export function useNotifications(): NotificationHook {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Load unread count from storage on mount
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await AsyncStorage.getItem('unreadMessagesCount');
        if (count) {
          setUnreadCount(parseInt(count, 10));
          if (Platform.OS === 'ios') {
            await Notifications.setBadgeCountAsync(parseInt(count, 10));
          }
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };
    loadUnreadCount();
  }, []);

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      Alert.alert('Emulator', 'Push notifications require a physical device');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission Required', 'Please enable notifications to receive chat messages');
        return;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '2ce83aff-bd3f-4df5-839d-7c9a08d3181c', // User app project ID
      });
      
      setExpoPushToken(tokenData.data);
      setNotificationEnabled(true);

      // Configure for Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('chat-messages', {
          name: 'Chat Messages',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        });
      }

      // Send token to backend
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userId = user.userId || user._id;
        const userType = 'user';
        
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userType,
            expoPushToken: tokenData.data,
          }),
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }, []);

  // Setup notification listeners
  useEffect(() => {
    registerForPushNotifications();

    // Handle incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      async (notif) => {
        setNotification(notif);
        
        // Vibrate
        if (Platform.OS === 'android') {
          Vibration.vibrate([0, 500, 200, 500]);
        }
        
        // Play notification sound
        try {
          if (!messageSound) {
            messageSound = new Audio.Sound();
            await messageSound.loadAsync(require('../assets/sounds/notification.mp3'));
          }
          await messageSound.replayAsync();
        } catch (error) {
          console.log('Error playing notification sound:', error);
        }
      }
    );

    // Handle notification response (user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        // Navigate to chat screen based on data
        console.log('Notification tapped:', data);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      if (messageSound) {
        messageSound.unloadAsync();
        messageSound = null;
      }
    };
  }, [registerForPushNotifications]);

  // Update badge count
  const updateBadgeCount = useCallback(async (count: number) => {
    setUnreadCount(count);
    await AsyncStorage.setItem('unreadMessagesCount', count.toString());
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(count);
    }
  }, []);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    await updateBadgeCount(0);
  }, [updateBadgeCount]);

  // Decrement badge by 1
  const decrementBadge = useCallback(async () => {
    const newCount = Math.max(0, unreadCount - 1);
    await updateBadgeCount(newCount);
  }, [unreadCount, updateBadgeCount]);

  return {
    expoPushToken,
    notification,
    unreadCount,
    notificationEnabled,
    registerForPushNotifications,
    markMessagesAsRead,
    decrementBadge,
  };
}
