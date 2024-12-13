import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthState } from 'react-firebase-hooks/auth';
// import { auth } from '../config/firebaseConfig';
import { auth, firestore } from '../config/firebaseConfig';
import { getAuth } from 'firebase/auth';

export default function RootLayout() {
  const router = useRouter();
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is logged in, navigate to the home screen
        router.replace('/(tabs)/home');
      } else {
        // If not, navigate to the login screen
        router.replace('/(auth)/Login');
      }
    }
  }, [user, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/Login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
      <Stack.Screen name="destinationDetail" options={{ headerShown: true, headerBackTitleVisible: false, title: 'Destination Details' }} />
      <Stack.Screen name="itineraryDetail/[id]" options={{ headerShown: false, headerBackTitleVisible: false, title: 'Itinerary Detail' }} />
    </Stack>
  );
}
