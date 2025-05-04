import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StatusBar, TextInput, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import axios from "axios";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function GerichteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter(); // Router für Navigation
  const [gericht, setGericht] = useState<any>(null); // Zustand für das Gericht
  const [loading, setLoading] = useState(true); // Ladezustand
  const [error, setError] = useState<string | null>(null); // Fehlerzustand
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editZutaten, setEditZutaten] = useState<any[]>([]);
  const [editAnleitung, setEditAnleitung] = useState("");

  function nameCapatalize(name: string) {
    const newName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(); // Erster Buchstabe groß, Rest klein
    return newName;
  }

  const serverip = "yourip"

  // Gericht aus dem Backend abrufen
  useEffect(() => {
    const fetchGericht = async () => {
      try {
        setLoading(true);
        setError(null);

        // Abrufen aller Gerichte aus dem Backend
        const response = await axios.get(`https://${serverip}/gerichte`); // Für Android-Emulator
        const gerichte = response.data;

        let foundGericht: any = null;
        let foundKategorie: string | null = null;

        for (const kategorie of ["frühstück", "mittagessen", "abendessen", "snack"]) {
          const gericht = gerichte[kategorie].find((item: any) => item.label === id);
          if (gericht) {
            foundGericht = { ...gericht, kategorie }; // <-- Kategorie mitgeben!
            foundKategorie = kategorie;
            break;
          }
        }

        if (!foundGericht) {
          setError("Gericht nicht gefunden!");
        } else {
          setGericht(foundGericht);
        }
      } catch (err) {
        setError("Fehler beim Abrufen der Daten.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGericht();
  }, [id]);

  useEffect(() => {
    if (gericht) {
      setEditName(gericht.label);
      setEditZutaten(gericht.zutaten);
      setEditAnleitung(gericht.anleitung || "");
    }
  }, [gericht]);

  const handleSave = async () => {
    try {
      await axios.put(
        `https://${serverip}/gerichte/${gericht.kategorie}/${gericht.value}`,
        {
          label: editName,
          value: gericht.value,
          zutaten: editZutaten,
          anleitung: editAnleitung,
        }
      );
      setGericht({
        ...gericht,
        label: editName,
        zutaten: editZutaten,
        anleitung: editAnleitung,
      });
      setEditMode(false);
      Alert.alert("Erfolg", "Gericht wurde aktualisiert.");
    } catch (err) {
      Alert.alert("Fehler", "Gericht konnte nicht aktualisiert werden.");
      console.error(err);
    }
  };

  function changedItemUnit(itemUnit: string) {
    if (itemUnit === "stück") {
      return "Stück";
    }else {
      return itemUnit;
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#ffdfc4]">
        <ActivityIndicator size="large" color="#814256" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-[#ffdfc4]">
        <Text className="text-lg text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#ffdfc4]">
      <StatusBar barStyle="dark-content" backgroundColor="#814256" />
      {/* Header mit Zurück-Button und Stift-Icon */}
      <View className="flex-row items-center justify-between p-4 bg-[#814256]">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white text-lg">← Zurück</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setEditMode(true)}>
          <FontAwesome5 name="pen" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bearbeitungsmodus */}
      {editMode ? (
        <View className="flex-1 p-4">
          <Text className="text-2xl font-bold mb-4">Gericht bearbeiten</Text>
          <Text className="text-lg font-semibold mb-2">Name:</Text>
          <TextInput
            className="bg-white p-2 rounded mb-4"
            value={editName}
            onChangeText={setEditName}
          />

          <Text className="text-lg font-semibold mb-2">Zutaten:</Text>
          {editZutaten.map((item, idx) => (
            <View key={idx} className="flex-row items-center mb-2">
              <TextInput
                className="bg-white p-2 rounded flex-1 mr-2"
                value={item.name}
                onChangeText={text => {
                  const newArr = [...editZutaten];
                  newArr[idx].name = text;
                  setEditZutaten(newArr);
                }}
              />
              <TextInput
                className="bg-white p-2 rounded w-16 mr-2"
                value={String(item.quantity)}
                keyboardType="numeric"
                onChangeText={text => {
                  const newArr = [...editZutaten];
                  newArr[idx].quantity = Number(text);
                  setEditZutaten(newArr);
                }}
              />
              <TextInput
                className="bg-white p-2 rounded w-20"
                value={item.unit}
                onChangeText={text => {
                  const newArr = [...editZutaten];
                  newArr[idx].unit = text;
                  setEditZutaten(newArr);
                }}
              />
            </View>
          ))}

          <Text className="text-lg font-semibold mb-2 mt-4">Anleitung:</Text>
          <TextInput
            className="bg-white p-2 rounded mb-4"
            value={editAnleitung}
            onChangeText={setEditAnleitung}
            multiline
            numberOfLines={6}
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />

          <TouchableOpacity
            className="bg-green-500 p-2 rounded mt-4"
            onPress={handleSave}
          >
            <Text className="text-white text-center">Speichern</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-400 p-2 rounded mt-2"
            onPress={() => setEditMode(false)}
          >
            <Text className="text-white text-center">Abbrechen</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Anzeige-Modus wie gehabt
        <View className="flex-1 p-4">
          <Text className="text-2xl font-bold mb-4">{gericht.label}</Text>
            <Text className="text-lg font-semibold mb-2">Zutaten:</Text>
            {gericht.zutaten.map((item: { name: string; quantity: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; unit: string; }, index: number) => (
            <Text key={`${item.name}-${index}`} className="text-black">
              - {item.quantity} {changedItemUnit(item.unit)} {nameCapatalize(item.name)}
            </Text>
            ))}
            {gericht.anleitung && (
            <View className="mt-4">
              <Text className="text-lg font-semibold mb-2">Anleitung:</Text>
              <Text className="text-black whitespace-pre-line">{gericht.anleitung}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}