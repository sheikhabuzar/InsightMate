import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Modal,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const NoteSaver = () => {
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState({ amount: '', name: '', image: null });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const storedData = await AsyncStorage.getItem('notes');
      if (storedData) {
        setNotes(JSON.parse(storedData));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes');
    }
  };

  const saveNotes = async (data) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(data));
      setNotes(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
    }
  };

  const handleAddEditNote = () => {
    let updatedNotes = [...notes];
    if (editIndex !== null) {
      updatedNotes[editIndex] = currentNote;
    } else {
      updatedNotes.push(currentNote);
    }
    saveNotes(updatedNotes);
    resetForm();
  };

  const resetForm = () => {
    setModalVisible(false);
    setCurrentNote({ amount: '', name: '', image: null });
    setEditIndex(null);
  };

  const handleDeleteNote = (index) => {
    let updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    saveNotes(updatedNotes);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCurrentNote({ ...currentNote, image: result.assets[0].uri });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Note Saver</Text>

      {notes.map((note, index) => (
        <View key={index} style={styles.card}>
          {note.image && <Image source={{ uri: note.image }} style={styles.image} />}
          <View style={styles.cardDetails}>
            <Text style={styles.name}>{note.name}</Text>
            <Text style={styles.amount}>Amount: {note.amount}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => { setEditIndex(index); setCurrentNote(note); setModalVisible(true); }}>
              <MaterialIcons name="edit" size={24} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteNote(index)}>
              <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Note</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>{editIndex !== null ? 'Edit Note' : 'Add Note'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={currentNote.name}
              onChangeText={(text) => setCurrentNote({ ...currentNote, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={currentNote.amount}
              onChangeText={(text) => setCurrentNote({ ...currentNote, amount: text })}
            />
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
            {currentNote.image && (
              <Image source={{ uri: currentNote.image }} style={styles.previewImage} />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => resetForm()}>
                <Text style={[styles.buttonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddEditNote}>
                <Text style={[styles.buttonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: '#f8f9fa',
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#343a40',
      marginBottom: 20,
      textAlign: 'center',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 15,
      marginVertical: 10,
      elevation: 3,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 15,
    },
    cardDetails: {
      flexGrow: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#495057',
    },
    relation: {
      fontSize: 16,
      color: '#6c757d',
    },
    phone: {
      fontSize: 14,
      color: '#6c757d',
     },
     cardActions:{
       flexDirection:'row',
       alignItems:'center'
     },
     addButton:{
       backgroundColor:'#121721',
       paddingVertical:12,
       borderRadius:8,
       alignItems:'center',
       marginTop :20
     },
     buttonText:{
       color:'#ffffff',
       fontWeight:'bold'
     },
     modalBackground:{
       flex :1,
       justifyContent:'center',
       alignItems:'center',
       backgroundColor:'rgba(0,0,0,0.5)'
     },
     modalContainer:{
       width:'90%',
       backgroundColor:'#ffffff',
       borderRadius :10,
       padding :20
     },
     modalHeader:{
       fontSize :20,
       fontWeight:'bold',
       marginBottom :15
     },
     input:{
       borderWidth :1,
       borderColor:'#ced4da',
       borderRadius :8,
       paddingVertical :10,
       paddingHorizontal :15,
       marginBottom :10
     },
     uploadButton:{
       backgroundColor:'#121721',
       paddingVertical :12,
       borderRadius :8,
       alignItems:'center'
     },
     previewImage:{
       width :100,
       height :100,
       borderRadius :50,
       marginVertical :10
     },
     modalActions:{
       flexDirection:'row',
       justifyContent:'space-between'
     },
     saveButton: {
      marginTop :10,
      backgroundColor: 'green',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      marginTop:10,
      backgroundColor: 'red',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
     confirmButton:{
         marginTop :10
     },
     confirmButtonText:{
         textAlign :'center'
     }
  });
  

export default NoteSaver;
