import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Regular expression for validating phone number (example for US-based format)
const phoneNumberRegex = /^[0-9]{11}$/;

// Regular expression for validating strong password
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

const Login = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');  // Add email state
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    await AsyncStorage.setItem('userLoggedIn', 'true'); // Add this line
    if (!phoneNumber || !password || !email) { // Check email as well
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!phoneNumberRegex.test(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    try {
      const savedPhoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      const savedPassword = await AsyncStorage.getItem('userPassword');

      if (savedPhoneNumber === phoneNumber && savedPassword === password) {
        console.log('Logged in successfully');

        // Store login state
        await AsyncStorage.setItem('userLoggedIn', 'true');
        
        // Save profile details including email
        const profileDetails = {
          name: 'User Name',  // you can fetch these from your signup or other sources
          phone: phoneNumber,
          address: 'User Address', // You can add address or other details here
          email: email, // Save email as well
        };
        await AsyncStorage.setItem('userProfile', JSON.stringify(profileDetails)); // Save profile

        router.replace('/HomeScreen'); // Navigate to home screen
      } else {
        Alert.alert('Invalid Credentials', 'The phone number or password is incorrect.');
      }
    } catch (error) {
      console.error('Error reading AsyncStorage', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Phone number input without country code */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        placeholderTextColor="#888"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      {/* Email input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}  // Save the email
      />

      {/* Password input with show/hide functionality */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!isPasswordVisible}
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setPasswordVisible(!isPasswordVisible)}
        >
          <Image
            style={styles.eyeImage}
            source={
              isPasswordVisible
                ? require('../assets/images/eye-open.png') // Import the "show password" icon
                : require('../assets/images/eye-closed.png') // Import the "hide password" icon
            }
          />
        </TouchableOpacity>
      </View>

      {/* Forget password button */}
      <TouchableOpacity
        style={styles.forgetPasswordButton}
        onPress={() => router.push('/ForgetPassword')}
      >
        <Text style={styles.forgetPasswordText}>Forget Password?</Text>
      </TouchableOpacity>

      {/* Login button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign up link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>New on the app? </Text>
        <TouchableOpacity onPress={() => router.push('/Signup')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 15, // Adds spacing between inputs
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  eyeImage: {
    width: 24,
    height: 24,
  },
  forgetPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgetPasswordText: {
    color: '#007BFF',
    fontSize: 14,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#333',
  },
  signupLink: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default Login;
