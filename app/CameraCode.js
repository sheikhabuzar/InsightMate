import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
//      source={{ uri: 'https://ShafqatWarraich.github.io/webcam/web_cam.html ' }}
const CameraWebView = () => {
  return (
    <View style={{ flex: 1 }}>
     
      <WebView
      source={{ uri: 'https://ShafqatWarraich.github.io/webcamera/web_cam.html' }}
      javaScriptEnabled={true}  
      domStorageEnabled={true}  
      mediaPlaybackRequiresUserAction={false}  
      allowsInlineMediaPlayback={true}  
      startInLoadingState={true}  
      onError={(error) => console.log(error)} 
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
