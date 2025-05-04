import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Einkaufsliste() {
  interface EinkaufslisteItem {
    quantity: number;
    unit: string;
  }

  const serverip = "yourip"

  const [einkaufsliste, setEinkaufsliste] = useState<Record<string, EinkaufslisteItem> | null>(null);
  const [manuelleZutaten, setManuelleZutaten] = useState<Record<string, EinkaufslisteItem>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State für neue Zutat
  const [newZutat, setNewZutat] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("");

  const fetchEinkaufsliste = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://${serverip}/einkaufsliste`);
      setEinkaufsliste(response.data);
    } catch (error) {
      console.error("Fehler beim Abrufen der Einkaufsliste:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const ladeManuelleZutaten = async () => {
      try {
        const gespeicherteZutaten = await AsyncStorage.getItem("manuelleZutaten");
        if (gespeicherteZutaten) {
          setManuelleZutaten(JSON.parse(gespeicherteZutaten));
        }
      } catch (error) {
        console.error("Fehler beim Laden der manuellen Zutaten:", error);
      }
    };

    ladeManuelleZutaten();
    fetchEinkaufsliste();
  }, [fetchEinkaufsliste]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEinkaufsliste();
  };

  const convertToBaseUnit = (quantity: number, unit: string): number => {
    const unitConversions: Record<string, number> = {
      g: 1, // Gramm als Basiseinheit
      kg: 1000, // 1 kg = 1000 g
      ml: 1, // Milliliter als Basiseinheit
      l: 1000, // 1 l = 1000 ml
      stück: 1, // Stück bleibt unverändert
    };
  
    if (!unitConversions[unit]) {
      console.warn(`Unbekannte Einheit: ${unit}`);
      return quantity;
    }
  
    return quantity * unitConversions[unit];
  };
  
  const convertFromBaseUnit = (quantity: number, baseUnit: string): { quantity: number; unit: string } => {
    const unitConversions: Record<string, number> = {
      g: 1,
      kg: 1000,
      ml: 1,
      l: 1000,
      stück: 1,
    };
  
    if (!unitConversions[baseUnit]) {
      console.warn(`Unbekannte Basiseinheit: ${baseUnit}`);
      return { quantity, unit: baseUnit };
    }
  
    // Rückumrechnung in größere Einheit, wenn möglich
    if (baseUnit === "g" && quantity >= 1000) {
      return { quantity: Math.round((quantity / 1000) * 100) / 100, unit: "kg" };
    } else if (baseUnit === "ml" && quantity >= 1000) {
      return { quantity: Math.round((quantity / 1000) * 100) / 100, unit: "l" };
    }
  
    // Rückumrechnung in kleinere Einheit, wenn nötig
    if (baseUnit === "kg" && quantity < 1) {
      return { quantity: Math.round((quantity * 1000) * 100) / 100, unit: "g" };
    } else if (baseUnit === "l" && quantity < 1) {
      return { quantity: Math.round((quantity * 1000) * 100) / 100, unit: "ml" };
    }
  
    // Keine Umrechnung erforderlich, Einheit beibehalten
    return { quantity: Math.round(quantity * 100) / 100, unit: baseUnit };
  };

  const handleAddZutat = async () => {
    if (!newZutat || !newQuantity || !newUnit) {
      Alert.alert("Fehler", "Bitte fülle alle Felder aus.");
      return;
      
    }

    const quantity = parseFloat(newQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert("Fehler", "Bitte gebe eine Zahl größer 0 an.");
      return;
    }

    const zutatKey = newZutat.toLowerCase(); // Zutat immer in Kleinbuchstaben speichern
    const neueZutat = { [zutatKey]: { quantity, unit: newUnit.toLowerCase() } };

    // Update Zustand
    setManuelleZutaten((prev) => {
      const existingZutat = prev[zutatKey];

      if (existingZutat) {
        // Wenn die Zutat bereits existiert, addiere die Mengen
        const baseQuantityExisting = convertToBaseUnit(existingZutat.quantity, existingZutat.unit);
        const baseQuantityNew = convertToBaseUnit(quantity, newUnit.toLowerCase());

        const combinedQuantity = baseQuantityExisting + baseQuantityNew;

        // Konvertiere zurück in die optimale Einheit
        const { quantity: finalQuantity, unit: finalUnit } = convertFromBaseUnit(combinedQuantity, newUnit.toLowerCase());

        return {
          ...prev,
          [zutatKey]: { quantity: parseFloat(finalQuantity.toFixed(2)), unit: finalUnit },
        };
      }

      // Wenn die Zutat nicht existiert, füge sie hinzu
      return {
        ...prev,
        ...neueZutat,
      };
    });

    // Speichere in AsyncStorage
    try {
      const gespeicherteZutaten = await AsyncStorage.getItem("manuelleZutaten");
      const aktuelleZutaten = gespeicherteZutaten ? JSON.parse(gespeicherteZutaten) : {};

      const existingZutat = aktuelleZutaten[zutatKey];
      let aktualisierteZutaten;

      if (existingZutat) {
        // Wenn die Zutat bereits existiert, addiere die Mengen
        const baseQuantityExisting = convertToBaseUnit(existingZutat.quantity, existingZutat.unit);
        const baseQuantityNew = convertToBaseUnit(quantity, newUnit.toLowerCase());

        const combinedQuantity = baseQuantityExisting + baseQuantityNew;

        // Konvertiere zurück in die optimale Einheit
        const { quantity: finalQuantity, unit: finalUnit } = convertFromBaseUnit(combinedQuantity, newUnit.toLowerCase());

        aktualisierteZutaten = {
          ...aktuelleZutaten,
          [zutatKey]: { quantity: parseFloat(finalQuantity.toFixed(2)), unit: finalUnit },
        };
      } else {
        // Wenn die Zutat nicht existiert, füge sie hinzu
        aktualisierteZutaten = {
          ...aktuelleZutaten,
          ...neueZutat,
        };
      }

      await AsyncStorage.setItem("manuelleZutaten", JSON.stringify(aktualisierteZutaten));
    } catch (error) {
      console.error("Fehler beim Speichern der Zutat:", error);
    }

    // Felder zurücksetzen
    setNewZutat("");
    setNewQuantity("");
    setNewUnit("");
    Alert.alert("YIPPIE", "Zutat wurde erfolgreich hinzugefügt.");
  };

  function changedItemUnit(itemUnit: string) {
    if (itemUnit === "stück") {
      return "Stück";
    }else {
      return itemUnit;
    }
  }

  const handleRemoveManuelleZutaten = async () => {
    // Entferne alle manuellen Zutaten
    setManuelleZutaten({});
    try {
      await AsyncStorage.removeItem("manuelleZutaten");
      Alert.alert("OH YEAH", "Alle eigenen Zutaten wurden entfernt. (Brauch eh keiner)");
    } catch (error) {
      console.error("Fehler beim Entfernen der manuellen Zutaten:", error);
    }

    // Aktualisiere die kombinierte Einkaufsliste
    fetchEinkaufsliste();
  };

  // Kombiniere Einkaufsliste und manuelle Zutaten, addiere Mengen
  const kombinierteEinkaufsliste = useMemo(() => {
    const liste = { ...(einkaufsliste ?? {}) };
    Object.entries(manuelleZutaten).forEach(([name, { quantity, unit }]) => {
      if (liste[name]) {
        // Wenn die Zutat bereits in der Einkaufsliste existiert, addiere die Mengen
        const baseQuantityListe = convertToBaseUnit(liste[name].quantity, liste[name].unit);
        const baseQuantityManuell = convertToBaseUnit(quantity, unit);

        const combinedQuantity = baseQuantityListe + baseQuantityManuell;

        // Konvertiere zurück in die ursprüngliche Einheit der Liste
        const { quantity: finalQuantity, unit: finalUnit } = convertFromBaseUnit(
          combinedQuantity,
          liste[name].unit // Behalte die ursprüngliche Einheit bei
        );

        liste[name] = { quantity: finalQuantity, unit: finalUnit };
      } else {
        // Wenn die Zutat nicht existiert, füge sie hinzu
        liste[name] = { quantity, unit };
      }
    });

    return liste;
  }, [einkaufsliste, manuelleZutaten]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#814256" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#a66940]">
      <ScrollView
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {Object.keys(kombinierteEinkaufsliste).length === 0 && (
            <View className="items-center my-8">
              <Text className="text-lg font-[FreshMango-Italic] text-black">
                Deine Einkaufsliste ist leer.
              </Text>
              <Text className="text-base font-[FreshMango-Italic] text-gray-400 mt-2">
                Heißt, du kannst dein Geld bei DM ausgeben.
              </Text>
            </View>
          )}

        {/* Zutatenliste */}
        {Object.entries(kombinierteEinkaufsliste).map(([name, { quantity, unit }]) => (
          <View key={name} className="flex-row justify-between items-center mb-2">
            <Text className="text-lg flex-1 font-[FreshMango-Italic] text-black">{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
            <Text className="text-lg font-[FreshMango-Italic] text-black flex-row">
              {quantity} {changedItemUnit(unit)}
            </Text>
          </View>
        ))}

        {/* Neue Zutat hinzufügen */}
        <View className="mt-6">
          <Text className="text-lg font-[FreshMango-Italic] text-black mb-2">Neue Zutat hinzufügen:</Text>
          <TextInput
            placeholder="Zutat"
            style={{ fontFamily: "FreshMango-Italic" }}
            value={newZutat}
            onChangeText={setNewZutat}
            className="bg-white p-2 rounded mb-2"
          />
          <TextInput
            placeholder="Menge"
            style={{ fontFamily: "FreshMango-Italic" }}
            value={newQuantity}
            onChangeText={setNewQuantity}
            keyboardType="numeric"
            className="bg-white p-2 rounded mb-2"
          />
          <TextInput
            placeholder="Einheit (g, kg, l, ml, Stück)"
            style={{ fontFamily: "FreshMango-Italic" }}
            value={newUnit}
            onChangeText={setNewUnit}
            className="bg-white p-2 rounded mb-4"
          />
          <TouchableOpacity
            onPress={handleAddZutat}
            className="bg-green-500 px-4 py-2 rounded mb-2"
          >
            <Text className="text-black text-center text-lg font-[FreshMango-Italic]">Zutat hinzufügen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRemoveManuelleZutaten}
            className="bg-red-500 px-4 py-2 rounded"
          >
            <Text className="text-black text-center text-lg font-[FreshMango-Italic]">Manuelle Zutaten entfernen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}