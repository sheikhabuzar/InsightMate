import { View, Text, StyleSheet } from "react-native";

export default function SavedLocations() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👤 Location Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
