import { useLocalSearchParams } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useItemQuery } from "../../../../src/features/lifecycle/hooks";

export default function ItemDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: item, isLoading } = useItemQuery(id!);

    if (isLoading) return <ActivityIndicator className="mt-10" />;
    if (!item) return <Text className="p-4">Item not found.</Text>;

    return (
        <View className="flex-1 p-4 bg-white">
            <Text className="text-xl font-semibold mb-2">{item.name}</Text>
            <Text className="text-gray-600 mb-4">Status: {item.status}</Text>
            {/* more sections: timeline, reminders link, maintenance logs link */}
        </View>
    );
}
