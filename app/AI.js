import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Voice Assistant</Text>
      </View>

      
      <WebView
        source={{ uri: 'https://deepgram.com/agent' }}
        style={styles.webView}
        scalesPageToFit={false}
        injectedJavaScript={`
          document.body.style.overflow = 'hidden'; // Hide scrollbars
          document.body.style.margin = '0'; // Remove default margin
          document.body.style.clipPath = 'inset(20% 10% 28% 10%)'; // Clip top 20%, bottom 20%, left 10%, right 10%
          true; // Required to avoid a warning in WebView
        `}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topBar: {
    height: 70,
    backgroundColor: '#000', 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.2,
    shadowRadius: 5,

  },
  topBarText: {
    color: '#fff', 
    fontSize: 24,
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
});

export default App;
