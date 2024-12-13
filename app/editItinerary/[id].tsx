import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth,firestore } from '../(auth)/config/firebaseConfig';
import { Itinerary, Destination } from '../../navigation/types';
import { useLocalSearchParams } from 'expo-router';
import * as Notifications from 'expo-notifications';

const EditItineraryScreen: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end' | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useLocalSearchParams();
  const itineraryId = Array.isArray(id) ? id[0] : id ?? pathname.split('/').pop();

  useEffect(() => {
    if (!itineraryId || itineraryId === '[id]') {
      Alert.alert('Invalid Itinerary ID');
      router.push('/itinerary');
      return;
    }

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

    const fetchItinerary = async () => {
      try {
        const doc = await firestore.collection('itineraries').doc(itineraryId).get();
        if (doc.exists) {
          const itineraryData = doc.data() as Itinerary;
          setItinerary(itineraryData);
          setSelectedDestination(itineraryData.destinationId);
          setStartDate(new Date(itineraryData.startDate));
          setEndDate(new Date(itineraryData.endDate));
        } else {
          Alert.alert('Itinerary not found');
          router.push('/itinerary');
        }
      } catch (error) {
        console.error('Error fetching itinerary:', error);
        Alert.alert('Error fetching itinerary:', error.message);
      }
    };

    fetchDestinations();
    fetchItinerary();
  }, [itineraryId]);

  const handleUpdateItinerary = async () => {
    if (!selectedDestination) {
      Alert.alert('Please select a destination.');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('End date must be after start date.');
      return;
    }

    try {
      const itineraryRef = firestore.collection('itineraries').doc(itineraryId);
      const doc = await itineraryRef.get();
      if (!doc.exists) {
        throw new Error('Itinerary not found.');
      }

      const existingItinerary = doc.data() as Itinerary;
      const shouldResetActivities =
        existingItinerary.destinationId !== selectedDestination;

      const updatedItinerary: Partial<Itinerary> = {
        destinationId: selectedDestination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        activities: shouldResetActivities ? [] : existingItinerary.activities,
        userId: auth.currentUser?.uid || '', // Add userId here
      };

      await itineraryRef.update(updatedItinerary);

      // Adjust the notification trigger logic based on how close the trip is
      let triggerDate = new Date(startDate);
      const now = new Date();

      if (startDate.getDate() === now.getDate() && startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()) {
        triggerDate = new Date(now.getTime() + 10000); // Trigger in 10 seconds
      } else if (startDate.getDate() - now.getDate() === 1) {
        triggerDate.setHours(20, 0, 0); // Notify today at 8:00 PM
      } else {
        triggerDate.setDate(triggerDate.getDate() - 1);
        triggerDate.setHours(9, 0, 0); // Notify at 9:00 AM the day before
      }

      if (triggerDate <= now) {
        Alert.alert('Invalid Notification Date', 'The notification date is in the past or too close.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Upcoming Trip Reminder",
          body: `Your trip to ${destinations.find(d => d.id === selectedDestination)?.name} starts tomorrow!`,
          data: { itineraryId },
        },
        trigger: { date: triggerDate },
      });

      Alert.alert('Itinerary updated!');
      router.push('/itinerary'); // Navigate back to the itinerary list
    } catch (error) {
      Alert.alert('Error updating itinerary:', error.message);
      console.error('Error updating itinerary:', error);
    }
  };

  const showDatePicker = (mode: 'start' | 'end') => {
    setDatePickerMode(mode);
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    if (datePickerMode === 'start' && selectedDate) {
      setStartDate(selectedDate);
    } else if (datePickerMode === 'end' && selectedDate) {
      setEndDate(selectedDate);
    }
    setDatePickerMode(null);
  };

  if (!itinerary) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading itinerary details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Itinerary</Text>
          </View>

          <Text style={styles.label}>Select Destination:</Text>
          <Picker
            selectedValue={selectedDestination}
            onValueChange={(itemValue) => setSelectedDestination(itemValue)}
            style={[styles.picker, { height: Platform.OS === 'ios' ? 200 : 50 }]}
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
          <Button
            title={startDate.toDateString()}
            onPress={() => showDatePicker('start')}
          />
          {datePickerMode === 'start' && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <Text style={styles.label}>End Date:</Text>
          <Button
            title={endDate.toDateString()}
            onPress={() => showDatePicker('end')}
          />
          {datePickerMode === 'end' && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdateItinerary}>
              <Text style={styles.updateButtonText}>Update Itinerary</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
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
  loadingText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
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
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditItineraryScreen;
