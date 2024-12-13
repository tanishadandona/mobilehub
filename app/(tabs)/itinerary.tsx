import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { firestore, auth } from '../(auth)/config/firebaseConfig';
import { Itinerary, Destination } from '../../navigation/types';

const { width } = Dimensions.get('window');

const ItineraryScreen: React.FC = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [destinations, setDestinations] = useState<Record<string, Destination>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    const fetchDestinations = async () => {
      try {
        const snapshot = await firestore.collection('destinations').get();
        const data = snapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data() as Destination;
          return acc;
        }, {} as Record<string, Destination>);
        setDestinations(data);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      }
    };

    const fetchItineraries = async () => {
      try {
        console.log('Fetching itineraries for user ID:', currentUser.uid); // Debugging log
        const snapshot = await firestore
          .collection('itineraries')
          .where('userId', '==', currentUser.uid) // Filter by current user
          .get();

        if (snapshot.empty) {
          console.log('No itineraries found for this user.'); // Debugging log
        } else {
          console.log('Itineraries fetched successfully.'); // Debugging log
        }

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Itinerary[];

        setItineraries(data);
      } catch (error) {
        console.error('Error fetching itineraries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
    fetchItineraries();
  }, [currentUser]);

  const handleDeleteItinerary = async (id: string) => {
    Alert.alert(
      'Delete Itinerary',
      'Are you sure you want to delete this itinerary?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore.collection('itineraries').doc(id).delete();
              setItineraries(itineraries.filter((itinerary) => itinerary.id !== id));
              Alert.alert('Itinerary deleted successfully!');
            } catch (error) {
              console.error('Error deleting itinerary:', error);
              Alert.alert('Error deleting itinerary:', error.message);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Itinerary }) => {
    const destination = destinations[item.destinationId];

    return (
      <TouchableOpacity
        style={styles.itineraryCard}
        onPress={() => router.push(`/itineraryDetail/${item.id || 'default-id'}`)}
      >
        {destination && (
          <View style={styles.cardContent}>
            <Image
              source={{ uri: destination.imageUrl }}
              style={styles.destinationImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.itineraryName}>{destination.name}</Text>
              <Text style={styles.itineraryDates}>
                {new Date(item.startDate).toDateString()} -{' '}
                {new Date(item.endDate).toDateString()}
              </Text>
              <Text style={styles.itineraryCategory}>{destination.category}</Text>
            </View>
          </View>
        )}
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => router.push(`/editItinerary/${item.id || 'default-id'}`)}
          >
            <Ionicons name="pencil" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteIcon}
            onPress={() => handleDeleteItinerary(item.id || 'default-id')}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddItinerary = () => {
    router.push('/addItinerary'); // Navigate to the add itinerary screen
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : itineraries.length === 0 ? ( // Handle case where no itineraries exist
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No itineraries found. Add one now!</Text>
        </View>
      ) : (
        <FlatList
          data={itineraries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || 'default-key'}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={handleAddItinerary}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 80, // Leave space for the floating button
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
  },
  itineraryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  destinationImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  itineraryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itineraryDates: {
    fontSize: 14,
    color: '#555',
  },
  itineraryCategory: {
    fontSize: 12,
    color: '#888',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    padding: 5,
  },
  deleteIcon: {
    padding: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ItineraryScreen;
