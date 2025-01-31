import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech'; 

const FACE_PLUS_PLUS_API_KEY = 'skORRCbttJto6nu5BT5mIypHjfnBBzP7';
const FACE_PLUS_PLUS_API_SECRET = 'ifmXqLDxdHFP07Eew6-GqesxbT7X-qSr';

const CompareFaces = () => {
  const [matchedMember, setMatchedMember] = useState(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const route = useRoute(); 
  const navigation = useNavigation(); 
  const { detectedImage } = route.params; 

  useEffect(() => {
    if (detectedImage) {
      compareWithSavedImages(detectedImage); 
    }
  }, [detectedImage]);

  const compareWithSavedImages = async (imageUri) => {
    try {
      const storedData = await AsyncStorage.getItem('familyMembers');
      if (!storedData) {
       // Alert.alert('No data', 'No saved images found');
        return;
      }

      const familyMembers = JSON.parse(storedData);
      const detectedImageFileUri = await saveBase64ImageToFile(imageUri);

      let isMatchFound = false; 

      for (let member of familyMembers) {
        if (member.image) {
          const match = await compareFaces(detectedImageFileUri, member.image);
          if (match) {
            setMatchedMember(member);
            setShowMatchDetails(true); 
            speakDetectedPerson(member.relation, member.name); 
            setTimeout(() => {
              navigation.goBack(); 
            }, 5000); 
            isMatchFound = true; 
            break; 
          }
        }
      }

      if (!isMatchFound) {
        speakNoMatchFound(); 
       // Alert.alert('No Match', 'No matching faces found');
        setTimeout(() => {
          navigation.goBack(); 
        }, 3000); 
      }
    } catch (error) {
      console.error(error);
     // Alert.alert('Error', 'Failed to compare images');
    }
  };

  const saveBase64ImageToFile = async (base64Data) => {
    try {
      const fileUri = FileSystem.documentDirectory + 'detectedImage.jpg';
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return fileUri;
    } catch (error) {
      //console.error('Error saving base64 image to file:', error);
      return null;
    }
  };

  const compareFaces = async (image1Uri, image2Uri) => {
    const formData = new FormData();
    formData.append('api_key', FACE_PLUS_PLUS_API_KEY);
    formData.append('api_secret', FACE_PLUS_PLUS_API_SECRET);
    formData.append('image_file1', {
      uri: image1Uri,
      type: 'image/jpeg',
      name: 'image1.jpg',
    });
    formData.append('image_file2', {
      uri: image2Uri,
      type: 'image/jpeg',
      name: 'image2.jpg',
    });

    try {
      const response = await axios.post(
        'https://api-us.faceplusplus.com/facepp/v3/compare',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      return response.data.confidence > 75; 
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const speakDetectedPerson = (relation, name) => {
    const message = `Your ${relation} ${name}`;
    Speech.speak(message, {
      language: 'en',
      pitch: 1,
      rate: 1,
    });
  };

  const speakNoMatchFound = () => {
    const message = 'Unknown person detected';
    Speech.speak(message, {
      language: 'en',
      pitch: 1,
      rate: 1,
    });
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.header}>Face Recognition</Text>

      {showMatchDetails && matchedMember && (
        <View style={styles.matchDetailsContainer}>
        
          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Text>Detected Image:</Text>
              <Image
                source={{ uri: `data:image/jpeg;base64,${detectedImage}` }}
                style={styles.image}
              />
            </View>
            <View style={styles.imageWrapper}>
              <Text>Saved Image:</Text>
              <Image
                source={{ uri: matchedMember.image }}
                style={styles.image}
              />
            </View>
          </View>

         
          <Text style={styles.detailsText}>Name: {matchedMember.name}</Text>
          <Text style={styles.detailsText}>Relation: {matchedMember.relation}</Text>
          <Text style={styles.detailsText}>Phone Number: {matchedMember.phone}</Text>
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
    fontWeight: 'bold',
    marginBottom: 20,
  },
  matchDetailsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imageWrapper: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default CompareFaces;
 
