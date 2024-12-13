import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import firebase, { firestore } from '../(auth)/config/firebaseConfig';
import { Destination } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const DestinationsScreen: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    // const fetchDestinations = async () => {
    //   try {
    //     const snapshot = await firestore.collection('destinations').get();
    //     const data = snapshot.docs.map((doc) => ({
    //       id: doc.id,
    //       ...doc.data(),
    //     })) as Destination[];
    //     setDestinations(data);
    //     setFilteredDestinations(data); // Initially show all destinations
    //   } catch (error) {
    //     console.error('Error fetching destinations:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    const fetchDestinations = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, 'destinations'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Destination[];
        setDestinations(data);
        setFilteredDestinations(data); // Initially show all destinations
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setLoading(false);
      }
    };
    

    fetchDestinations();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredDestinations(destinations);
    } else {
      const filteredData = destinations.filter((destination) =>
        destination.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDestinations(filteredData);
    }
  };

  const renderItem = ({ item }: { item: Destination }) => (
    <Pressable onPress={() => router.push(`/destinationDetail?destination=${encodeURIComponent(JSON.stringify(item))}`)}>
      <View style={styles.destinationCard}>
        <ImageBackground source={{ uri: item.imageUrl }} style={styles.destinationImage}>
          <View style={styles.destinationTextContainer}>
            <Text style={styles.destinationName}>{item.name}</Text>
          </View>
        </ImageBackground>
      </View>
    </Pressable>
  );

  const ListHeaderComponent = () => (
    <>
      <TextInput
        style={[
          styles.searchBar,
          Platform.OS === 'ios' ? styles.searchBarIOS : styles.searchBarAndroid,
        ]}
        placeholder="Search your destination"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <Text style={styles.sectionTitle}>Destinations</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredDestinations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={ListHeaderComponent}
          numColumns={width > 600 ? 3 : 2}
          columnWrapperStyle={styles.columnWrapper}
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
  list: {
    paddingBottom: 20,
  },
  searchBar: {
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 20,
  },
  searchBarIOS: {
    // Specific styles for iOS
  },
  searchBarAndroid: {
    // Specific styles for Android
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  destinationCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: width > 600 ? 350 : 200,
  },
  destinationImage: {
    width: '100%',
    height: width / 3.5,
  },
  destinationName: {
    fontSize: width > 600 ? 22 : 15,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
  destinationTextContainer: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  columnWrapper: {
    justifyContent: 'space-around',
  },
});

export default DestinationsScreen;
