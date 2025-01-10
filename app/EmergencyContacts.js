import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Linking, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import uuid from 'react-native-uuid';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');

  // Load contacts from AsyncStorage when the app starts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const storedContacts = await AsyncStorage.getItem('emergencyContacts');
        if (storedContacts) {
          setContacts(JSON.parse(storedContacts));
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    };
    loadContacts();
  }, []);

  // Save contacts to AsyncStorage
  const saveContacts = async (updatedContacts) => {
    try {
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  // Add a new emergency contact
  const addContact = () => {
    if (!relation || !phone) {
      Alert.alert('Error', 'Please enter both relation and phone number');
      return;
    }
    const newContact = { id: uuid.v4(), name: relation, phone };
    const updatedContacts = [...contacts, newContact];

    saveContacts(updatedContacts);
    setRelation('');
    setPhone('');
    setModalVisible(false);
  };

  // Call a contact
  const callContact = (phone) => {
    Linking.openURL(`tel:${phone}`);
    Speech.speak(`Calling ${phone}`);
  };

  // Send SOS alert
  const sendSOS = () => {
    Alert.alert('🚨 SOS Sent!', 'Emergency contacts have been notified.');
    Speech.speak('Emergency SOS sent. Contacts have been alerted.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Emergency Contacts</Text>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactPhone}>{item.phone}</Text>
            <TouchableOpacity onPress={() => callContact(item.phone)} style={styles.callButton}>
              <Ionicons name="call" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add Contact Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>➕ Add Emergency Contact</Text>
      </TouchableOpacity>

      {/* SOS Button */}
      <TouchableOpacity style={styles.sosButton} onPress={sendSOS}>
        <Text style={styles.sosText}>🚨 SOS Alert</Text>
      </TouchableOpacity>

      {/* Modal for Adding Contact */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
            <TextInput
              placeholder="Relation (e.g., Dad, Mom)"
              style={styles.input}
              value={relation}
              onChangeText={setRelation}
            />
            <TextInput
              placeholder="Phone Number"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addContact}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, justifyContent: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#212121' },
  contactCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  contactName: { fontSize: 20, fontWeight: '600', color: '#333' },
  contactPhone: { fontSize: 16, color: '#666' },
  callButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  addButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  sosButton: { marginTop: 20, backgroundColor: 'red', padding: 15, borderRadius: 10, alignItems: 'center', elevation: 5 },
  sosText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, backgroundColor: '#28a745', padding: 10, borderRadius: 5, alignItems: 'center', margin: 5 },
  cancelButton: { backgroundColor: '#dc3545' },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default EmergencyContacts;
