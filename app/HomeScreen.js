import React, { useEffect } from 'react';
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

const HomeScreenContent = ({ navigateTo }) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Insight Mate</Text>
      <View style={styles.featuresContainer}>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => router.push('ObjectDetection')}
        >
          <Image
            source={require('../assets/images/object.png')}
            style={styles.featureIcon}
          />
          <Text style={styles.featureText}>Object Detection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigateTo('map_object_detection')}
        >
          <Image
            source={require('../assets/images/Map.jpg')}
            style={styles.featureIcon}
          />
          <Text style={styles.featureText}>Map Navigation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => router.push('AI')}
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
          } else if (resultText.toLowerCase().includes('AI assistant')) {
            router.push('/AI');
          }
        }, 3000); // Record for 3 seconds
      } catch (error) {
        console.error('Error during recording:', error);
      }
    };

    const sendToDeepgram = async (audioBuffer) => {
      const apiKey = 'YOUR_DEEPGRAM_API_KEY'; // Replace with your Deepgram API key
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

    Speech.speak(welcomeMessage, {
      onDone: () => {
        setTimeout(() => {
          startRecording();
        }, 200); // Add a delay before starting the recording
      },
      pitch: 1.0,
      rate: 1.0,
    });
  }, []);

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
