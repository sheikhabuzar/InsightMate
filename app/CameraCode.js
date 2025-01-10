import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
//      source={{ uri: 'https://ShafqatWarraich.github.io/webcam/web_cam.html ' }}
const CameraWebView = () => {
  return (
    <View style={{ flex: 1 }}>
     
      <WebView
      source={{ uri: 'https://ShafqatWarraich.github.io/webcamera/web_cam.html' }}
      javaScriptEnabled={true}  // Enable JavaScript
      domStorageEnabled={true}  // Enable DOM storage
      mediaPlaybackRequiresUserAction={false}  // Allow media playback without user action
      allowsInlineMediaPlayback={true}  // Enable inline media playback
      startInLoadingState={true}  // Show a loading indicator
      onError={(error) => console.log(error)}  // Error handling
    /> 

    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default CameraWebView;
