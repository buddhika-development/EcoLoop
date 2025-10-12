import PostVerticalScrollerSection from '@/src/components/layouts/EducationHub/PostVerticalScrollerSection'
import VerticalPostCard from '@/src/components/layouts/EducationHub/VerticalPostCard'
import SmallTitle from '@/src/components/ui/Titles/SmallTitle'
import { getUserProfile } from '@/src/services/profile'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const AuthorProfile = () => {

  const {id} = useLocalSearchParams<{id: string}>()

  const [postAuthor, setPostAuthor] = useState<null | any>()
    const [isAuthorLoading, setIsAuthorLoading] = useState(true);
    
    // post loading
    const [isPostLoading, setIsPostLoading] = useState(true);
    const [postDetails, setPostDetails] = useState<null | any>(null);


    useEffect(() => {
        const fetchPostDetails = async () => {
            if (!id) return;

            setIsPostLoading(true);
            setPostDetails(null);

            try {
            const API_URL = process.env.BACKEND_IP_ADDRESS || "http://192.168.43.235:5000";
            const endpoint = `${API_URL}/api/posts/author/${id}`;

            const res = await fetch(endpoint, { method: "GET" });

            if (!res.ok) throw new Error("Failed to fetch post details");

            const data = await res.json();
            setPostDetails(data?.posts || []);
            } catch (err) {
            console.error("Error fetching post details:", err);
            setPostDetails([]);
            } finally {
            setIsPostLoading(false);
            }
        }

        fetchPostDetails();
    }, [id]);

    const recent_posts = postDetails ? postDetails.slice(0, 3) : [];
    const all_other_posts = postDetails ? postDetails.slice(3) : [];
    const post_count = postDetails ? postDetails.length : 0;
    
  useEffect(() => {
  const fetchAuthor = async () => {
    if (!id) return;
    try {
      const author = await getUserProfile({ userId: id });
      setPostAuthor(author);
    } catch (err) {
      console.error("Error fetching author profile:", err);
    }
    finally {
      setIsAuthorLoading(false);
    }

    };

    fetchAuthor();

}, [id]);

  return (
    <SafeAreaView className='px-5'>

        { (isAuthorLoading || isPostLoading) ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* skeleton header */}
            <View style={s.profile_header} className='bg-purple-800/10 px-8 py-6 rounded-3xl'>
              <View className='w-[60px] h-[60px] bg-zinc-300 rounded-full' />
              <View>
                <View className='h-6 w-40 bg-zinc-300 rounded mb-2' />
                <View className='h-4 w-36 bg-zinc-200 rounded' />
              </View>
            </View>

            {/* recent posts skeleton */}
            <View className='mt-8'>
              <View className='h-5 w-32 bg-zinc-300 rounded' />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mt-5' contentContainerStyle={{ gap: 12 }}>
                <View className='h-36 w-52 bg-zinc-200 rounded-xl' />
                <View className='h-36 w-52 bg-zinc-200 rounded-xl' />
                <View className='h-36 w-52 bg-zinc-200 rounded-xl' />
              </ScrollView>
            </View>

            {/* list skeleton */}
            <View>
              <View className='mb-5 mt-8'>
                <View className='h-5 w-48 bg-zinc-300 rounded' />
              </View>

              {Array.from({ length: 4 }).map((_, i) => (
                <View className='mb-4 border-b p-4 border-zinc-200 rounded-xl' key={i}>
                  <View className='h-4 w-3/4 bg-zinc-200 rounded mb-3' />
                  <View className='h-3 w-1/2 bg-zinc-200 rounded' />
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator = {false}
          >

            {/* publisher deitals */}
            <View style = {s.profile_header} className='bg-purple-800/10 px-8 py-6 rounded-3xl'>
                <View className='w-[60px] h-[60px] bg-zinc-400 rounded-full'>
                    <Image 
                        source={{ uri: postAuthor?.profilePic }}
                        style={{ width: '100%', height: '100%', borderRadius: 30 }}
                    />
                </View>
                <View>
                    <SmallTitle title_content={postAuthor?.fullName} className='text-purple-950' />
                    <Text className='text-[16px] mt-1 text-purple-900'>Total Publication Count : {post_count}</Text>
                </View>
            </View>

            {/* recent posts */}
            <View className='mt-8'>
                <SmallTitle title_content='Recent Addeds' />
                <View className='mt-5'>
                    <PostVerticalScrollerSection posts={recent_posts}/>
                </View>
            </View>
            
            {/* post list */}
            <View>

                <View className='mb-5 mt-8'>
                    <SmallTitle title_content='All Publication' />
                </View>
                
                {
                    all_other_posts.map((post: any, index: number) => (
                        <View className='mb-4 border-b p-4 border-zinc-200  rounded-xl' key={index}>
                            <VerticalPostCard
                                post_id={post.post_id}
                                post_content= {post.post_content}
                                post_title= {post.post_title}
                                post_image= {post.post_image_url}
                            />
                        </View>
                    ))
                }
            </View>
          </ScrollView>
        )}
        
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
    profile_header : {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 16
    }
})

export default AuthorProfile