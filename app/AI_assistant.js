import React, { useState } from "react";
import { StyleSheet, View, Button, Text, PermissionsAndroid, Platform } from "react-native";

import axios from "axios";

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("Press the button to start speaking...");

  const DEEPGRAM_API_KEY = "7626411a142c24bc75218732a32fd089a8810ba6";

  
  const requestMicrophonePermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Microphone Permission",
          message: "This app requires access to your microphone.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // Start recording audio
  const startRecording = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      setTranscript("Permission denied. Cannot record audio.");
      return;
    }

    setIsRecording(true);
    setTranscript("Listening...");

    Voice.onSpeechResults = (e) => {
      const speechData = e.value[0]; 
      processSpeechWithDeepgram(speechData);
    };

    try {
      await Voice.start("en-US"); 
    } catch (error) {
      console.error("Error starting voice recognition:", error);
    }
  };

  
  const stopRecording = async () => {
    setIsRecording(false);
    try {
      await Voice.stop();
    } catch (error) {
      console.error("Error stopping voice recognition:", error);
    }
  };

  const processSpeechWithDeepgram = async (speechData) => {
    try {
      const response = await axios.post(
        "https://api.deepgram.com/v1/listen",
        speechData,
        {
          headers: {
            Authorization: `Token ${DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const deepgramResult = response.data.results.channels[0].alternatives[0].transcript;
      setTranscript(deepgramResult || "Unable to recognize speech.");
    } catch (error) {
      console.error("Error processing speech with Deepgram:", error);
      setTranscript("Error occurred while processing speech.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.transcript}>{transcript}</Text>
      <Button
        title={isRecording ? "Stop Recording" : "Start Recording"}
        onPress={isRecording ? stopRecording : startRecording}
        color={isRecording ? "red" : "blue"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  transcript: {
    fontSize: 18,
    margin: 20,
    textAlign: "center",
    color: "#333",
  },
});

export default App;
