import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import { firestore } from '../(auth)/config/firebaseConfig';
import { Destination } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const TRIBHUVAN_COORDS = {
  latitude: 27.697546,
  longitude: 85.359154,
};

// Define the type for a route, which is an array of coordinates
interface Route {
  latitude: number;
  longitude: number;
}

const MapScreen: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[][]>([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const snapshot = await firestore.collection('destinations').get();
        const data = snapshot.docs
          .map(doc => {
            const docData = doc.data() as Destination;
            if (docData.location && docData.location.latitude && docData.location.longitude) {
              return { ...docData, id: doc.id };
            } else {
              console.warn(`Document ${doc.id} is missing location data.`);
              return null;
            }
          })
          .filter((doc): doc is Destination => doc !== null);

        setDestinations(data);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (destinations.length > 0) {
        const fetchedRoutes: Route[][] = [];

        for (const destination of destinations) {
          const cacheKey = `${TRIBHUVAN_COORDS.latitude},${TRIBHUVAN_COORDS.longitude}-${destination.location.latitude},${destination.location.longitude}`;

          // Check if the route is already in AsyncStorage
          const cachedRoute = await AsyncStorage.getItem(cacheKey);
          if (cachedRoute) {
            fetchedRoutes.push(JSON.parse(cachedRoute));
            continue;
          }

          let attempts = 0;
          let success = false;
          let routeData: Route[] = [];

          while (attempts < 3 && !success) {
            try {
              const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${TRIBHUVAN_COORDS.longitude},${TRIBHUVAN_COORDS.latitude};${destination.location.longitude},${destination.location.latitude}?overview=full&geometries=geojson`
              );

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();

              if (data.routes && data.routes[0] && data.routes[0].geometry) {
                routeData = data.routes[0].geometry.coordinates.map((coord: number[]) => ({
                  latitude: coord[1],
                  longitude: coord[0],
                }));

                fetchedRoutes.push(routeData);
                await AsyncStorage.setItem(cacheKey, JSON.stringify(routeData)); // Save the route to AsyncStorage
                success = true;
              } else {
                console.warn(`No route found for destination: ${destination.name}`);
                break;
              }

              // Respect OSRM's rate limits
              if (destinations.indexOf(destination) < destinations.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between requests
              }

            } catch (error) {
              attempts += 1;
              console.error(`Error fetching route for ${destination.name} on attempt ${attempts}:`, error);
              if (attempts >= 3) {
                console.warn(`Failed to fetch route for ${destination.name} after ${attempts} attempts`);
              }
            }
          }
        }

        setRoutes(fetchedRoutes.filter(route => route.length > 0));
      }
    };

    fetchRoutes();
  }, [destinations]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  if (destinations.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No destinations available.</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: destinations[0]?.location?.latitude || 27.717245,
    longitude: destinations[0]?.location?.longitude || 85.32396,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
      >
        {destinations.map(destination => (
          <Marker
            key={destination.id}
            coordinate={{
              latitude: destination.location.latitude,
              longitude: destination.location.longitude,
            }}
            title={destination.name}
            description={destination.description}
          />
        ))}
        <Marker
          coordinate={TRIBHUVAN_COORDS}
          title="Tribhuvan International Airport"
          description="Starting point"
        />
        {routes.map((route, index) => (
          <Polyline
            key={index}
            coordinates={route}
            strokeWidth={3}
            strokeColor="hotpink"
          />
        ))}
      </MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: width,
    height: height,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;
