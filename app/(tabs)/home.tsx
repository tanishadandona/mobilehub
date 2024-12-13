import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ImageBackground,
  FlatList,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { firestore, auth } from '../(auth)/config/firebaseConfig';
import CategoryIcon from '../../components/CategoryIcon';
import globalStyles from '../../styles/globalStyles';
import { Destination } from '../../navigation/types';
import firebase from 'firebase/compat/app';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [initialDestinations, setInitialDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0); // New state for notification count
  const router = useRouter();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const userDoc = await firestore.collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            setUserName(userDoc.data()?.name || 'User');
          }
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };

    const fetchInitialDestinations = async () => {
      try {
        setLoading(true);
        const snapshot = await firestore.collection('destinations').get();
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Destination[];

        const shuffled = data.sort(() => 0.5 - Math.random());
        const selectedDestinations = shuffled.slice(0, 5);
        setAllDestinations(data); // Store all destinations
        setInitialDestinations(selectedDestinations); // Store only the 5 randomly selected ones
        setFilteredDestinations(selectedDestinations); // Initially show the 5 selected destinations
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotificationCount = async () => {
      try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        setNotificationCount(scheduledNotifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUserName();
    fetchInitialDestinations();
    fetchNotificationCount();

    const subscription = Notifications.addNotificationReceivedListener(() => {
      fetchNotificationCount(); // Update count when a notification is received
    });

    return () => subscription.remove(); // Cleanup
  }, []);

  const fetchFilteredDestinations = (query: string, category: string | null) => {
    let results = allDestinations;

    if (category) {
      results = results.filter((destination) => destination.category.toLowerCase() === category.toLowerCase());
    }

    if (query) {
      results = results.filter((destination) =>
        destination.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredDestinations(results);
  };

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Deselect category
      setFilteredDestinations(initialDestinations); // Show the initial 5 destinations
    } else {
      setSelectedCategory(category); // Select new category
      fetchFilteredDestinations(searchQuery, category);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchFilteredDestinations(query, selectedCategory);
  };

  const handleNotificationPress = () => {
    router.push('/notifications'); // Navigate to the notifications screen
  };

  const renderItem = ({ item }: { item: Destination }) => (
    <Pressable onPress={() => router.push(`/destinationDetail?destination=${encodeURIComponent(JSON.stringify(item))}`)}>
      <View style={styles.destinationCard}>
        <ImageBackground source={{ uri: item.imageUrl }} style={styles.destinationImage} />
        <View style={styles.destinationTextContainer}>
          <Text style={styles.destinationName}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={16} color="black" style={styles.chevronIcon} />
        </View>
      </View>
    </Pressable>
  );

  const ListHeaderComponent = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi {userName}!</Text>
        <Pressable onPress={handleNotificationPress} style={styles.notificationIconContainer}>
          <Ionicons name="notifications-outline" size={24} color="black" style={styles.notificationIcon} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search your destination"
        placeholderTextColor={Platform.OS === 'ios' ? '#8e8e93' : undefined} // Adjust placeholder color for iOS
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoriesContainer}>
        <Pressable
          style={[
            styles.categoryCard,
            selectedCategory === 'Historical' && styles.selectedCategoryCard,
          ]}
          onPress={() => handleCategoryPress('Historical')}
        >
          <CategoryIcon icon={require('../../assets/icons/Historical.png')} label="Historical" />
        </Pressable>
        <Pressable
          style={[
            styles.categoryCard,
            selectedCategory === 'Adventure' && styles.selectedCategoryCard,
          ]}
          onPress={() => handleCategoryPress('Adventure')}
        >
          <CategoryIcon icon={require('../../assets/icons/Adventure.png')} label="Adventure" />
        </Pressable>
        <Pressable
          style={[
            styles.categoryCard,
            selectedCategory === 'Nature' && styles.selectedCategoryCard,
          ]}
          onPress={() => handleCategoryPress('Nature')}
        >
          <CategoryIcon icon={require('../../assets/icons/Nature.png')} label="Nature" />
        </Pressable>
      </View>
      <Text style={styles.sectionTitle}>Featured Destination</Text>
    </>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredDestinations}
          numColumns={width > 600 ? 3 : 2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={styles.featuredScrollContainer}
          columnWrapperStyle={width > 600 ? styles.columnWrapper : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: width > 600 ? 30 : 24,
    fontWeight: 'bold',
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationIcon: {
    marginRight: 10,
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchBar: {
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    alignItems: 'center',
  },
  selectedCategoryCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  sectionTitle: {
    fontSize: width > 600 ? 22 : 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  destinationCard: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: width > 600 ? 250 : 200,
    alignItems: 'center',
  },
  destinationImage: {
    width: '100%',
    height: width > 600 ? 200 : 150,
  },
  destinationTextContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationName: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  chevronIcon: {
    marginLeft: 10,
  },
  featuredScrollContainer: {
    paddingHorizontal: 10,
  },
  columnWrapper: {
    justifyContent: 'space-around',
  },
});

export default HomeScreen;
