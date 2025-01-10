import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UploadImageScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [name, setName] = useState('');
  const [storedData, setStoredData] = useState([]);

  // Function to pick an image from the device
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);  // Store the image URI
    }
  };

  // Function to save image and name to AsyncStorage
  const saveImageData = async () => {
    if (!imageUri || !name) {
      Alert.alert('Error', 'Please select an image and enter a name.');
      return;
    }

    try {
      // Create the image data object
      const imageData = { imageUri, name };

      // Retrieve existing stored data (if any)
      const existingData = await AsyncStorage.getItem('images');
      const parsedData = existingData ? JSON.parse(existingData) : [];

      // Add new data to the array
      parsedData.push(imageData);

      // Save updated data to AsyncStorage
      await AsyncStorage.setItem('images', JSON.stringify(parsedData));

      // Update the state
      setStoredData(parsedData);
      Alert.alert('Success', 'Image and name saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save image and name.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Image and Name</Text>
      
      {/* Button to pick image */}
      <Button title="Pick an Image" onPress={pickImage} />
      
      {/* Show selected image */}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      
      {/* Text input for name */}
      <TextInput
        style={styles.input}
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
      />
      
      {/* Button to save image and name */}
      <Button title="Save" onPress={saveImageData} />

      {/* Display stored images and names */}
      {storedData.length > 0 && (
        <View style={styles.storedData}>
          <Text style={styles.subHeader}>Stored Images and Names:</Text>
          {storedData.map((data, index) => (
            <View key={index} style={styles.storedItem}>
              <Image source={{ uri: data.imageUri }} style={styles.storedImage} />
              <Text>{data.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  storedData: {
    marginTop: 20,
    width: '100%',
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 10,
  },
  storedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  storedImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
});

export default UploadImageScreen;
