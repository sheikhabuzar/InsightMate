import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Voice Assistant</Text>
      </View>

      {/* WebView */}
      <WebView
        source={{ uri: 'https://deepgram.com/agent' }}
        style={styles.webView}
        scalesPageToFit={false}
        injectedJavaScript={`
          document.body.style.overflow = 'hidden'; // Hide scrollbars
          document.body.style.margin = '0'; // Remove default margin
          document.body.style.clipPath = 'inset(20% 10% 20% 10%)'; // Clip top 20%, bottom 20%, left 10%, right 10%
          true; // Required to avoid a warning in WebView
        `}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Light background for SafeAreaView
  },
  topBar: {
    height: 60,
    backgroundColor: '#ffff', // Blue color for the top bar
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  topBarText: {
    color: '#000', // White text color
    fontSize: 20,
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
});

export default App;
