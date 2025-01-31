import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Regex for email validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
// Regex for phone number validation (11 digits)
const phoneNumberRegex = /^[0-9]{11}$/;

const Signup = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!username.trim()) {
      Alert.alert('Invalid Username', 'Please enter a valid username');
      return;
    }

    if (!phoneNumber || !phoneNumberRegex.test(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 11-digit phone number');
      return;
    }

    if (!email || !emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      // Save user profile as a complete object
      const userProfile = {
        username,
        phone: phoneNumber,
        email,
        password,
        address: '', // You can later update this if needed
        imageUri: '', // Set the profile image URI later
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));

      Alert.alert('Success', 'Account created successfully!');
      router.push('/Login');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while saving your data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      {/* Username Input */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
      />

      {/* Phone Number Input */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        placeholderTextColor="#888"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
      />

      {/* Confirm Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={true}
        placeholderTextColor="#888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  signupButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Signup;
