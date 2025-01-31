import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';

const ObjectDetectionScreen = ({ navigation }) => {
  const [labels, setLabels] = useState([]);
  const webviewRef = useRef(null);
  const previousLabels = useRef([]);
  const sameLabelCount = useRef(0);
  const detecting = useRef(true);
  const router = useRouter();

  const captureImage = async () => {
    if (!detecting.current) return;
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


  const analyzeImage = async (base64ImageData) => {
    try {
      const apiKey = 'AIzaSyCaREgPQjYUsrzG9HR37FK63RhS6hy5SSw';
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      const requestData = {
        requests: [
          {
            image: { content: base64ImageData },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'FACE_DETECTION', maxResults: 5 },
            ],
          },
        ],
      };

      const apiResponse = await axios.post(apiURL, requestData);


      const faceAnnotations = apiResponse.data.responses[0]?.faceAnnotations || [];
      if (faceAnnotations.length > 0) {
        //  Speech.speak('Person detected');
        setLabels([{ description: 'Person face detected' }]);

        router.push({
          pathname: '/Facecompare',
          params: { detectedImage: base64ImageData },
        });
      } else {

        const allLabels = apiResponse.data.responses[0]?.labelAnnotations || [];
        const sortedLabels = allLabels
          .sort((a, b) => b.score - a.score)
          .slice(0, 2);

        if (sortedLabels.length > 0) {
          setLabels(sortedLabels);


          const labelNames = sortedLabels.map((label) => label.description);
          const sentenceParts = [];


          sentenceParts.push(`Detected objects are ${labelNames.join(' or ')}.`);
          Speech.speak(sentenceParts.join('. '));


          if (
            previousLabels.current.length > 0 &&
            JSON.stringify(previousLabels.current) === JSON.stringify(sortedLabels)
          ) {
            sameLabelCount.current += 1;
          } else {
            sameLabelCount.current = 0;
          }

          previousLabels.current = sortedLabels;

          if (sameLabelCount.current >= 3) {
            detecting.current = false;
            sameLabelCount.current = 0;
            router.push('/AskContinueScreen');
          }
        } else {
          setLabels([]);
          console.log('No labels detected.');
        }
      }
    } catch (error) {
      //  console.error('Error analyzing image:', error.message);
    }
  };



  const handleMessage = (event) => {
    const base64ImageData = event.nativeEvent.data;
    analyzeImage(base64ImageData);
  };


  useEffect(() => {
    const intervalId = setInterval(() => {
      captureImage();
    }, 4000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.heading}>Object Detection</Text>
      <WebView
        ref={webviewRef}
        source={{ uri: 'https://ShafqatWarraich.github.io/webcamera/web_cam.html' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        startInLoadingState={true}
        onMessage={handleMessage}
        onError={(error) => console.log(error)}
      />

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
    fontWeight: 'bold',
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

export default ObjectDetectionScreen;
