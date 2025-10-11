import SectionTitle from '@/components/ui/Titles/SectionTitle'
import PostVerticalScrollerSection from '@/src/components/layouts/EducationHub/PostVerticalScrollerSection'
import SmallTitle from '@/src/components/ui/Titles/SmallTitle'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SinglePost = () => {

    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()

    // handle all posts fetch
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allPosts, setAllPosts] = useState<any[] | null>(null);
    const [searchPosts, setSearchPosts] = useState<any[] | null>(null);

    // handle single post details fetch
    const [postDetails, setPostDetails] = useState<any | null>(null);
    const [isPostLoading, setIsPostLoading] = useState(true);
    const [postError, setPostError] = useState<string | null>(null);
  
    useEffect(() => {
      
      const fetchPosts = async () => {
        try {
          console.log("Fetching posts from API...");
  
          const API_URL = process.env.BACKEND_IP_ADDRESS || "http://192.168.8.101:5000"; // Your Flask backend URL
  
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
          setAllPosts(data);
  
        } catch (error) {
          setError("Error fetching posts");
        }

        finally {
          setIsLoading(false);
        }
      };
  
  
      fetchPosts();
    }, []);


    useEffect(() => {

      const fetchPost = async (id: string) => {
        try {
          const API_URL = process.env.BACKEND_IP_ADDRESS || "http://192.168.8.101:5000";
          const response = await fetch(`${API_URL}/api/posts/post/${id}`, {
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
          console.log(data)
          setPostDetails(data.post);
          
        } catch (error) {
          setError("Error fetching single post");
        }

        finally {
          setIsPostLoading(false);
        }
      }

      fetchPost(id);

    }, [id]);

  const handleAuthorProfilePress = (author_id: string) => {
    if (!author_id) return;
    router.push({
      pathname: "/(app)/(tabs)/education-hub/author/[id]",
      params: { id: author_id },
    });
  }
  
  return (
    <SafeAreaView className='px-5'>
      <ScrollView
        showsVerticalScrollIndicator = {false}
      >

        {/* image section */}
        <View className='w-full rounded-xl h-[250px]'>
          <Image
            src={postDetails?.post_image_url || ""}
            className='w-full h-full object-cover rounded-xl'
          />
        </View>

        {/* post content sections */}
        <View className='mt-5'>
          <SectionTitle title_text={postDetails?.post_title || "Untitled Post"} />

          <View style= {s.post_interaction}>
            <Text>{postDetails?.created_at.split("T")[0]}</Text>
            <Text>Like Button</Text>
          </View>
          
          <Text className='mt-5 text-lg'>{postDetails?.post_content}</Text>
        </View>

        {/* publisher details */}
        <TouchableOpacity onPress={() => handleAuthorProfilePress("2000")} style={s.publisher_details} className='mt-5 bg-purple-800/10 rounded-2xl p-3'>
          <View className='h-[50px] w-[50px] bg-zinc-300 rounded-full'></View>  
          <Text className='font-bold text-[20px]'>John Peterson</Text>
        </TouchableOpacity>
        
        {/* post suggesison section */}
        <View className='my-8'>
          <SmallTitle title_content='More Suggession' />
          <View className='mt-5'>
            <PostVerticalScrollerSection posts={allPosts ?? undefined} />
          </View>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  post_interaction : {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12
  },
  publisher_details : {
    flexDirection: "row",
    gap: 16,
    alignItems: "center"
  }
})

export default SinglePost