import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

type CategoryIconProps = {
  icon: any;
  label: string;
};

const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, label }) => {
  return (
    <View style={styles.container}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
  label: {
    marginTop: 5,
    fontSize: 14,
  },
});

export default CategoryIcon;
