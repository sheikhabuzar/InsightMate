import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Buffer } from 'buffer';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from './Profile';
import Alerts from './Alerts';
import MyFamily from './MyFamily';
import SavedLocations from './SavedLocations';
import Logout from './Logout';
import EmergencyContacts from './EmergencyContacts';

global.Buffer = global.Buffer || Buffer;
const recordingRef = useRef(null); 


const HomeScreenContent = ({ navigateTo }) => {
  const router = useRouter();

  const handleNavigation = (route) => {

    Speech.stop();

    if (navigateTo) onNavigate();
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Insight Mate</Text>
      <View style={styles.featuresContainer}>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => handleNavigation('ObjectDetection')}
        >
          <Image
            source={require('../assets/images/object.png')}
            style={styles.featureIcon}
          />
          <Text style={styles.featureText}>Object Detection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => handleNavigation('MapScreen')}
        >
          <Image
            source={require('../assets/images/Map.jpg')}
            style={styles.featureIcon}
          />
          <Text style={styles.featureText}>Map Navigation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => handleNavigation('AI')}
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
          onPress
          
        />
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen = () => {
  const router = useRouter();
  // Reference to manage recording instance

  useEffect(() => {
    const welcomeMessage = "Home Page";

    Speech.speak(welcomeMessage, {
      onDone: () => {
        console.log('Welcome message complete. Starting recording after delay...');
        setTimeout(() => {
          startRecording();
        }, 500); // Add a small delay before starting the recording
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

const startRecording = async () => {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          console.log('Permission to access microphone is required!');
          return;
        }


            ///////////////////////////////////////////////////////
          if (recordingRef.current) {
           try {
              if (recordingRef.current.getStatusAsync) {
            const status = await recordingRef.current.getStatusAsync();
           if (status.isRecording) {
             await recordingRef.current.stopAndUnloadAsync();
           }
            }
              recordingRef.current = null; // Clear the reference after stopping
         } catch (error) {
            console.error("Error while stopping/unloading recording:", error);
                }
           }
/////////////////////////////////////

        const recording = new Audio.Recording();
        recordingRef.current = recording; // Store the recording instance
        await recording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await recording.startAsync();
        Speech.speak('Listening');

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
            if (resultText.toLowerCase().includes('open detection')|| resultText.toLowerCase().includes('detection')
            || resultText.toLowerCase().includes('object')) {
              router.push('/ObjectDetection');
            } else if (resultText.toLowerCase().includes('open map') || resultText.toLowerCase().includes('map')) {
              router.push('/MapScreen');
            } else if (resultText.toLowerCase().includes('open assistance') || resultText.toLowerCase().includes('assistance')
            || resultText.toLowerCase().includes('ai')) {
              router.push('/AI');
            } else {
            startRecording();
            }
          }
        }, 10000); // Record for 7 seconds
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
  


  const Drawer = createDrawerNavigator();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#f2f2f2' },
          headerTintColor: '#212121',
          drawerActiveTintColor: '#007AFF',
          drawerInactiveTintColor: '#333',
          drawerStyle: { backgroundColor: '#f8f8f8', width: 250 },
        }}
      >
        <Drawer.Screen
          name="Home"
          options={{
            title: 'Home',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        >
          {(props) => <HomeScreenContent {...props} />}
        </Drawer.Screen>
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profile',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="MyFamily"
          component={MyFamily}
          options={{
            title: 'My Family',
            drawerIcon: () => (
              <Image
                source={require('../assets/images/family.jpg')}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="SavedLocations"
          component={SavedLocations}
          options={{
            title: 'Saved Locations',
            drawerIcon: () => (
              <Image
                source={require('../assets/images/Visitedlocation.png')}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="EmergencyContacts"
          component={EmergencyContacts}
          options={{
            title: 'Emergency Contacts',
            drawerIcon: () => (
              <Image
                source={require('../assets/images/emer.jpg')}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Alerts"
          component={Alerts}
          options={{
            title: 'Alerts',
            drawerIcon: () => (
              <Image
                source={require('../assets/images/Alerts.png')}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Logout"
          component={Logout}
          options={{
            title: 'Logout',
            drawerIcon: () => (
              <Image
                source={require('../assets/images/logout.png')}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />
      </Drawer.Navigator>
    </GestureHandlerRootView>
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
    width: 60,
    height: 60,
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
