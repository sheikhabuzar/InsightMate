import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
    const [profile, setProfile] = useState({
        name: '',
        age: '',
        phone: '',
        address: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const storedProfile = await AsyncStorage.getItem('userProfile');
            if (storedProfile) {
                setProfile(JSON.parse(storedProfile));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load profile');
        }
    };

    const saveProfile = async () => {
        try {
            await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
            Alert.alert('Success', 'Profile saved successfully!');
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Profile</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    value={profile.name}
                    onChangeText={(text) => setProfile({ ...profile, name: text })}
                    editable={isEditing}
                    accessible={true}
                    accessibilityLabel="Full Name"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                    style={styles.input}
                    value={profile.age}
                    onChangeText={(text) => setProfile({ ...profile, age: text })}
                    keyboardType="numeric"
                    editable={isEditing}
                    accessible={true}
                    accessibilityLabel="Age"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    value={profile.phone}
                    onChangeText={(text) => setProfile({ ...profile, phone: text })}
                    keyboardType="phone-pad"
                    editable={isEditing}
                    accessible={true}
                    accessibilityLabel="Phone Number"
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                    style={styles.input}
                    value={profile.address}
                    onChangeText={(text) => setProfile({ ...profile, address: text })}
                    editable={isEditing}
                    accessible={true}
                    accessibilityLabel="Address"
                />
            </View>

            {isEditing ? (
                <TouchableOpacity style={styles.saveButton} onPress={saveProfile} accessible={true} accessibilityLabel="Save Profile">
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)} accessible={true} accessibilityLabel="Edit Profile">
                    <MaterialIcons name="edit" size={24} color="#fff" />
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 5,
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121721',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default ProfileScreen;
