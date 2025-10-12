import { View, Text, TextInput, TextInputProps } from "react-native";

export default function Field({
    label,
    error,
    inputProps,
}: {
    label?: string;
    error?: string;
    inputProps?: TextInputProps;
}) {
    return (
        <View className="mb-3">
            {!!label && <Text className="text-text font-semibold mb-1">{label}</Text>}
            <TextInput
                className={`bg-white rounded-xl px-4 py-3 border ${error ? "border-red-400" : "border-surface-foreground"
                    }`}
                placeholderTextColor="#9AA0A6"
                {...inputProps}
            />
            {!!error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </View>
    );
}
