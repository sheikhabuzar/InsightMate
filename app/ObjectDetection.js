import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const DetectObject = () => {
    const [imageUri, setImageUri] = useState(null);
    const [labels, setLabels] = useState([]);

    const captureImage = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Camera permissions are required to use this feature.');
                return;
            }

            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
            }
            console.log(result);
        } catch (error) {
            console.error('Error capturing image:', error);
        }
    };

    const analyzeImage = async () => {
        try {
            if (!imageUri) {
                alert('Please capture an image first');
                return;
            }
            const apiKey = "AIzaSyCaREgPQjYUsrzG9HR37FK63RhS6hy5SSw";
            const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
            const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const requestData = {
                requests: [
                    {
                        image: {
                            content: base64ImageData,
                        },
                        features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
                    },
                ],
            };

            const apiResponse = await axios.post(apiURL, requestData);

            // Extract and sort the labels by confidence score
            const allLabels = apiResponse.data.responses[0].labelAnnotations;
            const sortedLabels = allLabels
                .sort((a, b) => b.score - a.score) // Sort in descending order of confidence
                .slice(0, 2); // Take the top 2 labels

            setLabels(sortedLabels);
        } catch (error) {
            console.error('Error analyzing image:', error);
            alert('Error analyzing image, please try again');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Object Detection</Text>
            {imageUri && (
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: 300, height: 300 }}
                />
            )}
            <TouchableOpacity
                onPress={captureImage}
                style={styles.button}>
                <Text style={styles.text}>Capture an Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={analyzeImage}
                style={styles.button}>
                <Text style={styles.text}>Analyze Image</Text>
            </TouchableOpacity>
            {labels.length > 0 && (
                <View>
                    <Text style={styles.label}>Top Labels</Text>
                    {labels.map((label, index) => (
                        <Text
                            key={index}
                            style={styles.outputText}>
                            {label.description} ({(label.score * 100).toFixed(2)}%)
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
};

export default DetectObject;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 50,
        marginTop: 100,
    },
    button: {
        backgroundColor: '#969696',
        padding: 10,
        marginBottom: 10,
        marginTop: 20,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    outputText: {
        fontSize: 20,
        marginBottom: 10,
    },
});
