import PostsSection from "@/src/components/layouts/EducationHub/PostsSection";
import PostVerticalScrollerSection from "@/src/components/layouts/EducationHub/PostVerticalScrollerSection";
import SectionTitle from "@/src/components/ui/Titles/SectionTitle";
import SmallTitle from "@/src/components/ui/Titles/SmallTitle";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// sample data
const posts = [
    {
        post_id : "2000000",
        title: "This is sample post title",
        content:
        "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
        image: "sakaboom.jpg",
    },
    {
        post_id : "2000000",
        title: "This is sample post title 2",
        content:
        "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
        image: "sakaboom.jpg",
    },
    {
        post_id : "2000000",
        title: "This is sample post title 3",
        content:
        "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
        image: "sakaboom.jpg",
    },
    {
        post_id : "2000000",
        title: "This is sample post title 4",
        content:
        "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
        image: "sakaboom.jpg",
    },
    {
        post_id : "2000000",
      title: "This is sample post title 5",
      content:
        "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
      image: "sakaboom.jpg",
    },
  ];


export default function EducationHub() {

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearch, setIsSearch] = useState(false)
    const [allPosts, setAllPosts] = useState()
    const [searchPosts, setSearchPosts] = useState() 

    const handleSubmit = () => {
        if (searchQuery.trim() !== "") {
            setIsSearch(true)
        }
        else {
            setIsSearch(false)
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

                {
                    isSearch ? (
                        <View>
                            <Text>This is serach text</Text>
                        </View>
                    ) : (
                        <View>
                            <View>
                                <View style={s.header}>
                                    <SmallTitle title_content='Recent Posts' />
                                </View>
                                <PostVerticalScrollerSection posts={posts} />
                            </View>
                            <PostsSection />
                        </View>
                    )
                }
                
            </View>
            
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  }
})
