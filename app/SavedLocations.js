import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';

import { MaterialIcons } from '@expo/vector-icons';

const SavedLocations = () => {
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const fileUri = `${FileSystem.documentDirectory}locations.txt`;

  useEffect(() => {
    loadLocations();
  }, []);

  // Load locations from file system
  const loadLocations = async () => {
    try {
      const existingData = await FileSystem.readAsStringAsync(fileUri).catch(() => '');
      const locationList = existingData ? existingData.split('\n') : [];
      setLocations(locationList.filter((loc) => loc.trim() !== '')); // Remove empty lines
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  // Store new location
  const storeLocation = async () => {
    if (!location.trim()) {
      Alert.alert('Validation', 'Please enter a location!');
      return;
    }

    try {
      const updatedData = [...locations, location].join('\n');
      await FileSystem.writeAsStringAsync(fileUri, updatedData);
      setLocation('');
      loadLocations(); // Refresh the list
      Alert.alert('Success', 'Location stored successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to store location.');
      console.error('Error storing location:', error);
    }
  };

  // Delete a specific location
  const deleteLocation = async (item) => {
    try {
      const updatedList = locations.filter((loc) => loc !== item);
      await FileSystem.writeAsStringAsync(fileUri, updatedList.join('\n'));
      setLocations(updatedList);
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter location"
        value={location}
        onChangeText={setLocation}
      />
      <Button title="Store Location" onPress={storeLocation} />

      <FlatList
        data={locations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.locationText}>{item}</Text>
            <TouchableOpacity  onPress={() => deleteLocation(item)}>
              <MaterialIcons name="delete" size={24} color="red" />
             
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  locationText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SavedLocations;
