import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
export default function ListingDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text>Listing #{id}</Text>
        </View>
    );
}
