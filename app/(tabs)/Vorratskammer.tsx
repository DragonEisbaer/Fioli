import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from "react-native";
import axios from "axios";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function Vorratskammer() {
  const [vorratskammer, setVorratskammer] = useState<Record<string, { quantity: number; unit: string }>>({});
  const [zutatName, setZutatName] = useState("");
  const [zutatQuantity, setZutatQuantity] = useState("");
  const [zutatUnit, setZutatUnit] = useState("");

  const serverip = "yourip"

  // Lade die Vorratskammer-Daten beim Start
  useEffect(() => {
    const fetchVorratskammer = async () => {
      try {
        const response = await axios.get(`https://${serverip}/vorratskammer`);
        setVorratskammer(response.data);
      } catch (error) {
        console.error("Fehler beim Laden der Vorratskammer:", error);
      }
    };

    fetchVorratskammer();
  }, []);

  function nameCapatalize(name: string) {
    const newName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(); // Erster Buchstabe groß, Rest klein
    return newName;
  }

  // Zutat hinzufügen oder aktualisieren
  const handleAddZutat = async () => {
    if (!zutatName || !zutatQuantity || !zutatUnit) {
      Alert.alert("Fehler", "Bitte alle Felder ausfüllen.");
      return;
    }

    const quantity = parseFloat(zutatQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert("Fehler", "Bitte eine gültige Menge eingeben.");
      return;
    }

    try {
      const updatedVorratskammer = {
        ...vorratskammer,
        [zutatName.toLowerCase()]: { quantity, unit: zutatUnit.toLowerCase() }, // Speichere in Kleinbuchstaben
      };

      // Sende die aktualisierten Daten an das Backend
      await axios.post(`https://${serverip}/vorratskammer`, updatedVorratskammer);

      setVorratskammer(updatedVorratskammer);
      setZutatName("");
      setZutatQuantity("");
      setZutatUnit("");
      Alert.alert("Erfolg", "Zutat wurde hinzugefügt.");
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Zutat:", error);
      Alert.alert("Fehler", "Die Zutat konnte nicht hinzugefügt werden.");
    }
  };

  if (Object.keys(vorratskammer).length === 0) {
    return (
      <><View className="flex-1 bg-[#db9a8f] p-3 justify-center items-center">
            <Text className="text-lg font-[FreshMango-Italic] text-black">Keine Zutaten in der Vorratskammer!</Text>
            <Text className="text-lg font-[FreshMango-Italic] text-gray-500">Kannst ja noch was einkaufn :)</Text>
        </View>
        <View className="flex-1 bg-[#db9a8f] p-4">
        <Text className="text-lg font-[FreshMango-Italic] mb-2">Neue Zutat hinzufügen:</Text>
        <TextInput
            className="bg-white p-2 rounded mb-2"
            placeholder="Zutat Name"
            style={{ fontFamily: "FreshMango-Italic" }}
            value={zutatName}
            onChangeText={setZutatName}
        />
        <TextInput
            className="bg-white p-2 rounded mb-2"
            placeholder="Menge"
            style={{ fontFamily: "FreshMango-Italic" }}
            keyboardType="numeric"
            value={zutatQuantity}
            onChangeText={setZutatQuantity}
        />
        <TextInput
            className="bg-white p-2 rounded mb-4"
            placeholder="Einheit (g, kg, ml, l, Stück)"
            style={{ fontFamily: "FreshMango-Italic" }}
            value={zutatUnit}
            onChangeText={setZutatUnit}
        />
        <TouchableOpacity
            onPress={handleAddZutat}
            className="bg-green-500 px-4 py-2 rounded"
        >
            <Text className="text-black text-center text-lg font-[FreshMango-Italic]">Zutat hinzufügen</Text>
        </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <View className="flex-1 bg-[#db9a8f] p-4">
      {/* Zutatenliste */}
      <FlatList
        data={Object.entries(vorratskammer)}
        keyExtractor={([name]) => name}
        renderItem={({ item: [name, { quantity, unit }] }) => (
          <View className="flex-row justify-between items-center mb-2 border-b">
            <View className="flex-1">
              <Text className="text-lg text-black font-[FreshMango-Italic]">{nameCapatalize(name)}</Text>
              <Text className="text-lg text-black font-[FreshMango-Italic]">
                {quantity} {unit}
              </Text>
            </View>
            {/* Löschen-FontAwesome5 */}
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Zutat löschen?",
                  `Möchtest du die Zutat '${nameCapatalize(name)}' wirklich löschen?`,
                  [
                    {
                      text: "Abbrechen",
                      style: "cancel",
                    },
                    {
                      text: "Löschen",
                      onPress: async () => {
                        try {
                          await axios.delete(`https://${serverip}/vorratskammer/${name}`);
                          // Aktualisiere die Vorratskammer
                          const response = await axios.get(`https://${serverip}/vorratskammer`);	
                          setVorratskammer(response.data);
                          Alert.alert("Erfolg", `Die Zutat '${nameCapatalize(name)}' wurde gelöscht.`);
                        } catch (error) {
                          console.error("Fehler beim Löschen der Zutat:", error);
                          Alert.alert("Fehler", "Die Zutat konnte nicht gelöscht werden.");
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <FontAwesome5 name="trash" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Neue Zutat hinzufügen */}
      <Text className="text-lg font-[FreshMango-Italic] mb-2">Neue Zutat hinzufügen:</Text>
      <TextInput
        className="bg-white p-2 rounded mb-2"
        placeholder="Zutat Name"
        style={{ fontFamily: "FreshMango-Italic" }}
        value={zutatName}
        onChangeText={setZutatName}
      />
      <TextInput
        className="bg-white p-2 rounded mb-2"
        placeholder="Menge"
        style={{ fontFamily: "FreshMango-Italic" }}
        keyboardType="numeric"
        value={zutatQuantity}
        onChangeText={setZutatQuantity}
      />
      <TextInput
        className="bg-white p-2 rounded mb-4"
        placeholder="Einheit (g, kg, ml, l, Stück)"
        style={{ fontFamily: "FreshMango-Italic" }}
        value={zutatUnit}
        onChangeText={setZutatUnit}
      />
      <TouchableOpacity
        onPress={handleAddZutat}
        className="bg-green-500 px-4 py-2 rounded"
      >
        <Text className="text-black font-[FreshMango-Italic] text-center text-lg">Zutat hinzufügen</Text>
      </TouchableOpacity>
    </View>
  );
}