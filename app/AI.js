import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import axios from 'axios';

// Set up Dialogflow API credentials
const sessionId = "test-session-123";
const DIALOGFLOW_API_URL = `https://dialogflow.googleapis.com/v2/projects/object-detection-446516/agent/sessions/${sessionId}:detectIntent`;
const DIALOGFLOW_ACCESS_TOKEN = 'AIzaSyCaREgPQjYUsrzG9HR37FK63RhS6hy5SSw';

const DialogflowChat = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  
  // Function to send the text to Dialogflow and get a response
  const sendToDialogflow = async () => {
    if (!query) return;

    const data = {
      queryInput: {
        text: {
          text: query,
          languageCode: 'en-US',
        },
      },
    };

    try {
      const result = await axios.post(DIALOGFLOW_API_URL, data, {
        headers: {
          Authorization: `Bearer ${DIALOGFLOW_ACCESS_TOKEN}`,
        },
      });

      const reply = result.data.queryResult.fulfillmentText;
      setResponse(reply);
    } catch (error) {
      console.error("Error communicating with Dialogflow: ", error);
      setResponse("Sorry, I couldn't process your request.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type your query"
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Send to Dialogflow" onPress={sendToDialogflow} />
      <Text style={styles.responseText}>Response: {response}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
  responseText: {
    marginTop: 20,
    fontSize: 16,
    color: 'blue',
  },
});

export default DialogflowChat;
