import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, firestore } from './(auth)/config/firebaseConfig';
import { useRouter } from 'expo-router';
import { Destination, Itinerary } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const { width } = Dimensions.get('window');

const AddItineraryScreen: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(
    null
  );
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const snapshot = await firestore.collection('destinations').get();
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Destination[];
        setDestinations(data);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      }
    };

    fetchDestinations();
  }, []);

  const handleAddItinerary = async () => {
    if (!selectedDestination) {
      Alert.alert('Please select a destination.');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('End date must be after start date.');
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId){
        Alert.alert('Error', 'User not authenticated.');
        return;
      }
      const itinerary: Itinerary = {
        userId,
        destinationId: selectedDestination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        activities: [],
      };

      await firestore.collection('itineraries').add(itinerary);

      // Determine the notification trigger time based on how close the trip is
      let triggerDate = new Date(startDate);
      const now = new Date();

      if (startDate.getDate() === now.getDate() && startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()) {
        // If the trip starts today, notify immediately
        triggerDate = new Date(now.getTime() + 10000); // Trigger in 10 seconds
      } else if (startDate.getDate() - now.getDate() === 1) {
        // If the trip starts tomorrow, notify today
        triggerDate.setHours(20, 0, 0); // Notify today at 8:00 PM
      } else {
        // Notify one day before the trip
        triggerDate.setDate(triggerDate.getDate() - 1);
        triggerDate.setHours(9, 0, 0); // Notify at 9:00 AM the day before
      }

      if (triggerDate <= now) {
        Alert.alert('Invalid Date', 'The date is in the past.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Upcoming Trip Reminder",
          body: `Your trip to ${destinations.find(d => d.id === selectedDestination)?.name} is coming up soon!`,
        },
        trigger: { date: triggerDate },
      });

      Alert.alert('Itinerary added successfully!');
      router.push('/itinerary'); // Navigate back to the itinerary list
    } catch (error) {
      Alert.alert('Error adding itinerary:', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Itinerary</Text>
      </View>

      <Text style={styles.label}>Select Destination:</Text>
      <Picker
        selectedValue={selectedDestination}
        onValueChange={(itemValue) => setSelectedDestination(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a destination" value={null} />
        {destinations.map((destination) => (
          <Picker.Item
            key={destination.id}
            label={destination.name}
            value={destination.id}
          />
        ))}
      </Picker>

      <Text style={styles.label}>Start Date:</Text>
      <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
        <Text style={styles.dateButton}>{startDate.toDateString()}</Text>
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartDatePicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      <Text style={styles.label}>End Date:</Text>
      <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
        <Text style={styles.dateButton}>{endDate.toDateString()}</Text>
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndDatePicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddItinerary}>
        <Text style={styles.addButtonText}>Add Itinerary</Text>
      </TouchableOpacity>
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
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  dateButton: {
    fontSize: 16,
    color: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddItineraryScreen;
