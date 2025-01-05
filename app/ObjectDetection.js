import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import * as Speech from 'expo-speech';

const CameraWebViewWithAutoCapture = () => {
  const [labels, setLabels] = useState([]);
  const webviewRef = useRef(null);

  // Function to capture image from WebView (automatically)
  const captureImage = async () => {
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(`
        (function() {
          const video = document.querySelector('video');
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg').replace('data:image/jpeg;base64,', '');
          window.ReactNativeWebView.postMessage(imageData);
        })();
      `);
    }
  };

  // Function to analyze the captured image using Google Vision API
  const analyzeImage = async (base64ImageData) => {
    try {
      const apiKey = 'AIzaSyCaREgPQjYUsrzG9HR37FK63RhS6hy5SSw'; // Replace with your API key
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      // Prepare the request payload for the Google Vision API
      const requestData = {
        requests: [
          {
            image: { content: base64ImageData },
            features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
          },
        ],
      };

      // Make the API request
      const apiResponse = await axios.post(apiURL, requestData);

      // Extract and sort labels
      const allLabels = apiResponse.data.responses[0]?.labelAnnotations || [];
      const sortedLabels = allLabels.sort((a, b) => b.score - a.score).slice(0, 2);

      setLabels(sortedLabels);

      // Prepare the spoken response
      const labelNames = sortedLabels.map((label) => label.description);
      const sentence = `Detected objects are ${labelNames.join(' or ')}.`;

      // Speak out the detected labels
      Speech.speak(sentence);
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
  };

  // Handle messages sent from the WebView (captured image)
  const handleMessage = (event) => {
    const base64ImageData = event.nativeEvent.data; // This is already a Base64 string
    analyzeImage(base64ImageData); // Pass the Base64 string directly to the analyzeImage function
  };

  // Function to start automatic image capture and analysis every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      captureImage(); // Capture the image
    }, 5000); // Capture every 5 seconds

    return () => {
      clearInterval(intervalId); // Cleanup interval on component unmount
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.heading}>Camera WebView with Auto Capture</Text>
      <WebView
        ref={webviewRef}
        source={{ uri: 'https://ShafqatWarraich.github.io/webcamera/web_cam.html' }} // Replace with your actual URL
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        startInLoadingState={true}
        onMessage={handleMessage} // Handle captured image data here
        onError={(error) => console.log(error)}
      />

      {/* Display the detected labels */}
      {labels.length > 0 && (
        <View style={styles.labelsContainer}>
          <Text style={styles.label}>Detected Labels:</Text>
          {labels.map((label, index) => (
            <Text key={index} style={styles.labelText}>
              {label.description}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
  labelsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  labelText: {
    fontSize: 18,
    marginBottom: 5,
  },
});

export default CameraWebViewWithAutoCapture;
