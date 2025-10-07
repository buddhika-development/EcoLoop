import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
export default function Onboarding() {
    return (
        <View className="flex-1 items-center justify-center p-6 bg-white">
            <Text className="text-2xl font-semibold mb-4">Welcome 👋</Text>
            <Link href="/(auth)/login" asChild>
                <TouchableOpacity className="px-4 py-3 bg-black rounded-lg">
                    <Text className="text-white">Get Started</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}
