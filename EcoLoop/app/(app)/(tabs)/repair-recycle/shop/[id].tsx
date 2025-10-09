import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
export default function ShopDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text>Shop #{id}</Text>
        </View>
    );
}
