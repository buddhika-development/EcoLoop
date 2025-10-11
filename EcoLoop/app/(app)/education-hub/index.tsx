import SectionTitle from "@/components/ui/Titles/SectionTitle";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function EducationHub() {

    const [searchQuery, setSearchQuery] = useState("");

    const handleSubmit = () => {
        if (searchQuery.trim() !== "") {
            // Handle the search logic here
            alert("Searching for:" + searchQuery);
        }
        else {
            alert("Search query is empty.");
        }
    }
    
    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView className="px-5" showsVerticalScrollIndicator={false}>

            {/* header section */}
                <View>
                    <SectionTitle title_text="Education Hub" />
                    <Text className="text-text text-[16px] mt-2">Education will empower the better and the great future.</Text>

                {/* search bar */}
                <View className="flex-row gap-2 mt-4">
                    <TextInput
                        className="flex-1 border border-purple-700 rounded-md h-[46px] px-4 placeholder:text-[14px]"
                        placeholder="What do you need to know about ?"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSubmit}
                        returnKeyType="search"
                    />
                    <TouchableOpacity
                        className="flex items-center justify-center bg-purple-700 px-4 h-[46px] rounded-md"
                        onPress={handleSubmit}
                    >
                        <Text className="text-white text-[16px] font-bold">Search</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* content area */}
            <View className="mt-5">
                <Text className="text-text text-[16px]">No content available.</Text>
            </View>
            
            </ScrollView>
        </SafeAreaView>
    );
}
