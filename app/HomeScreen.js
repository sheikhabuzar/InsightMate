import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();

  const navigateTo = (screen) => {
    router.push(`/${screen}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Insight Mate</Text>
      <View style={styles.featuresContainer}>
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => navigateTo('ObjectDetection')}
        >
          <Image
            source={require('../assets/images/object.png')}
            style={styles.featureIcon}
          />
          <Text style={styles.featureText}>Object Detection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigateTo('MapScreen')}
        >
          <Image
            source={require('../assets/images/Map.jpg')}
            style={styles.featureIcon}
          />
          <Text style={styles.featureText}>Map Navigation</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.featureCard}
          onPress={() => navigateTo('AI')}
        >
          <Image
            source={require('../assets/images/AI.jpg')}
            style={styles.featureIcon}
          />
          <Text style={styles.featureText}>AI Assistant</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.micIconContainer}>
        <Image
          source={require('../assets/images/mic.png')}
          style={styles.micIcon}
        />
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Align content from the top
    alignItems: 'center',
    backgroundColor: '#f2f2f2', // Background color of the screen
    paddingTop: 30, // Adding top padding for the app name
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40, // Space between app name and feature buttons
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'column', // Change from row to column for vertical stacking
    justifyContent: 'center', // Center the items vertically
    alignItems: 'center', // Center the items horizontally
    width: '100%', // Use full width for the container
    marginBottom: 30, // Space between features and mic icon
  },
  featureCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '80%', // Adjust width to fit the cards vertically
    marginBottom: 20, // Space between cards
    elevation: 3, // Optional shadow for the cards
    marginTop: 30,
    backgroundColor: 'transparent', // Remove blue background
  },
  featureIcon: {
    width: 40,
    height: 40,
    marginBottom: 10, // Space between icon and text
  },
  featureText: {
    color: '#333', // Set text color to dark for better readability
    fontSize: 16,
    fontWeight: 'bold',
  },
  micIconContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    elevation: 10, // Adds elevation to make the mic hover
  },
  micIcon: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular icon
  },
});

export default HomeScreen;
