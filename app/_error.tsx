import { View, Text } from "react-native";

export default function NotFound() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-lg text-red-500">Route nicht gefunden!</Text>
    </View>
  );
}