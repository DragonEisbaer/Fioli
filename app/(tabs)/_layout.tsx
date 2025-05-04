import React, { useEffect, useState, useRef } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import * as Font from "expo-font";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View, ActivityIndicator, StatusBar, Animated, Image } from "react-native";
import CustomHeader from "@/components/CustomHeader";

function FontLoader({ children }: { children: React.ReactNode }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "FreshMango-Italic": require("../../assets/fonts/FreshMango-Italic.ttf"),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <>{children}</>;
}

let splashAlreadyShown = false; // Variable, um zu überprüfen, ob der Splash-Screen bereits angezeigt wurde

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] || "index";
  const headerShown = useClientOnlyValue(true, true);

  const activeTintColor = (() => {
    switch (currentRoute) {
      case "(tabs)":
        return "#814256";
      case "Wochenplan":
        return "#716f35";
      case "Einkaufsliste":
        return "#a66940";
      case "Vorratskammer":
        return "#db9a8f";
      default:
        return "gray";
    }
  })();

  // Splash-Image Animation
  const [showSplash, setShowSplash] = useState(!splashAlreadyShown); // Zustand für den Splash-Screen
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!showSplash) return; // Wenn der Splash-Screen nicht angezeigt wird, nichts tun
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 700, // Dauer des Ausfadens in ms
        useNativeDriver: true,
      }).start(() => {setShowSplash(false); splashAlreadyShown = true;}); // Splash-Screen ausblenden
    }, 2000); // Splash bleibt 2s sichtbar
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <Animated.View style={{ flex: 1, backgroundColor: "#814256", justifyContent: "center", alignItems: "center", opacity: fadeAnim }}>
        <Image
          source={require("../../assets/images/hellye-big.png")}
          style={{ width: "100%", height: "100%", resizeMode: "cover" }}
        />
      </Animated.View>
    );
  }

  return (
    <FontLoader>
      <StatusBar barStyle="dark-content" backgroundColor="#f2e9e1" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTintColor,
          tabBarInactiveTintColor: "gray",
          tabBarBackground: () => <View style={{ flex: 1, backgroundColor: "#f2e9e1" }} />,
          headerShown,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Gerichte",
            tabBarIcon: ({ color }) => <FontAwesome6 name="bowl-food" size={24} color={color} />,
            header: () => <CustomHeader title="Gerichte" colorScheme={colorScheme ?? "light"} />,
          }}
        />
        <Tabs.Screen
          name="Wochenplan"
          options={{
            title: "Wochenplan",
            tabBarIcon: ({ color }) => <FontAwesome6 name="calendar-days" size={24} color={color} />,
            header: () => <CustomHeader title="Wochenplan" colorScheme={colorScheme ?? "light"} />,
          }}
        />
        <Tabs.Screen
          name="Einkaufsliste"
          options={{
            title: "Einkaufsliste",
            tabBarIcon: ({ color }) => <FontAwesome6 name="basket-shopping" size={24} color={color} />,
            header: () => <CustomHeader title="Einkaufsliste" colorScheme={colorScheme ?? "light"} />,
          }}
        />
        <Tabs.Screen
          name="Vorratskammer"
          options={{
            title: "Vorratskammer",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="fridge" size={24} color={color} />,
            header: () => <CustomHeader title="Vorratskammer" colorScheme={colorScheme ?? "light"} />,
          }}
        />
      </Tabs>
    </FontLoader>
  );
}
