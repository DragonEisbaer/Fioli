import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

const Wochentage = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const Kategorien = ["Frühstück", "Mittagessen", "Abendessen", "Snack"] as const;

export default function Wochenplan() {
  const router = useRouter();
  type Gericht = { label: string; value: string };

  const [gerichte, setGerichte] = useState<Record<string, Gericht[]>>({
    frühstück: [],
    mittagessen: [],
    abendessen: [],
    snack: [],
  });

  const serverip = "yourip"

  const [selectedGerichte, setSelectedGerichte] = useState<Record<string, Record<string, string | null>>>({});

  // Fetch Gerichte von der API
  useEffect(() => {
    const fetchGerichte = async () => {
      try {
        const response = await axios.get(`https://${serverip}/gerichte`);
        setGerichte(response.data);
      } catch (error) {
        console.error("Fehler beim Laden der Gerichte:", error);
      }
    };

    fetchGerichte();
  }, []);

  // Fetch Wochenplan von der API
  useEffect(() => {
    const fetchWochenplan = async () => {
      try {
        const response = await axios.get(`https://${serverip}/wochenplan`);
        setSelectedGerichte(response.data);
      } catch (error) {
        console.error("Fehler beim Laden des Wochenplans:", error);
      }
    };

    fetchWochenplan();
  }, []);

  const resetWochenplan = async () => {
    try {
      const response = await axios.post(`https://${serverip}/wochenplan/reset`);
      setSelectedGerichte(response.data.data); // Aktualisiere den State
      Alert.alert("Erfolg", "Der Wochenplan wurde erfolgreich zurückgesetzt.");
    } catch (error) {
      console.error("Fehler beim Zurücksetzen des Wochenplans:", error);
      Alert.alert("Fehler", "Der Wochenplan konnte nicht zurückgesetzt werden.");
    }
  };

  const navigateToSelectGericht = (tag: string, kategorie: string) => {
    router.push({
      pathname: "/Helpers/SelectGericht",
      params: { tag, kategorie },
    });
  };

  return (
    <View className="flex-1 bg-[#716f35] justify-center items-center">
      <View className="bg-[#716f35] w-full max-w-[95%]">
        {/* Header */}
        <View className="flex-row">
          <View className="flex-1 justify-center items-center py-2">
            <Text className="text-white font-[FreshMango-Italic]" style={{fontSize: 11}}>Nom Nom</Text>
          </View>
          {Kategorien.map((kategorie) => (
            <View key={kategorie} className="flex-1 justify-between items-center py-2">
              <Text className="text-white p-2 font-[FreshMango-Italic]" style={{fontSize: 10}}>{kategorie}</Text>
            </View>
          ))}
        </View>

        {/* Rows */}
        {Wochentage.map((tag, rowIndex) => (
          <View key={tag} className={`flex-row ${rowIndex === Wochentage.length - 1 ? "" : "border-b border-white"}`}>
            <View className="flex-1 justify-center items-center py-2">
              <Text className="text-white font-[FreshMango-Italic]" style={{fontSize: 11}}>{tag}</Text>
            </View>
            {Kategorien.map((kategorie, colIndex) => (
              <View
                key={`${tag}-${kategorie}`}
                className={`flex-1 justify-center items-center py-2 ${
                  colIndex === Kategorien.length - 1 ? "" : "border-r border-white"
                }`}
              >
                <TouchableOpacity
                  onPress={() =>{navigateToSelectGericht(tag, kategorie);}}
                  className="bg-[#814256] px-1 py-2 rounded"
                  >
                  <Text className="text-black font-[FreshMango-Italic]" style={{fontSize: 11}}>
                    {(() => {
                      const value = selectedGerichte[tag.toLowerCase()]?.[kategorie.toLowerCase()];
                      if (!value) return "Keine Auswahl";
                      const gericht = gerichte[kategorie.toLowerCase()]?.find(g => g.value === value);
                      return gericht ? gericht.label : value;
                    })()}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        {/* Reset Button */}
        <View className="mt-4">
          <TouchableOpacity
            onPress={resetWochenplan}
            className="bg-red-500 px-4 py-2 rounded"
          >
            <Text className="text-black text-center font-[FreshMango-Italic] text-lg">Wochenplan zurücksetzen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}