import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Layout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if the user is already logged in
        const userPhoneNumber = await AsyncStorage.getItem('userPhoneNumber');
        const userPassword = await AsyncStorage.getItem('userPassword');

        if (userPhoneNumber && userPassword) {
          setIsLoggedIn(true);
          router.replace('/HomeScreen'); // Navigate to HomeScreen if logged in
        } else {
          setIsLoggedIn(false);
          router.replace('/Login'); // Navigate to Login if not logged in
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        router.replace('/Login');
      } finally {
        setIsLoading(false); // Stop showing loader
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    // Show loading spinner while checking login state
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return <Slot />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
});

export default Layout;
