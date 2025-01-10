import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

const LocationScreen = () => {
  const [location, setLocation] = useState('');
  const fileUri = `${FileSystem.documentDirectory}locations.txt`;

  const storeLocation = async () => {
    if (!location.trim()) {
      Alert.alert('Validation', 'Please enter a location!');
      return;
    }

    try {
      // Append the new location to the file
      const existingData = await FileSystem.readAsStringAsync(fileUri).catch(() => '');
      const updatedData = existingData ? `${existingData}\n${location}` : location;
      await FileSystem.writeAsStringAsync(fileUri, updatedData);

      Alert.alert('Success', 'Location stored successfully!');
      setLocation('');
    } catch (error) {
      Alert.alert('Error', 'Failed to store location.');
      console.error('Error storing location:', error);
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
      <Button title="Store" onPress={storeLocation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default LocationScreen;
