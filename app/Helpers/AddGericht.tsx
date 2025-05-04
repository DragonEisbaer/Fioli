import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StatusBar, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import axios from "axios";

export default function AddGericht() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [gerichtName, setGerichtName] = useState("");
  const [zutaten, setZutaten] = useState<{ name: string; quantity: number; unit: string }[]>([]);
  const [zutatName, setZutatName] = useState("");
  const [zutatQuantity, setZutatQuantity] = useState("");
  const [zutatUnit, setZutatUnit] = useState("");
  const [anleitung, setAnleitung] = useState("");

  const serverip = "yourip"

  const handleAddZutat = () => {
    if (zutatName.trim() === "" || zutatQuantity.trim() === "" || zutatUnit.trim() === "") return;

    setZutaten((prev) => [
      ...prev,
      { name: zutatName.toLowerCase(), quantity: parseFloat(zutatQuantity), unit: zutatUnit.toLowerCase() },
    ]);
    setZutatName("");
    setZutatQuantity("");
    setZutatUnit("");
  };

  function changedItemUnit(itemUnit: string) {
    if (itemUnit === "stück") {
      return "Stück";
    }else {
      return itemUnit;
    }
  }

  function nameCapatalize(name: string) {
    const newName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(); // Erster Buchstabe groß, Rest klein
    return newName;
  }

  const handleAddGericht = async () => {
    if (!category) {
      console.error("Ungültige Kategorie:", category);
      return;
    }

    if (gerichtName.trim() === "" || zutaten.length === 0) {
      console.error("Gericht Name oder Zutaten fehlen");
      return;
    }

    const newGericht = {
      label: gerichtName,
      value: gerichtName.toLowerCase().replace(/\s+/g, "-"),
      zutaten,
      anleitung,
    };

    try {
      // Sende das neue Gericht an das Backend
      const response = await axios.post(
        `https://${serverip}/gerichte/${category}`, // Für mich
        // `https://10.0.2.2:3000/gerichte/${category}`, // Für Android-Emulator
        newGericht
      );

      // Überprüfe die Gesamtanzahl der Gerichte
      const allGerichteResponse = await axios.get(`https://${serverip}/gerichte`);
      const totalGerichte = Object.values(allGerichteResponse.data).reduce(
        (sum: number, categoryGerichte) => sum + (categoryGerichte as any[]).length, 0
      );

      if (totalGerichte === 100) {
        Alert.alert(
          "🎉 Glückwunsch! 🎉",
          "Du hast insgesamt 100 Gerichte hinzugefügt! Du bist ein wahrer Meisterkoch! 👨‍🍳👩‍🍳"
        );
      }

      // Zurück zur vorherigen Seite navigieren
      router.back();
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Gerichts:", error);
    }
  };

  let formattedCategory = category;

  if (category === "frühstück") {
    formattedCategory = "Frühstück";
  } else if (category === "mittagessen") {
    formattedCategory = "Mittagessen";
  } else if (category === "abendessen") {
    formattedCategory = "Abendessen";
  } else if (category === "snack") {
    formattedCategory = "Snack";
  }

  return (
    <ScrollView className="flex-1 bg-[#ffdfc4] p-4">
      <StatusBar barStyle="dark-content" backgroundColor="#ffdfc4" />
      <Text className="text-2xl font-bold mb-4">Neues Gericht hinzufügen</Text>
      <Text className="text-lg mb-2">Kategorie: {formattedCategory}</Text>

      {/* Gericht Name */}
      <TextInput
        className="bg-white p-2 rounded mb-4"
        placeholder="Gericht Name eingeben"
        value={gerichtName}
        onChangeText={(text) => setGerichtName(text)}
      />

      {/* Zutaten hinzufügen */}
      <Text className="text-lg font-semibold mb-2">Zutaten:</Text>
      <TextInput
        className="bg-white p-2 rounded mb-2"
        placeholder="Zutat Name"
        value={zutatName}
        onChangeText={(text) => setZutatName(text)}
      />
      <TextInput
        className="bg-white p-2 rounded mb-2"
        placeholder="Menge"
        keyboardType="numeric"
        value={zutatQuantity}
        onChangeText={(text) => setZutatQuantity(text)}
      />
      <TextInput
        className="bg-white p-2 rounded mb-4"
        placeholder="Einheit (g, kg, ml, l, Stück)"
        value={zutatUnit}
        onChangeText={(text) => setZutatUnit(text)}
      />
      <TouchableOpacity
        className="bg-blue-500 p-2 rounded mb-4"
        onPress={handleAddZutat}
      >
        <Text className="text-white text-center">Zutat hinzufügen</Text>
      </TouchableOpacity>

      {/* Zutatenliste */}
      {zutaten.map((item, index) => (
        <Text key={`${item.name}-${index}`} className="text-base text-gray-800">
          - {item.quantity} {changedItemUnit(item.unit)} {nameCapatalize(item.name)}
        </Text>
      ))}

      {/* Anleitung hinzufügen */}
      <Text className="text-lg font-semibold mb-2">Anleitung:</Text>
      <TextInput
        className="bg-white p-2 rounded mb-4"
        placeholder="Hier die Zubereitungsschritte eingeben..."
        value={anleitung}
        onChangeText={(text) => setAnleitung(text)}
        multiline
        numberOfLines={6}
        style={{ minHeight: 100, textAlignVertical: "top" }}
      />

      {/* Gericht hinzufügen */}
      <TouchableOpacity
        className="bg-green-500 p-2 rounded mt-4"
        onPress={handleAddGericht}
      >
        <Text className="text-white text-center">Gericht hinzufügen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}