import React, { useState } from "react";
import { StyleSheet, View, TextInput, Button, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

const GoogleMap = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);

  // Fetch current location
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location access is needed to get your current location.");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setCurrentLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  // Get directions from current location to the destination
  const getDirections = async () => {
    if (!currentLocation || !destination) {
      Alert.alert("Error", "Please provide both current location and destination.");
      return;
    }

    const destinationQuery = encodeURIComponent(destination);
    const currentLat = currentLocation.latitude;
    const currentLng = currentLocation.longitude;

    const API_KEY = "AIzaSyBxCwHntkDBpBr_ZLIU4nBh4Ywi4rEUW58"; // Replace with your API key
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLat},${currentLng}&destination=${destinationQuery}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoords(points);
      } else {
        Alert.alert("No route found", "Could not find a route to the destination.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch directions.");
    }
  };

  // Decode polyline to get coordinates
  const decodePolyline = (t) => {
    let points = [];
    let index = 0, len = t.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  return (
    <View style={styles.container}>
      {/* Inputs for location and destination */}
      <View style={styles.inputContainer}>
        <Button title="Get Current Location" onPress={getCurrentLocation} />
        <TextInput
          style={styles.input}
          placeholder="Enter Destination"
          value={destination}
          onChangeText={setDestination}
        />
        <Button title="Start Directions" onPress={getDirections} />
      </View>

      {/* Map View */}
      <MapView
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude: currentLocation ? currentLocation.latitude : 37.7749,
          longitude: currentLocation ? currentLocation.longitude : -122.4194,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        region={
          currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : undefined
        }
      >
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            pinColor="blue"
          />
        )}

        {/* Route */}
        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="red" />}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    position: "absolute",
    top: 10,
    width: "95%",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    zIndex: 1,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  map: {
    flex: 1,
  },
});

export default GoogleMap;
