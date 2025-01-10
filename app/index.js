import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = () => {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0); // Initial opacity value

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userPhoneNumber = await AsyncStorage.getItem('userPhoneNumber');
        const userPassword = await AsyncStorage.getItem('userPassword');

        setTimeout(() => {
          if (userPhoneNumber && userPassword) {
            router.replace('/HomeScreen'); // User is logged in, go to HomeScreen
          } else {
            router.replace('/Login'); // User is NOT logged in, go to Login screen
          }
        }, 1500); // Short delay after animation
      } catch (error) {
        console.error('Error checking login status:', error);
        router.replace('/Login'); // Default to login on error
      }
    };

    // Fade in the splash logo and add delay before navigation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000, // Fade-in duration
      useNativeDriver: true,
    }).start(() => {
      checkLoginStatus();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.Image
          source={require('../assets/images/eye.png')}
          style={styles.image}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121721', // Match the background with the image
  },
  imageWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121721', // Match the background
    borderRadius: 110, // Circular shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15, // Shadow for Android
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    resizeMode: 'contain', // Ensure the image fits well
  },
});

export default Splash;
