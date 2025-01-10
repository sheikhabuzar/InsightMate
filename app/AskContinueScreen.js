import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import { Buffer } from 'buffer';

global.Buffer = global.Buffer || Buffer;

const AskContinueScreen = () => {
  const router = useRouter();
  const webviewRef = useRef(null); // Initialize WebView reference
  const [labels, setLabels] = useState([]); // Manage object labels (if needed)

  // Function to send audio buffer to Deepgram API
    useEffect(() => {
      const welcomeMessage = "Camera not moving. Do you want to detect more objects? Please say yes or no";
  
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
            if (resultText.toLowerCase().includes('yes')) {
              router.push('/ObjectDetection');
            } else if (resultText.toLowerCase().includes('no')) {
              router.push('/HomeScreen');
            } else  {
  Speech.speak('invalid responce so back to home screen.');
              router.push('/HomeScreen');
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
         // console.log('Welcome message complete. Starting recording after delay...');
         
          setTimeout(() => {
            startRecording();
          }, 200); // Add a delay of 1 second before starting the recording
        },
        
        pitch: 1.0,
        rate: 1.0
  
      });
    }, []);

  // Start interaction on mount
  
      

   

  // WebView message handler
  const handleMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('Message from WebView:', message);
    setLabels((prev) => [...prev, message]);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.heading}>Object Detection</Text>
      <WebView
        ref={webviewRef}
        source={{ uri: 'https://shafqatwarraich.github.io/cam/cam.html' }}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        startInLoadingState
        onMessage={handleMessage}
        onError={(error) => console.error(error)}
      />
      
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>
          Camera not moving. Do you want to detect more objects? Please say yes or no.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
  labelsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default AskContinueScreen;
