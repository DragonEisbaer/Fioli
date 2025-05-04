import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, StatusBar } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BackHandler } from "react-native";
import axios from "axios";

export default function SelectGericht() {
  const router = useRouter();
  const { tag, kategorie } = useLocalSearchParams<{ tag: string; kategorie: string }>();
  const [gerichteData, setGerichteData] = useState<any[]>([]);

  const serverip = "yourip"

  useEffect(() => {
    const fetchGerichte = async () => {
      try {
        const response = await axios.get(`https://${serverip}/gerichte`);
        setGerichteData(response.data[kategorie.toLowerCase()] || []);
      } catch (error) {
        console.error("Fehler beim Abrufen der Gerichte:", error);
      }
    };

    fetchGerichte();
  }, [kategorie]);

  useEffect(() => {
    const onBackPress = () => {
      router.replace("/(tabs)/Wochenplan"); // Immer auf Wochenplan zurück
      return true; // verhindert das Standardverhalten
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

  const handleSelect = async (gericht: string | null) => {
    try {
      const kategorieLower = kategorie.toLowerCase();
      const taglower = tag.toLowerCase();

      await axios.patch(`https://${serverip}/wochenplan`, {
        tag: taglower,
        kategorie: kategorieLower,
        gericht,
      });

      // Klarname (label) suchen
      let klarname = "Kein Gericht";
      if (gericht) {
        const gefunden = gerichteData.find(g => g.value === gericht);
        klarname = gefunden ? gefunden.label : gericht;
      } else {
        klarname = "Keine Auswahl";
      }

      Alert.alert(
        "WOWI",
        gericht
          ? `${klarname} wurde für ${tag} - ${kategorie} gespeichert.`
          : `Gericht für ${tag} - ${kategorie} wurde entfernt.`
      );
      router.push("/(tabs)/Wochenplan");
    } catch (error) {
      console.error("Fehler beim Speichern der Auswahl:", error);
      Alert.alert("Fehler", "Die Auswahl konnte nicht gespeichert werden.");
    }
  };

  const extraOption = { label: "Kein Gericht auswählen", value: null };
  const gerichteMitExtra = [extraOption, ...gerichteData];

  return (
    <View className="flex-1 bg-[#716f35] items-center">
      <StatusBar barStyle="dark-content" backgroundColor="#716f35" />
      <Text className="text-2xl text-white font-bold mt-4 mb-4">
        Auswahl für {tag} - {kategorie}
      </Text>
      <FlatList
        data={gerichteMitExtra}
        keyExtractor={(item, index) => `${item.label}-${index}`}
        className="w-full max-w-[90%]"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-[#814256] rounded-lg py-3 mb-4"
            onPress={() => handleSelect(item.value)}
          >
            <Text className="text-white text-center text-lg">{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}