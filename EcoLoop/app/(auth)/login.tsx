import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function Login() {
    return (
        <View className="flex-1 justify-center p-6 bg-white">
            <Text className="text-2xl font-semibold mb-6">Login</Text>
            <TextInput placeholder="Email" className="border rounded-lg px-3 py-3 mb-3" />
            <TextInput placeholder="Password" secureTextEntry className="border rounded-lg px-3 py-3 mb-6" />
            <TouchableOpacity
                className="bg-black rounded-lg px-4 py-3"
                onPress={() => router.replace("/(app)/home")}
            >
                <Text className="text-white text-center">Login</Text>
            </TouchableOpacity>
        </View>
    );
}
