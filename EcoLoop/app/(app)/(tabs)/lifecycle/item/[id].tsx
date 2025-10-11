import { useLocalSearchParams } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useItemQuery } from "../../../../../src/features/lifecycle/hooks";
import QRCode from "react-native-qrcode-svg";

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
            {/* // snippet inside your ItemDetail component render()*/}

            {item.qrToken ? (
                <View style={{ alignItems: "center", marginTop: 12 }}>
                    <QRCode value={item.qrToken} size={200} />
                    <Text style={{ marginTop: 8, color: "#6b7280" }}>
                        Scan with EcoLoop app
                    </Text>
                </View>
            ) : null}

        </View>
    );
}
