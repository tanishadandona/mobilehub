import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, View, Text, Button, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  useEffect(() => {
    // Load the saved notification preference
    const loadNotificationPreference = async () => {
      const storedPreference = await AsyncStorage.getItem('notificationsEnabled');
      if (storedPreference !== null) {
        setNotificationsEnabled(JSON.parse(storedPreference));
      }
    };

    loadNotificationPreference();

    const requestPermissions = async () => {
      if (notificationsEnabled) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission for notifications not granted. Please enable it in settings.');
        }
      }
    };

    requestPermissions();

    if (Platform.OS === 'android' && notificationsEnabled) {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }
  }, [notificationsEnabled]);

  const toggleNotifications = async () => {
    setNotificationsEnabled((prevState) => !prevState);
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(!notificationsEnabled));
  };

  const scheduleNotification = async () => {
    if (notificationsEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Don't forget!",
          body: 'Your trip is coming up soon.',
          sound: 'default',
          data: { someData: 'goes here' },
        },
        trigger: {
          seconds: 5,
        },
      });
    } else {
      alert('Notifications are disabled.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to Explore India</Text>
      <View style={{ marginVertical: 20 }}>
        <Text>Enable Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
      </View>
      <Button title="Schedule Notification" onPress={scheduleNotification} />
    </SafeAreaView>
  );
}
