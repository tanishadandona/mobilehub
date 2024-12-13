import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const NotificationScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        console.log('Scheduled Notifications:', scheduledNotifications); // Debugging Log
        setNotifications(scheduledNotifications);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch notifications.');
      }
    };

    fetchNotifications();
  }, []);

  const handleDeleteNotification = async (identifier: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.identifier !== identifier)
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification.');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationTextContainer}>
        <Text style={styles.notificationTitle}>{item.content.title}</Text>
        <Text style={styles.notificationBody}>{item.content.body}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteNotification(item.identifier)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Scheduled Notifications</Text>
      </View>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No scheduled notifications found.</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.identifier}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NotificationScreen;
