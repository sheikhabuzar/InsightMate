import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import uuid from 'react-native-uuid';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');

  // Load saved alerts when the app starts
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const storedAlerts = await AsyncStorage.getItem('userAlerts');
        if (storedAlerts) {
          setAlerts(JSON.parse(storedAlerts));
        }
      } catch (error) {
        console.error('Error loading alerts:', error);
      }
    };
    loadAlerts();
  }, []);

  // Save alerts to AsyncStorage
  const saveAlerts = async (updatedAlerts) => {
    try {
      await AsyncStorage.setItem('userAlerts', JSON.stringify(updatedAlerts));
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  };

  // Add a new alert
  const addAlert = () => {
    if (!alertTitle) {
      Alert.alert('Error', 'Alert title is required');
      return;
    }

    const newAlert = { id: uuid.v4(), title: alertTitle, description: alertDescription };
    const updatedAlerts = [...alerts, newAlert];

    saveAlerts(updatedAlerts);
    Speech.speak(`Alert added: ${alertTitle}`);

    setAlertTitle('');
    setAlertDescription('');
    setModalVisible(false);
  };

  // Delete an alert
  const deleteAlert = (id, title) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    saveAlerts(updatedAlerts);
    Speech.speak(`Alert deleted: ${title}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Alerts</Text>

      {/* List of Alerts */}
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.alertCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{item.title}</Text>
              {item.description ? <Text style={styles.alertDescription}>{item.description}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => deleteAlert(item.id, item.title)} style={styles.deleteButton}>
              <Ionicons name="trash" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Floating Button to Add Alert */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>➕ Add Alert</Text>
      </TouchableOpacity>

      {/* Modal for Adding Alert */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Alert</Text>
            <TextInput
              placeholder="Alert Title (e.g., Medicine Reminder)"
              style={styles.input}
              value={alertTitle}
              onChangeText={setAlertTitle}
            />
            <TextInput
              placeholder="Optional Description"
              style={styles.input}
              value={alertDescription}
              onChangeText={setAlertDescription}
            />
            <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={addAlert}>
                <Text style={styles.modalButtonText}>Save</Text>
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
  alertCard: {
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
  alertTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
  alertDescription: { fontSize: 16, color: '#666' },
  deleteButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  addButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, backgroundColor: '#28a745', padding: 10, borderRadius: 5, alignItems: 'center', margin: 5 },
  cancelButton: { backgroundColor: '#dc3545' },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default Alerts;
