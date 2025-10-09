import { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
    ImageBackground,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import { router } from "expo-router";
import { colors } from "@/src/theme/colors";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    const emailOk = /\S+@\S+\.\S+/.test(email.trim());
    const canSubmit = emailOk && password.length >= 6 && !loading;

    function toUiError(code: string, message: string) {
        // map common Firebase errors to friendly text
        if (code.includes("invalid-credential") || code.includes("wrong-password")) {
            return "Email or password is incorrect.";
        }
        if (code.includes("user-not-found")) return "No account found for this email.";
        if (code.includes("too-many-requests")) {
            return "Too many attempts. Please wait a moment and try again.";
        }
        return message || "Something went wrong. Please try again.";
    }

    async function onLogin() {
        setErrorText(null);
        if (!canSubmit) return;
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            router.replace("/(app)/(tabs)/home");
        } catch (e: any) {
            const msg = toUiError(e?.code ?? "", e?.message ?? "");
            setErrorText(msg);
            // also show a brief alert for extra feedback
            Alert.alert("Login failed", msg);
        } finally {
            setLoading(false);
        }
    }

    const LoginButton = useMemo(
        () => (
            <TouchableOpacity
                onPress={onLogin}
                disabled={!canSubmit}
                className={`rounded-xl py-3 ${canSubmit ? "bg-brand-primary" : "bg-brand-primary-600"}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmit, busy: loading }}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-surface text-center font-semibold text-base ">Login</Text>
                )}
            </TouchableOpacity>
        ),
        [canSubmit, loading, email, password]
    );

    return (
        <ImageBackground
            source={require("@/assets/backgroundDesign.png")}
            resizeMode="cover"
            className="flex-1 bg-gray-50"
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="flex-1 px-6 pt-32">
                        {/* Logo + Heading */}
                        <View className="items-center mb-8">
                            <Image
                                source={require("@/assets/logo.png")}
                                style={{ width: 140, height: 140 }}
                                resizeMode="contain"
                            />
                            <Text className="text-gray-900 text-xl font-bold mt-10">Welcome Back!</Text>
                        </View>

                        {/* Form */}
                        <View>
                            {/* EMAIL */}
                            <View className="mb-3">
                                <Text className="text-gray-800 mb-1 font-semibold">Email</Text>
                                <TextInput
                                    placeholder="email"
                                    placeholderTextColor="#8A8F98"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    className="bg-white rounded-xl px-4 py-3 border border-gray-300"
                                    value={email}
                                    onChangeText={(t) => {
                                        setEmail(t);
                                        if (errorText) setErrorText(null);
                                    }}
                                />
                            </View>

                            {/* PASSWORD */}
                            <View className="mb-2">
                                <Text className="text-gray-800 mb-1 font-semibold">Password</Text>
                                <View className="relative">
                                    <TextInput
                                        placeholder="password"
                                        placeholderTextColor="#8A8F98"
                                        secureTextEntry={!showPw}
                                        autoCapitalize="none"
                                        className="bg-white rounded-xl px-4 py-3 border border-gray-300 pr-11"
                                        value={password}
                                        onChangeText={(t) => {
                                            setPassword(t);
                                            if (errorText) setErrorText(null);
                                        }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPw((s) => !s)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        className="absolute right-3 top-3"
                                        accessibilityRole="button"
                                        accessibilityLabel={showPw ? "Hide password" : "Show password"}
                                    >
                                        <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={22} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Inline error */}
                            {errorText ? (
                                <Text className="text-red-500 mb-3" accessibilityLiveRegion="polite">
                                    {errorText}
                                </Text>
                            ) : null}

                            {/* Login */}
                            {LoginButton}

                            {/* Link to register */}
                            <TouchableOpacity
                                className="mt-6 self-center"
                                onPress={() => router.push("/(auth)/register" as any)}
                            >
                                <Text className="text-[#5D3FD3] font-medium">Join with EcoLoop</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}
