import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';

const Splash = () => {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0); // Initial opacity value

  useEffect(() => {
    // Fade in the splash logo and add delay before navigation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000, // Increased fade-in duration
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        router.replace('/HomeScreen'); // Adjust path based on your app structure
      }, 1500); // Add delay before navigating
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
    width: 220, // Slightly larger than the image
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
    borderRadius: 100, // Smooth the image edges
    resizeMode: 'contain', // Ensure the image fits well
  },
});

export default Splash;
