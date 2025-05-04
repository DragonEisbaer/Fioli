import { ActivityIndicator, TouchableOpacity, Alert, Image } from "react-native";
import { Text, View } from "@/components/Themed";
import { useEffect, useState, useRef } from "react";
import React from "react";
import * as Font from "expo-font";
import DropDownPicker from "react-native-dropdown-picker";
import { router } from "expo-router";
import axios from "axios";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function Gerichte() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [gerichte, setGerichte] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const serverip = "yourip";

  // State für die Dropdown-Menüs
  const [dropdownStates, setDropdownStates] = useState({
    frühstückOpen: false,
    mittagessenOpen: false,
    abendessenOpen: false,
    snackOpen: false,
  });

  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const loadFonts = async () => {
    await Font.loadAsync({
      "FreshMango-Italic": require("../../assets/fonts/FreshMango-Italic.ttf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    loadFonts();

    // Lade Gerichte im Hintergrund
    const fetchGerichte = async () => {
      try {
        const response = await axios.get(`https://${serverip}/gerichte`);
        setGerichte(response.data);
      } catch (error) {
        console.error("Fehler beim Abrufen der Gerichte:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGerichte();
  }, []);

  if (!fontsLoaded || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#814256]">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!gerichte) {
    return (
      <View className="flex-1 justify-center items-center bg-[#814256]">
        <Text className="text-lg text-red-500">Fehler beim Laden der Gerichte.</Text>
      </View>
    );
  }

  // Funktion zum Schließen aller Dropdown-Menüs
  const closeAllDropdowns = () => {
    setDropdownStates({
      frühstückOpen: false,
      mittagessenOpen: false,
      abendessenOpen: false,
      snackOpen: false,
    });
  };

  return (
    <View className="bg-[#814256] flex-1 p-4">
      {/* Frühstück Dropdown */}
      <View className="mb-4 bg-[#814256]">
        <Text className="text-lg text-black font-[FreshMango-Italic] bg-[#814256] mb-2">Frühstück</Text>
        <DropDownPicker
          open={dropdownStates.frühstückOpen}
          value={selectedValue}
          items={[
            ...gerichte.frühstück.map((gericht: any) => ({
              label: (
                <View className="flex-row justify-between items-center bg-[#f2e9e1] p-2 rounded">
                  <View className="flex-1 bg-[#f2e9e1] justify-start">
                    <TouchableOpacity
                      onPress={() => {
                        router.push(`/Helpers/Gerichte/${gericht.label}`);
                      }}
                    >
                      <Text className="text-black">{gericht.label}</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Löschen-Icon */}
                  <View className="justify-end items-end bg-[#f2e9e1] flex-1">
                    <TouchableOpacity
                      onPress={async () => {
                        Alert.alert(
                          "Gericht löschen?",
                          `Möchtest du das Gericht für ${gericht.label} wirklich löschen?`,
                          [
                            {
                              text: "Nah Uh",
                              style: "cancel",
                            },
                            {
                              text: "Absoluti",
                              onPress: async () => {
                                try {
                                  await axios.delete(`https://${serverip}/gerichte/frühstück/${gericht.value}`);
                                  // Aktualisiere die Gerichte-Liste
                                  const response = await axios.get(`https://${serverip}/gerichte`);
                                  setGerichte(response.data);
                                } catch (error) {
                                  console.error("Fehler beim Löschen des Gerichts:", error);
                                  alert("Fehler beim Löschen des Gerichts.");
                                }
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <FontAwesome5 name="trash" size={20} color="red"/>
                    </TouchableOpacity>
                  </View>
                </View>
              ),
              value: gericht.value,
              key: gericht.value,
            })),
            { label: "+ Gericht hinzufügen", value: "add-frühstück", key: "add-frühstück" },
          ]}
          setOpen={(value) => {
            closeAllDropdowns();
            setDropdownStates((prev) => ({ ...prev, frühstückOpen: !!value }));
          }}
          setValue={(callback) => {
            const value = typeof callback === "function" ? callback(selectedValue) : callback;
            setSelectedValue(value);
            if (value === "add-frühstück") {
              router.push("/Helpers/AddGericht?category=frühstück");
            } else if (value) {
              router.push(`/Helpers/Gerichte/${value}`);
            }
          }}
          placeholder="Was gibts zum Frühstück?"
          placeholderStyle={{ fontFamily: "FreshMango-Italic" }}
          style={{
            backgroundColor: "#f2e9e1",
            elevation: dropdownStates.frühstückOpen ? 10 : 1,
            zIndex: dropdownStates.frühstückOpen ? 1000 : 1,
          }}
          dropDownContainerStyle={{
            backgroundColor: "#f2e9e1",
            elevation: dropdownStates.frühstückOpen ? 10 : 1,
            zIndex: dropdownStates.frühstückOpen ? 1000 : 1,
          }}
          maxHeight={200}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
            keyboardShouldPersistTaps: "handled",
          }}
        />
      </View>

      {/* Mittagessen Dropdown */}
      <View className="mb-4 bg-[#814256]">
        <Text className="font-[FreshMango-Italic] text-lg text-black mb-2">Mittagessen</Text>
        <DropDownPicker
          open={dropdownStates.mittagessenOpen}
          value={selectedValue}
          items={[...gerichte.mittagessen.map((gericht: any) => ({
            label: (
              <View className="flex-row justify-between items-center bg-[#f2e9e1] p-2 rounded">
                <View className="flex-1 bg-[#f2e9e1] justify-start">
                  <TouchableOpacity
                    onPress={() => {
                      router.push(`/Helpers/Gerichte/${gericht.label}`);
                    }}
                  >
                    <Text className="text-black">{gericht.label}</Text>
                  </TouchableOpacity>
                </View>
                {/* Löschen-Icon */}
                <View className="justify-end items-end bg-[#f2e9e1] flex-1">
                <TouchableOpacity
                  onPress={async () => {
                    Alert.alert(
                      "Gericht löschen?",
                      `Möchtest du das Gericht für ${gericht.label} wirklich löschen?`,
                      [
                        {
                          text: "Nah Uh",
                          style: "cancel",
                        },
                        {
                          text: "Absoluti",
                          onPress: async () => {
                            try {
                              await axios.delete(`https://${serverip}/gerichte/mittagessen/${gericht.value}`);
                              // Aktualisiere die Gerichte-Liste
                              const response = await axios.get(`https://${serverip}/gerichte`);
                              setGerichte(response.data);
                            } catch (error) {
                              console.error("Fehler beim Löschen des Gerichts:", error);
                              alert("Fehler beim Löschen des Gerichts.");
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <FontAwesome5 name="trash" size={20} color="red"/>
                </TouchableOpacity>
                </View>
              </View>
            ),
            value: gericht.value,
            key: gericht.value,
          })), 
          { label: "+ Gericht hinzufügen", value: "add-mittagessen", key: "add-mittagessen" }
        ]}
          setOpen={(value) => {
            closeAllDropdowns();
            setDropdownStates((prev) => ({ ...prev, mittagessenOpen: !!value }));
          }}
          setValue={(callback) => {
            const value = typeof callback === "function" ? callback(selectedValue) : callback;
            setSelectedValue(value);
            if (value === "add-mittagessen") {
              router.push("/Helpers/AddGericht?category=mittagessen");
            } else if (value) {
              router.push(`/Helpers/Gerichte/${value}`);
            }
          }}
          placeholder="Was gibts zum Mittagessen?"
          placeholderStyle={{ fontFamily: "FreshMango-Italic" }}
          style={{
            backgroundColor: "#f2e9e1",
            zIndex: dropdownStates.mittagessenOpen ? 1000 : 1,
            elevation: dropdownStates.mittagessenOpen ? 10 : 1,
          }}
          dropDownContainerStyle={{
            backgroundColor: "#f2e9e1",
            zIndex: dropdownStates.mittagessenOpen ? 1000 : 1,
            elevation: dropdownStates.mittagessenOpen ? 10 : 1,
          }}
          maxHeight={200}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
            keyboardShouldPersistTaps: "handled",
          }}
        />
      </View>

      {/* Abendessen Dropdown */}
      <View className="mb-4 bg-[#814256]">
        <Text className="text-lg text-black mb-2 font-[FreshMango-Italic]">Abendessen</Text>
        <DropDownPicker
          open={dropdownStates.abendessenOpen}
          value={selectedValue}
          items={[
            ...gerichte.abendessen.map((gericht: any) => ({
              label: (
                <View className="flex-row justify-between items-center bg-[#f2e9e1] p-2 rounded">
                  <View className="flex-1 bg-[#f2e9e1] justify-start">
                    <TouchableOpacity
                      onPress={() => {
                        router.push(`/Helpers/Gerichte/${gericht.label}`);
                      }}
                    >
                      <Text className="text-black">{gericht.label}</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Löschen-Icon */}
                  <View className="justify-end items-end bg-[#f2e9e1] flex-1">
                    <TouchableOpacity
                      onPress={async () => {
                        Alert.alert(
                          "Gericht löschen?",
                          `Möchtest du das Gericht für ${gericht.label} wirklich löschen?`,
                          [
                            {
                              text: "Nah Uh",
                              style: "cancel",
                            },
                            {
                              text: "Absoluti",
                              onPress: async () => {
                                try {
                                  await axios.delete(`https://${serverip}/gerichte/abendessen/${gericht.value}`);
                                  // Aktualisiere die Gerichte-Liste
                                  const response = await axios.get(`https://${serverip}/gerichte`);
                                  setGerichte(response.data);
                                } catch (error) {
                                  console.error("Fehler beim Löschen des Gerichts:", error);
                                  alert("Fehler beim Löschen des Gerichts.");
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
                </View>
              ),
              value: gericht.value,
              key: gericht.value,
            })),
            { label: "+ Gericht hinzufügen", value: "add-abendessen", key: "add-abendessen" },
          ]}
          setOpen={(value) => {
            closeAllDropdowns();
            setDropdownStates((prev) => ({ ...prev, abendessenOpen: !!value }));
          }}
          setValue={(callback) => {
            const value = typeof callback === "function" ? callback(selectedValue) : callback;
            setSelectedValue(value);
            if (value === "add-abendessen") {
              router.push("/Helpers/AddGericht?category=abendessen");
            } else if (value) {
              router.push(`/Helpers/Gerichte/${value}`);
            }
          }}
          placeholder="Was gibts zum Abendessen?"
          placeholderStyle={{ fontFamily: "FreshMango-Italic" }}
          style={{
            backgroundColor: "#f2e9e1",
            zIndex: dropdownStates.abendessenOpen ? 1000 : 1,
            elevation: dropdownStates.abendessenOpen ? 10 : 1,
          }}
          dropDownContainerStyle={{
            backgroundColor: "#f2e9e1",
            zIndex: dropdownStates.abendessenOpen ? 1000 : 1,
            elevation: dropdownStates.abendessenOpen ? 10 : 1,
          }}
        />
      </View>

      {/* Snack Dropdown */}
      <View className="mb-4 bg-[#814256]">
        <Text className="text-lg text-black mb-2 font-[FreshMango-Italic]">Snack</Text>
        <DropDownPicker
          open={dropdownStates.snackOpen}
          value={selectedValue}
          items={[
            ...gerichte.snack.map((gericht: any) => ({
              label: (
                <View className="flex-row justify-between items-center bg-[#f2e9e1] p-2 rounded">
                  <View className="flex-1 bg-[#f2e9e1] justify-start">
                    <TouchableOpacity
                      onPress={() => {
                        router.push(`/Helpers/Gerichte/${gericht.label}`);
                      }}
                    >
                      <Text className="text-black">{gericht.label}</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Löschen-Icon */}
                  <View className="justify-end items-end bg-[#f2e9e1] flex-1">
                    <TouchableOpacity
                      onPress={async () => {
                        Alert.alert(
                          "Gericht löschen?",
                          `Möchtest du das Gericht für ${gericht.label} wirklich löschen?`,
                          [
                            {
                              text: "Nah Uh",
                              style: "cancel",
                            },
                            {
                              text: "Absoluti",
                              onPress: async () => {
                                try {
                                  await axios.delete(`https://${serverip}/gerichte/snack/${gericht.value}`);
                                  // Aktualisiere die Gerichte-Liste
                                  const response = await axios.get(`https://${serverip}/gerichte`);
                                  setGerichte(response.data);
                                } catch (error) {
                                  console.error("Fehler beim Löschen des Gerichts:", error);
                                  alert("Fehler beim Löschen des Gerichts.");
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
                </View>
              ),
              value: gericht.value,
              key: gericht.value,
            })),
            { label: "+ Gericht hinzufügen", value: "add-snack", key: "add-snack" },
          ]}
          setOpen={(value) => {
            closeAllDropdowns();
            setDropdownStates((prev) => ({ ...prev, snackOpen: !!value }));
          }}
          setValue={(callback) => {
            const value = typeof callback === "function" ? callback(selectedValue) : callback;
            setSelectedValue(value);
            if (value === "add-snack") {
              router.push("/Helpers/AddGericht?category=snack");
            } else if (value) {
              router.push(`/Helpers/Gerichte/${value}`);
            }
          }}
          placeholder="Was gibts zu snacken?"
          placeholderStyle={{ fontFamily: "FreshMango-Italic" }}
          style={{
            backgroundColor: "#f2e9e1",
            zIndex: dropdownStates.snackOpen ? 1000 : 1,
            elevation: dropdownStates.snackOpen ? 10 : 1,
          }}
          dropDownContainerStyle={{
            backgroundColor: "#f2e9e1",
            zIndex: dropdownStates.snackOpen ? 1000 : 1,
            elevation: dropdownStates.snackOpen ? 10 : 1,
          }}
          maxHeight={200}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
            keyboardShouldPersistTaps: "handled",
          }}
        />
        <View className="flex-1 justify-center items-center">
        <Text className="text-lg bg-black">Gerichte geladen.</Text>
      </View>
      </View>
    </View>
  );
}