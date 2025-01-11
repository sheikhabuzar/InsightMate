import React, { useEffect, useState,useRef } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, BackHandler } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import * as LocationGeocoding from "expo-location";
import { decode } from "html-entities";
import * as Speech from "expo-speech";
import { useRouter } from 'expo-router';

//////////////
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import axios from 'axios';
import ObjectDetectionScreen from "./objectmap";



/////////

const GoogleMap = () => {
  const [currentLocation1, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [destination1, setDestination] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentAddress, setCurrentAddress] = useState("Fetching location...");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [directions, setDirections] = useState([]);
  const [footerVisible, setFooterVisible] = useState(false);
  const [travelSummary, setTravelSummary] = useState({});
  const [showCamera, setShowCamera] = useState(false);
const [directionsLoaded, setDirectionsLoaded] = useState(false);
const [isDirectionsLoaded, setIsDirectionsLoaded] = useState(false);
const [mapHeight, setMapHeight] = useState('80%');
  const GOOGLE_API_KEY = "AIzaSyBxCwHntkDBpBr_ZLIU4nBh4Ywi4rEUW58"; // Replace with your actual API key
  const revAccessToken = "02SVTgaqr-HbZO9N3-hPglv4aItscINrmNC98UyMT2ZjWsm17knqL_YtqjqVrAKs-fwEg-KDrNsEGfSkykvCKesxZQBlw"; //////////////
  let destination="";
  let currentLocation="";
  const recordingRef = useRef(null);
  const router = useRouter();
  
  
  
  
  useEffect(() => {
    
    Speech.speak('Map Page', {
      onDone: ()=>
        {
        initializeMap();
        startRecording();
      }
    });
    
  }, []);
  
  // The fucntion is used to stop recording and Speech Instance
  const handleBackButton =  async() =>  {
    
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
    Speech.stop(); // Stop any ongoing speech
    router.replace('/HomeScreen');
    return; // Navigate to HomeScreen
  };
  
  const initializeMap = async () => {
  await fetchLocation();
    
  };
  
  // Recording function for Destination
  const startRecording = async () => {
    try {
      // Unload previous recording if it exists
      
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
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Speech.speak("Permission Denied. Microphone access is required.");
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const recording = new Audio.Recording();
      recordingRef.current = recording;
      
      await recording.prepareToRecordAsync({
        android: {
          extension: ".mp3",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        },
        ios: {
          extension: ".mp3",
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
      });
      
      await recording.startAsync();
      Speech.speak("Listening");
      console.log('Recording for Destination Started->');
      
      setTimeout(async () => {
        

      
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped Of Destination');
        
        
        
        
        const transcript = await transcribeAudio(uri);
        
        let homechk=transcript.trim().toLowerCase();
        homechk = homechk.replace(/\./g, "");///////////////////////////////////
        homechk = homechk.replace(/\bListening\b/gi, "").trim();
        homechk = homechk.replace(/\blistening\b/gi, "").trim();
        homechk = homechk.replace(/\?/g, "");
        homechk = homechk.replace(/\-/g, "");
        homechk = homechk.replace(/\:/g, "");
        homechk = homechk.replace(/\'/g, "");
        homechk = homechk.replace(/\"/g, "");

        console.log('Destination Command : '+homechk);
        
        if (homechk.trim().toLowerCase().includes("home screen") || homechk.trim().toLowerCase().includes("home  screen")
          || homechk.trim().toLowerCase().includes("home Page") || homechk.trim().toLowerCase().includes("Home screen")) {
          
          console.log('Navigating to Home Screen');
          
          handleBackButton();
          return;
        }
        
        setDestination(transcript);
        // setDirections(transcript);
        
        Speech.speak(`You said: ${transcript}`, {
          onDone: () => confirmMessage(transcript),
        });
      }, 10000); // Record for 5 seconds
    } catch (error) {
      console.error("Error during recording:", error);
      Speech.speak("An error occurred while recording.");
     // startRecording();
    }
  };
  

  const confirmMessage = async (transcriptOne) => {
       Speech.speak('Do you confirm destination',{
        onDone:()=>
        {
          confirmDestination(transcriptOne);
        }

       },100);
  };
  
  const confirmDestination = async (transcriptOne) => {
    
    
    setTimeout(async () => {
      
      
      try {
        // Unload previous recording if it exists
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
        
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          Speech.speak("Permission Denied. Microphone access is required.");
          return;
        }
        
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        
        const recording = new Audio.Recording();
        recordingRef.current = recording;
        
        await recording.prepareToRecordAsync({
          android: {
            extension: ".mp3",
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          },
          ios: {
            extension: ".mp3",
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
        });
        
        await recording.startAsync();
        Speech.speak("Listening");
        console.log('Recording Started');
        
        setTimeout(async () => {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          console.log("Recording stopped. Audio file saved at:", uri);
          
          // sending audio for transaction
          const transcript = await transcribeAudio(uri);
          
          let homechk=transcript.trim().toLowerCase();
          homechk = homechk.replace(/\./g, "");///////////////////////////////////
          homechk = homechk.replace(/\bListening\b/gi, "").trim();
          homechk = homechk.replace(/\blistening\b/gi, "").trim();
          homechk = homechk.replace(/\,/g, "");
          homechk = homechk.replace(/\?/g, "");
          homechk = homechk.replace(/\-/g, "");
          homechk = homechk.replace(/\:/g, "");
          homechk = homechk.replace(/\'/g, "");
          homechk = homechk.replace(/\"/g, "");

            console.log('Confirmation Command : '+homechk);

          if (homechk.trim().toLowerCase().includes("home screen") || homechk.trim().toLowerCase().includes("home  screen")
            || homechk.trim().toLowerCase().includes("home") || homechk.trim().toLowerCase().includes("Home screen")) {
            
            console.log('Navigating to Home Screen');
            
            handleBackButton();
            return;
          }
          
          if (transcript.trim().toLowerCase().includes("yes") || transcript.trim().toLowerCase().includes("okay") 
             || transcript.trim().toLowerCase().includes("ok") || transcript.trim().toLowerCase().includes("start") ||
              transcript.trim().toLowerCase().includes("navigation")) {
            destination=transcriptOne.trim().toLowerCase();
            destination = destination.replace(/\./g, "");
            destination = destination.replace(/\bListening\b/gi, "").trim();
            destination = destination.replace(/\blistening\b/gi, "").trim();
            setDestination(destination);
            getDirections();
            return;  
            
          }   
          else {
            
            Speech.speak('Please provide the destination again ', {
              onDone: ()=>
                {
                startRecording();
                return; 
              }
            },100);
            
          }
          
          
        }, 8000); // Record for 5 seconds
      } catch (error) {
        console.error("Error during recording:", error);
        console.log("An error occurred while recording.");
        confirmMessage();
      }
      
      
      
    }, 4000);
    
    
  };
  
  
  const transcribeAudio = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.size <= 0) {
        throw new Error('Recorded file is empty.');
      }
      
      // Upload the audio file to Rev.ai
      const formData = new FormData();
      formData.append('media', {
        uri: fileInfo.uri,
        name: 'audio.mp3', // Ensure the name matches the file format
        type: 'audio/mp3', // MIME type for MP3
      });
      
      const uploadResponse = await axios.post(
        'https://api.rev.ai/speechtotext/v1/jobs',
        formData,
        {
          headers: {
            Authorization: `Bearer ${revAccessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      const jobId = uploadResponse.data.id;
      console.log('Job ID:', jobId);
      
      // Poll for the transcription result
      let transcriptionResult = '';
      while (true) {
        const statusResponse = await axios.get(
        `https://api.rev.ai/speechtotext/v1/jobs/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${revAccessToken}`,
              Accept: 'application/vnd.rev.transcript.v1.0+json',
            },
          }
        );
        
        console.log('Job Status:'+ statusResponse.data.status);
        
        if (statusResponse.data.status === 'transcribed') {
          const transcriptResponse = await axios.get(
          `https://api.rev.ai/speechtotext/v1/jobs/${jobId}/transcript`,
            {
              headers: {
                Authorization: `Bearer ${revAccessToken}`,
                Accept: 'application/vnd.rev.transcript.v1.0+json',
              },
            }
          );
          
          console.log('Transcript Response:', transcriptResponse.data);
          
          // Combine text elements into a full transcription
          transcriptionResult = transcriptResponse.data.monologues[0].elements
          .map((element) => element.value)
          .join(' ');
          break;
        } else if (statusResponse.data.status === 'failed') {
          throw new Error('Transcription failed.');
        } else if (statusResponse.data.status === 'in_progress') {
          // Wait 5 seconds before checking again
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          console.log('Unknown Status:', statusResponse.data.status);
          throw new Error(`Unexpected job status: ${statusResponse.data.status}`);
        }
      }
      
      return transcriptionResult;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      // throw error;
      startRecording();
      return; 
    }
    
  };

  
  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      return;
    }
    
    let location = await Location.getCurrentPositionAsync({});
    const userLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    
    // setCurrentLocation(userLocation);
    currentLocation=userLocation; //////////////////////////////////////////////////////////////
    setRegion(userLocation);
    
    const addressResult = await LocationGeocoding.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    
    if (addressResult.length > 0) {
      setCurrentAddress(
        `${addressResult[0].name}, ${addressResult[0].city}, ${addressResult[0].region}`
      );
    }
  };
  
  const getDirections = async () => {
    console.log(destination);
    if (!destination) {
      Alert.alert("Error", "Please enter a destination.");
      return;
    }
  
    try {
      const geoResult = await LocationGeocoding.geocodeAsync(destination);
      if (!geoResult.length) {
        console.log("Destination not Found");
        Speech.speak("Destination Not Found. Please Select Again", {
          onDone: () => {
            startRecording();
          },
        }, 100);
        return;
      }
  
      const destinationCoords = {
        latitude: geoResult[0].latitude,
        longitude: geoResult[0].longitude,
      };
  
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationCoords.latitude},${destinationCoords.longitude}&key=${GOOGLE_API_KEY}`;
  
      const response = await fetch(directionsUrl);
      const data = await response.json();
      console.log("2 : " + data.routes.length);
      if (data.routes.length > 0) {
        const route = data.routes[0].overview_polyline.points;
        const decodedRoute = decodePolyline(route);
        setRouteCoords(decodedRoute);
  
        const steps = data.routes[0].legs[0].steps.map((step) => {
          let instruction = removeHtmlTags(decode(step.html_instructions));
  
          // Simplify instructions to only include "left" or "right"
          if (instruction.toLowerCase().includes("left")) {
            instruction = "Turn left";
          } else if (instruction.toLowerCase().includes("right")) {
            instruction = "Turn right";
          } 
  
          return {
            instruction: instruction,
            end_location: step.end_location,
          };
        });
  
        setDirections(steps);
        setFooterVisible(true);
  
        setTravelSummary({
          duration: data.routes[0].legs[0].duration.text,
          distance: data.routes[0].legs[0].distance.text,
          arrivalTime: new Date(
            Date.now() + data.routes[0].legs[0].duration.value * 1000
          ).toLocaleTimeString(),
        });
  
        // Speak the first step's instruction
        Speech.speak(steps[0].instruction);
        setIsDirectionsLoaded(true);
        setMapHeight('80%');
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch directions.");
    }
  };
  
  
  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0,
    lat = 0,
    lng = 0;
    
    while (index < encoded.length) {
      let b,
      shift = 0,
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      let dlat = (result & 1) ? ~(result >> 1) : result >> 1;
      lat += dlat;
      
      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      let dlng = (result & 1) ? ~(result >> 1) : result >> 1;
      lng += dlng;
      
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    
    return points;
  };
  
  const removeHtmlTags = (html) => {
    return html.replace(/<[^>]*>/g, "");
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Current Location"
          value={currentAddress}
          editable={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Where to?"
          value={destination1}
          onChangeText={(text) => setDestination(text)}
        />
        <TouchableOpacity style={styles.button} onPress={getDirections}>
          <Text style={styles.buttonText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleBackButton}>
          <Text style={styles.buttonText}>Back Button</Text>
        </TouchableOpacity>
      </View>
  
      <View style={{ flex: 1 }}>
        {/* Map section (80% height initially) */}
        <View style={{ flex: 1, height: mapHeight }}>
          <MapView style={styles.map} region={region} showsUserLocation={true}>
            {routeCoords.length > 1 && (
              <>
                <Marker coordinate={routeCoords[routeCoords.length - 1]} title="Destination" />
                <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
              </>
            )}
          </MapView>
        </View>
  
        
        <View style={[styles.footerContainer, { height: isDirectionsLoaded ? '20%' : 0 }]}>
         
          {isDirectionsLoaded && (
            <View style={styles.objectScreen}>
           <ObjectDetectionScreen/>
            </View>
          )}
        </View>
      </View>
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputContainer: { padding: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 5 },
  button: { backgroundColor: "#121721", padding: 10, borderRadius: 15, alignItems: "center" },
  buttonText: { color: "white" },
  map: { flex: 1 },
  footerContainer: {
    transition: 'height 0.3s ease-in-out',  // Smooth transition for height change
    backgroundColor: 'lightgray',
  },
  objectScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
});


export default GoogleMap;

