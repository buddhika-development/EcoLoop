import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
    return (
        <View style={styles.wrapper}>
            <TouchableOpacity style={styles.side}>
                <Ionicons name="menu" size={22} />
            </TouchableOpacity>

            <Text style={styles.title} numberOfLines={1}>EcoLoop</Text>

            <TouchableOpacity style={styles.side}>
                <Image
                    source={{ uri: "https://i.pravatar.cc/100" }}
                    style={styles.avatar}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        height: 60,
        paddingHorizontal: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ececec",
    },
    title: { fontSize: 18, fontWeight: "700", textAlign: "center", flex: 1 },
    side: { width: 40, alignItems: "center", justifyContent: "center" },
    avatar: { width: 28, height: 28, borderRadius: 14 },
});
