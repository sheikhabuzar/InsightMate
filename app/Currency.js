import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import * as Speech from 'expo-speech';

const Currency = () => {
    const [currencyDetected, setCurrencyDetected] = useState(false);
    const [matchedCurrency, setMatchedCurrency] = useState(null);
    const webviewRef = useRef(null);
    const detecting = useRef(true);

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
                            { type: 'TEXT_DETECTION', maxResults: 10 },
                        ],
                    },
                ],
            };

            const apiResponse = await axios.post(apiURL, requestData);
            const labelAnnotations = apiResponse.data.responses[0]?.labelAnnotations || [];
            const textAnnotations = apiResponse.data.responses[0]?.textAnnotations || [];

            const detectedLabels = labelAnnotations.map(label => label.description.toLowerCase());
            const detectedText = textAnnotations.map(text => text.description.toLowerCase()).join(' ');

            console.log('Detected Labels:', detectedLabels);
            console.log('Detected Text:', detectedText);

            const currencyKeywords = ['currency', 'banknote', 'money', 'cash', 'bill'];
            const isCurrencyLabel = currencyKeywords.some(keyword => detectedLabels.includes(keyword));

            if (isCurrencyLabel) {
                setCurrencyDetected(true);
                //Speech.speak('Currency note detected');

                const denominations = ['5000', '20', '500', '75', '1000', '50', '100', '10'];

                const words = detectedText.split(/\s+/);

                const detectedAmount = words.find(word => denominations.includes(word));

                if (detectedAmount) {
                    setMatchedCurrency({ amount: detectedAmount });
                    Speech.speak(`This is a ${detectedAmount} currency note.`);
                } else {
                    setMatchedCurrency({ amount: 'Unknown' });
                    Speech.speak('Currency note detected, but denomination not recognized.');
                }
            } else {
                setCurrencyDetected(false);
                Speech.speak('No currency detected');
            }
        } catch (error) {
            //console.error('Error analyzing image:', error.message);
        }
    };

    const handleMessage = (event) => {
        const base64ImageData = event.nativeEvent.data;
        analyzeImage(base64ImageData);
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            captureImage();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Currency Detection</Text>
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
            {currencyDetected && (
                <View style={styles.detectedContainer}>
                    <Text style={styles.detectedText}>
                        {matchedCurrency ? `Detected Currency Note, Amount: ${matchedCurrency.amount}` : 'Currency Note Detected'}
                    </Text>
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
    detectedContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#c0ffb3',
        borderRadius: 10,
        alignSelf: 'center',
    },
    detectedText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
});

export default Currency;
