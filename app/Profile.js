import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        address: '',
        email: '', // Adding email field
    });
    const [editable, setEditable] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newEmail, setNewEmail] = useState(''); // New state for email

    // Load profile data from AsyncStorage when the component is mounted
    const loadProfile = async () => {
        try {
            const storedProfile = await AsyncStorage.getItem('userProfile');
            if (storedProfile) {
                const profileData = JSON.parse(storedProfile);
                setProfile(profileData);
                setNewName(profileData.name);
                setNewPhone(profileData.phone);
                setNewAddress(profileData.address);
                setNewEmail(profileData.email); // Set email when loaded
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load profile');
        }
    };

    // Save updated profile data to AsyncStorage
    const saveProfile = async () => {
        const updatedProfile = {
            name: newName,
            phone: newPhone,
            address: newAddress,
            email: newEmail, // Save email too
        };

        try {
            await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            setProfile(updatedProfile); // Update the state to reflect changes
            setEditable(false); // Disable editing mode
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile');
        }
    };

    useEffect(() => {
        loadProfile(); // Load profile data on component mount
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profile</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    value={editable ? newName : profile.name}
                    onChangeText={setNewName}
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

            {/* Adding Gmail (Email) input */}
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

            {/* Custom Button Styling */}
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
        backgroundColor: '#F7F7F7', // Light background color
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#121721', // Dark header color
    },
    inputContainer: {
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 18,
        marginBottom: 6,
        color: '#121721', // Label color
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
        marginTop: 20,
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
});

export default Profile;
