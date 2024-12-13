import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AboutScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* <Image 
        source={{ uri: '' }} 
        style={styles.logo}
      /> */}
      <Text style={styles.title}>Expl
          <Ionicons name="location-outline" size={25} color="#000" />
          re India</Text>
      <Text style={styles.text}>
        Explore India is your ultimate travel companion app for exploring the beautiful landscapes, rich culture, and historical landmarks of India. Whether you're planning a trek to the Everest Base Camp, a visit to the tranquil Rara Lake, or exploring the bustling streets of Kathmandu, Explore India provides you with all the information you need.
      </Text>
      <Text style={styles.text}>
        Key features include:
        - Detailed destination guides with images and travel tips.
        - Customizable itineraries to plan your journey.
        - Interactive maps with real-time routing and destination markers.
      </Text>
      <Text style={styles.text}>
        We are committed to enhancing your travel experience by providing accurate, up-to-date information and user-friendly features.
      </Text>
      <Text style={styles.version}>Version 1.0.0</Text>
      <Text style={styles.copyright}>© 2024 Explore India. All rights reserved.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  version: {
    fontSize: 14,
    marginTop: 20,
    color: '#666',
  },
  copyright: {
    fontSize: 12,
    marginTop: 10,
    color: '#aaa',
  },
});

export default AboutScreen;
