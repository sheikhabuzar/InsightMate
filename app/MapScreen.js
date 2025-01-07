import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import * as LocationGeocoding from "expo-location";
import { decode } from "html-entities";
import * as Speech from "expo-speech";

const GoogleMap = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [destination, setDestination] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentAddress, setCurrentAddress] = useState("Fetching location...");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [directions, setDirections] = useState([]);
  const [footerVisible, setFooterVisible] = useState(false);
  const [travelSummary, setTravelSummary] = useState({});

  const GOOGLE_API_KEY = "AIzaSyBxCwHntkDBpBr_ZLIU4nBh4Ywi4rEUW58"; // Replace with your actual API key

  useEffect(() => {
    fetchLocation();
  }, []);

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

    setCurrentLocation(userLocation);
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

      if (data.routes.length > 0) {
        const route = data.routes[0].overview_polyline.points;
        const decodedRoute = decodePolyline(route);
        setRouteCoords(decodedRoute);

        const steps = data.routes[0].legs[0].steps.map((step) => ({
          instruction: removeHtmlTags(decode(step.html_instructions)),
          end_location: step.end_location,
        }));
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
          value={destination}
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
