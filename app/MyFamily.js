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

const MyFamily = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMember, setCurrentMember] = useState({ name: '', relation: '', phone: '', image: null });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const storedData = await AsyncStorage.getItem('familyMembers');
      if (storedData) {
        setFamilyMembers(JSON.parse(storedData));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load family members');
    }
  };

  const saveFamilyMembers = async (data) => {
    try {
      await AsyncStorage.setItem('familyMembers', JSON.stringify(data));
      setFamilyMembers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to save family members');
    }
  };

  const handleAddEditMember = () => {
    let updatedMembers = [...familyMembers];
    if (editIndex !== null) {
      updatedMembers[editIndex] = currentMember;
    } else {
      updatedMembers.push(currentMember);
    }
    saveFamilyMembers(updatedMembers);
    resetForm();
  };

  const resetForm = () => {
    setModalVisible(false);
    setCurrentMember({ name: '', relation: '', phone: '', image: null });
    setEditIndex(null);
  };

  const handleDeleteMember = (index) => {
    let updatedMembers = [...familyMembers];
    updatedMembers.splice(index, 1);
    saveFamilyMembers(updatedMembers);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCurrentMember({ ...currentMember, image: result.assets[0].uri });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>My Family</Text>

      {familyMembers.map((member, index) => (
        <View key={index} style={styles.card}>
          {member.image && <Image source={{ uri: member.image }} style={styles.image} />}
          <View style={styles.cardDetails}>
            <Text style={styles.name}>{member.name}</Text>
            <Text style={styles.relation}>{member.relation}</Text>
            <Text style={styles.phone}>{member.phone}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => { setEditIndex(index); setCurrentMember(member); setModalVisible(true); }}>
              <MaterialIcons name="edit" size={24} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteMember(index)}>
              <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Family Member</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>{editIndex !== null ? 'Edit Family Member' : 'Add Family Member'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={currentMember.name}
              onChangeText={(text) => setCurrentMember({ ...currentMember, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Relation"
              value={currentMember.relation}
              onChangeText={(text) => setCurrentMember({ ...currentMember, relation: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={currentMember.phone}
              onChangeText={(text) => setCurrentMember({ ...currentMember, phone: text })}
            />
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
            {currentMember.image && (
              <>
                <Image source={{ uri: currentMember.image }} style={styles.previewImage} />
                <TouchableOpacity
                  style={[styles.uploadButton, styles.confirmButton]}
                  onPress={() => Alert.alert('Image Selected', 'Your image has been uploaded!')}
                >
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>Confirm Image</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => resetForm()}>
                <Text style={[styles.buttonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddEditMember}>
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

export default MyFamily;
