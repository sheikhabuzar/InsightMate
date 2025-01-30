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
  
  
const GOOGLE_API_KEY_speech = "AIzaSyDSu1MQNfTaAeoSn5yaJFgs50IjjP84LXA";
  
const GOOGLE_API_KEY = "AIzaSyBxCwHntkDBpBr_ZLIU4nBh4Ywi4rEUW58";
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
const [mapHeight, setMapHeight] = useState('80%'); // Replace with your actual API key //////////////
  let destination="";
  let currentLocation="";
  const recordingRef = useRef(null);
  const router = useRouter();
    const fileUri = `${FileSystem.documentDirectory}locations.txt`;
  
  
  
  
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


  const SavedLocationRead = async () => {
    
    await readLocations(); // Speak locations stored in the file

    // Start recording after reading locations
    setTimeout(() => startRecordingForSavedLocations(), 2000);
  };

  const wordToNumber = (word) => {
  const mapping = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12
    // Add more words as needed
  };

  return mapping[word.toLowerCase()] || null; // Return null if the word isn't found
};


  const readLocations = async () => {
    try {
      const data = await FileSystem.readAsStringAsync(fileUri).catch(() => "");
      if (!data) {
        Alert.alert("No Data", "No locations found to read!");
        return;
      }

      const locations = data.split("\n").filter((loc) => loc.trim());
      for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        Speech.speak(`Say ${i + 11} for ${loc}`, {
          pitch: 1.0,
          rate: 1.0,
        });
        // Add delay to ensure speech for each location is completed
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to read locations.");
      console.error("Error reading locations:", error);
    }
  };

  const startRecordingForSavedLocations = async () => {
    try {
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
          extension: ".webm",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WEBM,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1, // Mono channel for speech
          bitRate: 256000,
        },
        ios: {
          extension: ".webm",
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1, // Mono channel for speech
          bitRate: 64000,
        },
      });
      await recording.startAsync();
      console.log("Recording started");
      console.log("Listening ");

      setTimeout(async () => {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        const transcript = await transcribeAudio(uri);

        Speech.speak(`You said: ${transcript}`, {
          onDone: () => processTranscript(transcript),
        });
      }, 5000); // Record for 5 seconds
    } catch (error) {
      console.error("Error during recording:", error);
      Alert.alert("Error", "An error occurred while recording.");
    }
  };
  

  const processTranscript = (transcript) => {
 //   transcript=wordToNumber(transcript);
 //   console.log(transcript);
  //  const chosenLocationIndex = parseInt(transcript, 10); //////////////////////////////////////////
  const chosenLocationIndex=transcript-10;
  
      console.log('Chosen Location Index : '+chosenLocationIndex);
    if (isNaN(chosenLocationIndex)) {
      console.log(chosenLocationIndex);
      console.log("Invalid Input", "Please say a valid number for a location.");
      SavedLocationRead();
      return;
    }

    FileSystem.readAsStringAsync(fileUri).then((data) => {
      const locations = data.split("\n").filter((loc) => loc.trim());
      if (chosenLocationIndex > 0 && chosenLocationIndex <= locations.length) {
        const selectedLocation = locations[chosenLocationIndex];
        destination=selectedLocation;
        getDirections();
      } else {
        console.log("Invalid Choice", "The number does not match any location.");
        SavedLocationRead();
        return;
      }
    });
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
          extension: ".webm",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WEBM,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1, // Mono channel for speech
          bitRate: 256000,
        },
        ios: {
          extension: ".webm",
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1, // Mono channel for speech
          bitRate: 64000,
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
        if (homechk.trim().toLowerCase().includes("saved locations") || homechk.trim().toLowerCase().includes("saved location")
        || homechk.trim().toLowerCase().includes("save locations") || homechk.trim().toLowerCase().includes("save location")) {
          
          SavedLocationRead();
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
          extension: ".webm",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WEBM,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1, // Mono channel for speech
          bitRate: 256000,
        },
        ios: {
          extension: ".webm",
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1, // Mono channel for speech
          bitRate: 64000,
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
  
  
  const transcribeAudio = async (audioUri) => {
   
    if (!audioUri) {
      console.log('No Recording", "Please record an audio first.');
      return;
    }

  

    try {
      // Read the audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Google Cloud Speech-to-Text API request payload
      const requestPayload = {
        config: {
          encoding: "WEBM_OPUS", // Encoding for WEBM audio format
          sampleRateHertz: 16000, // Sample rate for the recording
          languageCode: "en-Us",  // French language, change as needed
        },
        audio: {
          content: audioBase64,
        },
      };

      // API call
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY_speech}`,
        requestPayload
      );

      // Extract text
      const transcribedText = response.data.results
        ? response.data.results.map((result) => result.alternatives[0].transcript).join("\n")
        : "No transcription available.";

        console.log('Transcribed Text : '+transcribedText);
      return transcribedText;
    } catch (error) {
      console.log("Error converting audio to text:", error);
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
    console.log('User Current Location : '+currentLocation);
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

    if(destination1)
    {
      destination=destination1;
    }
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
      console.log("2 : " + data.routes.length); //////////////////////////////////////////////////////////////////////////
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

