import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const DestinationCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <Text style={styles.title}>Destination Name</Text>
      <Text style={styles.description}>Brief description of the destination.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginRight: 15,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default DestinationCard;
