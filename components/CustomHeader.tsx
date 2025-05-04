import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as Font from "expo-font";

export default function CustomHeader({ title, colorScheme }: { title: string; colorScheme: string }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      "FreshMango-Italic": require("@/assets/fonts/FreshMango-Italic.ttf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }
  switch (title) {
    case "Wochenplan":
      return (
        <View style={[styles.header, { backgroundColor: "#f2e9e1" }]}>
          <Text style={{ fontFamily: "FreshMango-Italic", fontSize: 35, color: "black" }}>{title}</Text>
        </View>
      );
    case "Einkaufsliste":
      return (
        <View style={[styles.header, { backgroundColor: "#f2e9e1" }]}>
          <Text style={{ fontFamily: "FreshMango-Italic", fontSize: 35, color: "black" }}>{title}</Text>
        </View>
      );
    case "Vorratskammer":
      return (
        <View style={[styles.header, { backgroundColor: "#f2e9e1" }]}>
          <Text style={{ fontFamily: "FreshMango-Italic", fontSize: 35, color: "black" }}>{title}</Text>
        </View>
      );
    case "Gerichte":
      return (
        <View style={[styles.header, { backgroundColor: "#f2e9e1" }]}>
          <Text style={{ fontFamily: "FreshMango-Italic", fontSize: 35, color: "black" }}>{title}</Text>
        </View>
      );
    case "SelectGerichte":
      return (
        <View style={[styles.header, { backgroundColor: "#f2e9e1" }]}>
          <Text style={{ fontFamily: "FreshMango-Italic", fontSize: 35, color: "black" }}>{"Gerichte Auswahl"}</Text>
        </View>
      );
    default:
      return (
        <View>
          <Text>Kein HeaderTitle gefunden</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "FreshMango-Italic", // Use your custom font
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
  },
});