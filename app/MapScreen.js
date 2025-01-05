import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Modal, Alert, ScrollView } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import * as LocationGeocoding from "expo-location";
import { decode } from "html-entities";
import * as Speech from 'expo-speech'; // Importing expo-speech for text-to-speech functionality

const GoogleMap = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [region, setRegion] = useState(null);
    const [destination, setDestination] = useState("");
    const [routeCoords, setRouteCoords] = useState([]);
    const [currentAddress, setCurrentAddress] = useState("Fetching location...");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [directions, setDirections] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const GOOGLE_API_KEY = "AIzaSyBxCwHntkDBpBr_ZLIU4nBh4Ywi4rEUW58";

    // State to track the current step index
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        // Fetch location and watch real-time updates
        const fetchLocationAndWatchUpdates = async () => {
            await fetchLocation();
            await watchLocation();
        };
        fetchLocationAndWatchUpdates();
    }, []);

    const fetchLocation = async () => {
        // Request location permission and fetch initial location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission denied", "Location access is needed to show your current location.");
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        const userLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
        setCurrentLocation(userLocation);
        setRegion(userLocation);

        // Reverse geocoding to get address
        const addressResult = await LocationGeocoding.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });
        if (addressResult.length > 0) {
            setCurrentAddress(`${addressResult[0].name}, ${addressResult[0].city}, ${addressResult[0].region}`);
        }
    };

    const watchLocation = async () => {
        // Watch real-time location updates
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission denied", "Location access is needed to track your movement.");
            return;
        }
        const locationWatcher = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
            (newLocation) => {
                const { latitude, longitude } = newLocation.coords;
                setCurrentLocation({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
                checkStepCompletion(newLocation.coords); // Check if the current step is completed
            }
        );
        return () => {
            locationWatcher.remove();
        };
    };

    const checkStepCompletion = (newCoords) => {
        if (currentStepIndex < directions.length) {
            // Logic to check if the user has completed the current step
            const stepDestinationCoords = directions[currentStepIndex].end_location; // Assuming end_location exists
            const distance = Math.sqrt(Math.pow(stepDestinationCoords.lat - newCoords.latitude, 2) + Math.pow(stepDestinationCoords.lng - newCoords.longitude, 2));
            
            if (distance < 0.0005) { // If within ~50 meters of the step destination
                Speech.speak(directions[currentStepIndex].instruction); // Speak the instruction for this step
                setCurrentStepIndex(prevIndex => {
                    const nextIndex = prevIndex + 1;
                    if (nextIndex < directions.length) {
                        Speech.speak(directions[nextIndex].instruction); // Speak the next instruction immediately
                    }
                    return nextIndex; // Move to the next step
                });
            }
        }
    };

    const getSuggestions = async (query) => {
        if (!query) {
            setSuggestions([]);
            return;
        }
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&location=${currentLocation.latitude},${currentLocation.longitude}&radius=5000&key=${GOOGLE_API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            setSuggestions(data.predictions || []);
        } catch (error) {
            console.error("Error fetching suggestions", error);
        }
    };

    const getDirections = async () => {
        if (!selectedDestination) {
            Alert.alert("Input Needed", "Please select a destination.");
            return;
        }
        try {
            const geoResult = await LocationGeocoding.geocodeAsync(selectedDestination);
            if (!geoResult.length) {
                Alert.alert("Invalid Location", "Could not find the destination. Try again.");
                return;
            }
            const destinationCoords = { latitude: geoResult[0].latitude, longitude: geoResult[0].longitude };
            setRouteCoords([currentLocation, destinationCoords]);

            // Fetch directions from Google API
            const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationCoords.latitude},${destinationCoords.longitude}&key=${GOOGLE_API_KEY}`;
            const response = await fetch(directionsUrl);
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const steps = data.routes[0].legs[0].steps.map((step, index) => ({
                    id: index,
                    instruction: decode(step.html_instructions).replace(/<\/?[^>]+(>|$)/g, ""), // Decode HTML and remove tags
                    end_location: step.end_location,
                }));
                setDirections(steps);
                Speech.speak(steps[0].instruction); // Speak the first instruction immediately after fetching directions
                setIsModalVisible(true); // Show the directions modal
                setCurrentStepIndex(0); // Reset current step index
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong while fetching the directions.");
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        setDestination(suggestion.description);
        setSelectedDestination(suggestion.description);
        setSuggestions([]);
    };

    const closeDirectionsModal = () => {
        setIsModalVisible(false);
    };

    return (
      <View style={styles.container}>
          <Text style={styles.header}>Enter Your Route</Text>
          <View style={styles.inputContainer}>
              <TextInput style={styles.input} value={currentAddress} editable={false} />
              <TextInput style={styles.input} placeholder="Where to?" onChangeText={(text) => { setDestination(text); getSuggestions(text); }} value={destination} />
              {suggestions.length > 0 && (
                  <FlatList data={suggestions} keyExtractor={(item) => item.place_id} renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => handleSuggestionSelect(item)} style={styles.suggestionItem}>
                          <Text style={styles.suggestionText}>{item.description}</Text>
                      </TouchableOpacity>
                  )} style={styles.suggestionsList} />
              )}
              <TouchableOpacity style={styles.button} onPress={getDirections}>
                  <Text style={styles.buttonText}>Get Directions</Text>
              </TouchableOpacity>
          </View>
          <MapView style={styles.map} provider="google" showsUser Location={true} region={region}>
              {currentLocation && (
                  <Marker coordinate={currentLocation} title="You are here" pinColor="blue" />
              )}
              {routeCoords.length > 1 && (
                  <>
                      <Marker coordinate={routeCoords[1]} title="Destination" pinColor="red" />
                      <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
                  </>
              )}
          </MapView>
          {/* Directions Modal */}
          <Modal visible={isModalVisible} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                      <Text style={styles.modalHeader}>Turn-by-Turn Directions</Text>
                      <ScrollView style={styles.directionsList}>
                          {directions.map((step) => (
                              <Text key={step.id} style={styles.directionStep}>{step.instruction}</Text>
                          ))}
                      </ScrollView>
                      <TouchableOpacity style={styles.closeButton} onPress={closeDirectionsModal}>
                          <Text style={styles.buttonText}>Close</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </Modal>
      </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa" },
    header: { fontSize: 22, fontWeight: "bold", textAlign: "center", paddingVertical: 15, backgroundColor: "#4CAF50", color: "white", elevation: 5 },
    inputContainer: { padding: 15, backgroundColor: "white", elevation: 3, borderRadius: 10, margin: 10 },
    input: { height: 45, borderColor: "#ccc", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 16, marginBottom: 10 },
    button: { backgroundColor: "#4CAF50", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
    buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
    suggestionsList: { maxHeight: 200, marginTop: 10 },
    suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
    suggestionText: { fontSize: 16, color: "#555" },
    map: { flex: 1, marginTop: 10 },
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
    modalContainer: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%", maxHeight:"80%" },
    modalHeader:{ fontSize :20 , fontWeight:"bold" , textAlign:"center" , marginBottom :15},
    directionsList:{ maxHeight:"70%" },
    directionStep:{ fontSize :16 , marginBottom :10 , color:"#333"},
    closeButton:{ backgroundColor:"#4CAF50", paddingVertical :12 , borderRadius :8 , alignItems :"center" , marginTop :10},
});

export default GoogleMap;