import PostsSection from "@/src/components/layouts/EducationHub/PostsSection";
import PostVerticalScrollerSection from "@/src/components/layouts/EducationHub/PostVerticalScrollerSection";
import VerticalPostCard from '@/src/components/layouts/EducationHub/VerticalPostCard';
import SectionTitle from "@/src/components/ui/Titles/SectionTitle";
import SmallTitle from "@/src/components/ui/Titles/SmallTitle";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// sample data
const posts = [
  {
    post_id: "2000000",
    title: "This is sample post title",
    content:
      "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
    image: "sakaboom.jpg",
  },
  {
    post_id: "2000000",
    title: "This is sample post title 2",
    content:
      "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
    image: "sakaboom.jpg",
  },
  {
    post_id: "2000000",
    title: "This is sample post title 3",
    content:
      "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
    image: "sakaboom.jpg",
  },
  {
    post_id: "2000000",
    title: "This is sample post title 4",
    content:
      "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
    image: "sakaboom.jpg",
  },
  {
    post_id: "2000000",
    title: "This is sample post title 5",
    content:
      "This is sample post content with the large text area and the post images and show the details about eco friendly and healthy life with less harmfull habits.",
    image: "sakaboom.jpg",
  },
];

export default function EducationHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState<any[] | null>(null);
  const [searchPosts, setSearchPosts] = useState<any[] | null>(null);

  useEffect(() => {
    
    const fetchPosts = async () => {
      try {
        console.log("Fetching posts from API...");

        const API_URL = process.env.BACKEND_IP_ADDRESS || "http://192.168.43.235:5000"; // Your Flask backend URL

        const response = await fetch(`${API_URL}/api/posts/all`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

  const data = await response.json();
  // keep full list so we can fall back to showing all posts when search returns no results
  setAllPosts(Array.isArray(data) ? data : []);

      } catch (error) {
        setError("Error fetching posts");
      }
      finally {
        setIsLoading(false);
      }
    };


    fetchPosts();
  }, []);

  const handleSubmit = () => {
    const q = searchQuery.trim();
    if (q === "") {
      setIsSearch(false);
      return;
    }

    // perform search
    const doSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const API_URL = process.env.BACKEND_IP_ADDRESS || "http://192.168.43.235:5000";
        const endpoint = `${API_URL}/api/posts/search?search=${encodeURIComponent(q)}`;
        const res = await fetch(endpoint, { method: 'GET' });
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data = await res.json();
        // expect data.posts or data.results; try a few shapes
        const results = data?.posts ?? data?.results ?? data ?? [];
        setSearchPosts(Array.isArray(results) ? results : []);
        setIsSearch(true);
      } catch (err) {
        setError('Error searching posts');
        setIsSearch(true);
        setSearchPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    doSearch();
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        {/* header section */}
        <View>
          <SectionTitle title_text="Education Hub" />
          <Text className="text-text text-[16px] mt-2">
            Education will empower the better and the great future.
          </Text>

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
          {isSearch ? (
            <View>
              {isLoading ? (
                <Text className='text-[16px] text-text'>Searching...</Text>
              ) :  (
                <View>
                  {searchPosts && searchPosts.length > 0 ? (
                    searchPosts.map((p: any) => (
                      <View key={p.post_id ?? p.id} className='mb-4 border-b p-4 border-zinc-200 rounded-xl'>
                        <VerticalPostCard
                          post_id={p.post_id ?? p.id}
                          post_title={p.post_title ?? p.title ?? ''}
                          post_content={p.post_content ?? p.content ?? ''}
                          post_image={p.post_image_url ?? p.image}
                        />
                      </View>
                    ))
                  ) : (
                    // If search returned no results, show all posts as vertical cards
                    (allPosts && allPosts.length > 0) ? (
                      allPosts.map((p: any) => (
                        <View key={p.post_id ?? p.id} className='mb-4 border-b p-4 border-zinc-200 rounded-xl'>
                          <VerticalPostCard
                            post_id={p.post_id ?? p.id}
                            post_title={p.post_title ?? p.title ?? ''}
                            post_content={p.post_content ?? p.content ?? ''}
                            post_image={p.post_image_url ?? p.image}
                          />
                        </View>
                      ))
                    ) : (
                      <Text className='text-text'>No results found.</Text>
                    )
                  )}
                </View>
              )}
            </View>
          ) : isLoading ? (
            <View>
              <>
                <View>
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="h-6 w-36 bg-gray-300 rounded" />
                    <View className="h-6 w-20 bg-gray-200 rounded" />
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
                    {[...Array(4)].map((_, i) => (
                      <View key={i} className="mr-3 w-[140px] h-[180px] bg-gray-200 rounded-lg" />
                    ))}
                  </ScrollView>
                </View>

                <View className="mt-6">
                  <View className="h-6 w-40 bg-gray-300 rounded mb-3" />
                  {[...Array(3)].map((_, i) => (
                    <View key={i} className="flex-row items-center mb-4">
                      <View className="w-[88px] h-[88px] bg-gray-200 rounded-lg mr-3" />
                      <View className="flex-1">
                        <View className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                        <View className="h-4 bg-gray-100 rounded w-full mb-1" />
                        <View className="h-4 bg-gray-100 rounded w-5/6" />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            </View>
          ) : (
            <View>
              <View>
                <View style={s.header}>
                  <SmallTitle title_content="Recent Posts" />
                </View>
                <PostVerticalScrollerSection posts={allPosts ?? undefined} />
              </View>
              <PostsSection />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
});
