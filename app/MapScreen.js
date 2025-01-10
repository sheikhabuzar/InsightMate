import React, { useEffect, useState,useRef } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
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

  const GOOGLE_API_KEY = "AIzaSyBxCwHntkDBpBr_ZLIU4nBh4Ywi4rEUW58"; // Replace with your actual API key
  const revAccessToken = "02SVTgaqr-HbZO9N3-hPglv4aItscINrmNC98UyMT2ZjWsm17knqL_YtqjqVrAKs-fwEg-KDrNsEGfSkykvCKesxZQBlw"; //////////////
  let destination="";
  let currentLocation="";
  const recordingRef = useRef(null);
  const router = useRouter();
  let timer;

 

  useEffect(() => {
 
   Speech.speak('Map Page', {
    onDone: ()=>
    {
       initializeMap();

       
       startRecording();
    }
   });
   

 // const cleanup = startPromptCycle();
 // return cleanup; 
    
    
  }, []);

  //////////////////////////////////////////////////
  ///////////////////////////////////////////////////


   const handleBackButton =  async() =>  {
    
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
    Speech.stop(); // Stop any ongoing speech
    router.replace('/HomeScreen');
    return; // Navigate to HomeScreen
  };

const startPromptCycle = () => {
  
  const askQuestion = async () => {
    try {
      // Speak the prompt
      Speech.speak("Do you want to change location or leave the MapScreen?", {
        onDone: startListeningForReroute,
      });
    } catch (error) {
      console.error("Error during Speech.speak:", error);
    }
  };

  const startListeningForReroute = async () => {
    try {
      // Request audio permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.error("Microphone permission denied");
        return;
      }

      // Prepare and start recording
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
//////////////////////////////////////


     
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

      setTimeout(async () => {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log("Recording stopped. Audio file saved at:", uri);

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

            console.log('Update Location : '+homechk);
        
        if (homechk.trim().toLowerCase().includes("home screen") || homechk.trim().toLowerCase().includes("home  screen")
        || homechk.trim().toLowerCase().includes("home") || homechk.trim().toLowerCase().includes("Home screen")) {
        
          Speech.stop(); 
                 // Navigate to HomeScreen
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
           console.log('Navigating to Home Screen');
            
          router.replace('/HomeScreen');
          return;
        }

        else if(homechk.trim().toLowerCase().includes("yes") || 
        homechk.trim().toLowerCase().includes("yes yes"))
        {
          Speech.speak("Update Your Destination", {
        onDone: startRecording,
      });
           return;
        }
        else
        {
          return;
        }


        
      }, 10000); // Record for 5 seconds
    } catch (error) {
      console.error("Error during recording:", error);
      Speech.speak("An error occurred while recording.");
    }
     
  };

  

  // Start the timer to repeat every 40 seconds
  timer = setInterval(askQuestion, 60000);

  // Return a cleanup function to stop the timer
  return () => clearInterval(timer);
};


















  /////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  const initializeMap = async () => {

    
    await fetchLocation();
    

  };

  const stopActivitiesAndNavigate =  () => {
    // Stop ongoing activities
     
  };



  const startRecording = async () => {
    try {
      // Unload previous recording if it exists


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
//////////////////////////////////////
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

      setTimeout(async () => {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log("Recording stopped. Audio file saved at:", uri);

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
        
        if (homechk.trim().toLowerCase().includes("home screen") || homechk.trim().toLowerCase().includes("home  screen")
        || homechk.trim().toLowerCase().includes("home") || homechk.trim().toLowerCase().includes("Home screen")) {
        
          Speech.stop();
                 // Navigate to HomeScreen
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
           console.log('Navigating to Home Screen');
            
          router.replace('/HomeScreen');
          return;
        }

        setDestination(transcript);
     //   setDirections(transcript);

        Speech.speak(`You said: ${transcript}`, {
          onDone: () => confirmDestination(transcript),
        });
      }, 10000); // Record for 5 seconds
    } catch (error) {
      console.error("Error during recording:", error);
      Speech.speak("An error occurred while recording.");
    }
  };


  const confirmDestination = async (transcriptOne) => {

    
    setTimeout(async () => {
      Speech.speak("Do you confirm destination");
      
      ////////////////////////////////////////////////
      ////////////////////////////////////////////


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
        if (homechk.trim().toLowerCase().includes("home screen") || homechk.trim().toLowerCase().includes("home  screen")
        || homechk.trim().toLowerCase().includes("home") || homechk.trim().toLowerCase().includes("Home screen")) {
        
          Speech.stop();
                 // Navigate to HomeScreen
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
           console.log('Navigating to Home Screen');
            
          router.replace('/HomeScreen');
          return;
        }
        
          if (transcript.trim().toLowerCase().includes("yes") ) {
              destination=transcriptOne.trim().toLowerCase();
              destination = destination.replace(/\./g, "");///////////////////////////////////
              destination = destination.replace(/\bListening\b/gi, "").trim();
               destination = destination.replace(/\blistening\b/gi, "").trim()
        
              setDestination(destination);
              getDirections();
              return;  ////////////////////////////
              
                  }   
                  else {

                  Speech.speak('Please provide the destination again ', {
                    onDone: ()=>
                    {
                        startRecording();
                        return; ////////////////////////////////
                    }
                  });
                     
             }

             
      }, 7000); // Record for 5 seconds
    } catch (error) {
      console.error("Error during recording:", error);
      console.log("An error occurred while recording.");
    }
   
    }, 7000);
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
    return; ////////////////////////////////////////////////////////////////////
  }

  };

  ///////////////////////////////////////////////////
  //////////////////////////////////////////////////

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
        Alert.alert("Error", "Destination not found.");
        return;
      }

      const destinationCoords = {
        latitude: geoResult[0].latitude,
        longitude: geoResult[0].longitude,
      };
      
     
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationCoords.latitude},${destinationCoords.longitude}&key=${GOOGLE_API_KEY}`;
  
      const response = await fetch(directionsUrl);
      const data = await response.json();
      console.log('2 : '+data.routes.length);
      if (data.routes.length > 0) {
        const route = data.routes[0].overview_polyline.points;
        const decodedRoute = decodePolyline(route);
        setRouteCoords(decodedRoute);

        const steps = data.routes[0].legs[0].steps.map((step) => ({
          instruction: removeHtmlTags(decode(step.html_instructions)),
          end_location: step.end_location,
        }));//
        setDirections(steps);
        setFooterVisible(true);

        setTravelSummary({
          duration: data.routes[0].legs[0].duration.text,
          distance: data.routes[0].legs[0].distance.text,
          arrivalTime: new Date(Date.now() + data.routes[0].legs[0].duration.value * 1000).toLocaleTimeString(),
        });

        Speech.speak(steps[0].instruction);
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
          onChangeText={(text) => setDestination(text)} // Removed getSuggestions function call
        />
        <TouchableOpacity style={styles.button} onPress={getDirections}>
          <Text style={styles.buttonText}> Directions</Text>
        </TouchableOpacity>
      </View>
      <MapView style={styles.map} region={region} showsUserLocation={true}>
        {routeCoords.length > 1 && (
          <>
            <Marker coordinate={routeCoords[routeCoords.length - 1]} title="Destination" />
            <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
          </>
        )}
      </MapView>
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
});

export default GoogleMap;
