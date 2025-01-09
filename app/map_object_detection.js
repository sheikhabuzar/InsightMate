import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import GoogleMap from './MapScreen'; // Assuming you saved the GoogleMap component in a file named GoogleMap.js
import CameraWebViewWithAutoCapture from './ObjectDetection'; // Assuming you saved the CameraWebViewWithAutoCapture component in a file named CameraWebViewWithAutoCapture.js

const MainScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
     

      {/* Content */}
      <View style={styles.content}>
        {/* Google Map (70% height) */}
        <View style={styles.mapContainer}>
   
          <GoogleMap />
        </View>

        {/* Object Detection (30% height) */}
       <View style={styles.cameraContainer}>
     
          <CameraWebViewWithAutoCapture />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    flex: 7.3, // 70% of the screen
    backgroundColor: '#f0f0f0', // Optional for visual distinction
    marginBottom: 10,
  },
  cameraContainer: {
    flex: 2.7, // 30% of the screen
    backgroundColor: '#e8e8e8', // Optional for visual distinction
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default MainScreen;
