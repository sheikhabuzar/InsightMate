import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const Profile = () => {
  const [profile, setProfile] = useState({
    username: '',
    phone: '',
    address: '',
    email: '',
    imageUri: '',
  });

  const [editable, setEditable] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Load profile data from AsyncStorage when the component is mounted
  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('userProfile');
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile);
        setProfile(profileData);
        setNewUsername(profileData.username);
        setNewPhone(profileData.phone);
        setNewAddress(profileData.address);
        setNewEmail(profileData.email);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  // Save updated profile data to AsyncStorage
  const saveProfile = async () => {
    const updatedProfile = {
      username: newUsername,
      phone: newPhone,
      address: newAddress,
      email: newEmail,
      imageUri: profile.imageUri, // Keep the existing image URI
    };

    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setEditable(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Image Picker Handler
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      try {
        await AsyncStorage.setItem('userProfileImage', result.assets[0].uri);
        setProfile({ ...profile, imageUri: result.assets[0].uri });
      } catch (error) {
        Alert.alert('Error', 'Failed to save the image');
      }
    }
  };

  // Delete Image Handler
  const deleteImage = async () => {
    try {
      await AsyncStorage.removeItem('userProfileImage');
      setProfile({ ...profile, imageUri: '' });
      Alert.alert('Success', 'Image deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete the image');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      {/* Profile Image Section */}
      {profile.imageUri ? (
        <Image source={{ uri: profile.imageUri }} style={styles.profileImage} />
      ) : (
        <Text style={styles.noImageText}>No Profile Image</Text>
      )}

      {/* Upload and Delete Image Buttons */}
      {!profile.imageUri && (
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
      )}
      {profile.imageUri && (
        <TouchableOpacity style={styles.deleteButton} onPress={deleteImage}>
          <Text style={styles.buttonText}>Delete Image</Text>
        </TouchableOpacity>
      )}

      {/* Username Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={editable ? newUsername : profile.username}
          onChangeText={setNewUsername}
          editable={editable}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={editable ? newPhone : profile.phone}
          onChangeText={setNewPhone}
          editable={editable}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={editable ? newAddress : profile.address}
          onChangeText={setNewAddress}
          editable={editable}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={editable ? newEmail : profile.email}
          onChangeText={setNewEmail}
          editable={editable}
          keyboardType="email-address"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#121721' }]}
        onPress={editable ? saveProfile : () => setEditable(true)}
      >
        <Text style={styles.buttonText}>{editable ? 'Save Profile' : 'Edit Profile'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#121721',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
  },
  noImageText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
    color: '#121721',
  },
  input: {
    height: 45,
    borderColor: '#D3D3D3',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333',
  },
  button: {
    marginTop: 5,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: '#121721',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  deleteButton: {
    backgroundColor: '#121721',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
