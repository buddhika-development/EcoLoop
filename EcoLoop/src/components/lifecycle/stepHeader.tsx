import { View, Text, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const bg = require("@/assets/backgroundDesign3.png");

export default function StepHeader({
    title,
    step,
    total = 5,
    subtitle,
}: {
    title: string;
    step: number;
    total?: number;
    subtitle?: string;
}) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{ paddingTop: insets.top + (Platform.OS === "android" ? 8 : 0) }}
            className="bg-transparent"
        >
            {/* softly layered background */}
            <View className="absolute inset-0">
                <Image
                    source={bg}
                    resizeMode="cover"
                    style={{ width: "100%", height: "100%", opacity: 0.6 }}
                />
            </View>

            <View className="px-5 pt-4 pb-3">
                {/* Title */}
                <Text className="text-2xl font-extrabold text-text">{title}</Text>

                {/* Subtitle (optional) */}
                {subtitle ? (
                    <Text className="mt-1 text-text-hint">{subtitle}</Text>
                ) : null}

                {/* Step indicators */}
                <View className="flex-row mt-2">
                    {Array.from({ length: total }).map((_, i) => (
                        <View
                            key={i}
                            className={`h-2 rounded-full mr-2 ${i < step ? "bg-brand-accent" : "bg-surface-foreground"
                                }`}
                            style={{ width: i === step - 1 ? 26 : 12 }}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
}
