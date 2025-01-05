import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Buffer } from 'buffer';

global.Buffer = global.Buffer || Buffer;

const HomeScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const welcomeMessage = "Welcome to Insight Mate, How May I Help You?";

    const startRecording = async () => {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          console.log('Permission to access microphone is required!');
          return;
        }

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await recording.startAsync();
        console.log('Recording started');

        setTimeout(async () => {
          await recording.stopAndUnloadAsync();
          console.log('Recording stopped');
          const uri = recording.getURI();
          const file = await fetch(uri);
          const buffer = await file.arrayBuffer();

          // Send the audio buffer to Deepgram API
          const resultText = await sendToDeepgram(buffer);
          console.log('Deepgram Response:', resultText);

          // Navigate based on the response
          if (resultText.toLowerCase().includes('detect object')) {
            router.push('/ObjectDetection');
          } else if (resultText.toLowerCase().includes('open map')) {
            router.push('/MapScreen');
          } else {
            router.push('/AI');
          }
        }, 3000); // Record for 5 seconds
      } catch (error) {
        console.error('Error during recording:', error);
      }
    };

    const sendToDeepgram = async (audioBuffer) => {
      const apiKey = '7626411a142c24bc75218732a32fd089a8810ba6'; // Replace with your Deepgram API key
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/wav',
          'Authorization': `Token ${apiKey}`,
        },
        body: audioBuffer,
      });

      const data = await response.json();
      return data.results?.channels[0]?.alternatives[0]?.transcript || '';
    };

    // Speak the welcome message and start recording after it's done
    Speech.speak(welcomeMessage, {
      onDone: () => {
        console.log('Welcome message complete. Starting recording after delay...');
       
        setTimeout(() => {
          startRecording();
        }, 100); // Add a delay of 1 second before starting the recording
      },
      
      pitch: 1.0,
      rate: 1.0

    });
  }, []);

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
  welcomeMessage: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20, // Space between welcome message and app name
    textAlign: 'center',
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
