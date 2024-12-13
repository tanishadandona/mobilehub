import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const PreferencesScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  const [language, setLanguage] = useState('English');

  const router = useRouter();

  const toggleNotifications = () => setNotificationsEnabled(previousState => !previousState);
  const toggleTheme = () => setDarkTheme(previousState => !previousState);

  const navigateToAbout = () => {
    router.push('/about');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Enable Notifications</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={notificationsEnabled ? '#007AFF' : '#f4f3f4'}
          onValueChange={toggleNotifications}
          value={notificationsEnabled}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Theme</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={darkTheme ? '#007AFF' : '#f4f3f4'}
          onValueChange={toggleTheme}
          value={darkTheme}
        />
      </View>

      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingText}>Language</Text>
        <View style={styles.languageContainer}>
          <Text style={styles.languageText}>{language}</Text>
          <Ionicons name="chevron-forward" size={24} color="black" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={navigateToAbout}>
        <Text style={styles.settingText}>About</Text>
        <Ionicons name="information-circle-outline" size={24} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: width > 600 ? 24 : 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  settingText: {
    fontSize: 18,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    marginRight: 10,
    fontSize: 18,
    color: '#666',
  },
});

export default PreferencesScreen;
