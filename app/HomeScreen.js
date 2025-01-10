import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Buffer } from 'buffer';

global.Buffer = global.Buffer || Buffer;

const HomeScreen = () => {
  const router = useRouter();
  const recordingRef = useRef(null); // Reference to manage recording instance

  useEffect(() => {
    const welcomeMessage = "Home Page";

    const startRecording = async () => {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          console.log('Permission to access microphone is required!');
          return;
        }

        const recording = new Audio.Recording();
        recordingRef.current = recording; // Store the recording instance
        await recording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await recording.startAsync();
        console.log('Recording started');

        setTimeout(async () => {
          if (recordingRef.current) {
            await recording.stopAndUnloadAsync();
            console.log('Recording stopped');
            const uri = recording.getURI();
            const file = await fetch(uri);
            const buffer = await file.arrayBuffer();

            // Send the audio buffer to Deepgram API
            const resultText = await sendToDeepgram(buffer);
            console.log('Deepgram Response:', resultText);

            // Navigate based on the response
            if (resultText.toLowerCase().includes('open detection')) {
              router.push('/ObjectDetection');
            } else if (resultText.toLowerCase().includes('open map')) {
              router.push('/MapScreen');
            } else if (resultText.toLowerCase().includes('open assistance')) {
              router.push('/AI');
            } else {
              router.push('/HomeScreen');
            }
          }
        }, 3000); // Record for 3 seconds
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
        }, 100); // Add a small delay before starting the recording
      },
      pitch: 1.0,
      rate: 1.0,
    });

    // Cleanup function
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch((err) => {
          console.log('Error during cleanup:', err);
        });
        recordingRef.current = null;
      }
      console.log('Cleanup complete: HomeScreen unmounted.');
    };
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
          onPress={() => navigateTo('LocationScreen')}
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingTop: 30,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  featureCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '80%',
    marginBottom: 20,
    elevation: 3,
    marginTop: 30,
    backgroundColor: 'transparent',
  },
  featureIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  featureText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  micIconContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    elevation: 10,
  },
  micIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default HomeScreen;
