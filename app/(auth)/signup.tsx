import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import firebase from 'firebase/compat/app';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from './config/firebaseConfig';

const SignUpScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
  
    try {
      // Create a new user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (user) {
        // Add user details to Firestore under 'users' collection
        await setDoc(doc(firestore, 'users', user.uid), {
          name,
          email,
        });
  
        Alert.alert('Sign Up Successful', 'You can now log in.');
        router.replace('/(auth)/Login'); // Navigate to the login screen
      }
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    }
  };
  // const handleSignUp = async () => {
  //   if (password !== confirmPassword) {
  //     Alert.alert('Error', 'Passwords do not match!');
  //     return;
  //   }
  //   try {
  //     const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
  //     const user = userCredential.user;

  //     if (user) {
  //       await firebase.firestore().collection('users').doc(user.uid).set({
  //         name,
  //         email,
  //       });
  //       Alert.alert('Sign Up Successful', 'You can now log in.');
  //       router.replace('/(auth)/Login'); // Navigate to the login screen after successful sign-up
  //     }
  //   } catch (error: any) {
  //     Alert.alert('Sign Up Error', error.message);
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Expl
          <Ionicons name="location-outline" size={25} color="#000" />
          re India
        </Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons name={passwordVisible ? 'eye' : 'eye-off'} size={24} color="black" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!passwordVisible}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.registerContainer}>
        <Text style={styles.text}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/Login')}>
          <Text style={styles.registerText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  form: {
    flex: 2,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    width: 400,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  signUpButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  text: {
    color: '#666',
  },
  registerText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
