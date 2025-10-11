import { useState } from "react";
import { Platform, View, Text, TouchableOpacity } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { colors } from "@/src/theme/colors";

type Props = {
    label: string;
    value?: string;              // "YYYY-MM-DD"
    onChange: (iso: string) => void;
    error?: string;
    minimumDate?: Date;
    maximumDate?: Date;
};

export default function DateField({ label, value, onChange, error, minimumDate, maximumDate }: Props) {
    const [show, setShow] = useState(false);

    const date = value ? new Date(value + "T00:00:00") : new Date();

    const onPick = (_: DateTimePickerEvent, selected?: Date) => {
        if (Platform.OS !== "ios") setShow(false);
        if (selected) {
            const iso = selected.toISOString().slice(0, 10);
            onChange(iso);
        }
    };

    return (
        <View className="mb-3">
            <Text className="text-gray-800 mb-1 font-semibold">{label}</Text>

            <TouchableOpacity
                onPress={() => setShow(true)}
                activeOpacity={0.9}
                className="bg-white rounded-xl px-4 py-3 border border-gray-300"
            >
                <Text className={value ? "text-text" : "text-text-hint"}>{value || "YYYY-MM-DD"}</Text>
            </TouchableOpacity>

            {!!error && <Text className="text-red-500 mt-1 text-xs">{error}</Text>}

            {show && (
                <DateTimePicker
                    mode="date"
                    value={date}
                    onChange={onPick}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                />
            )}
        </View>
    );
}
