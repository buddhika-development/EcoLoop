import SectionTitle from '@/components/ui/Titles/SectionTitle'
import PostVerticalScrollerSection from '@/src/components/layouts/EducationHub/PostVerticalScrollerSection'
import SmallTitle from '@/src/components/ui/Titles/SmallTitle'
import { useUserProfile } from '@/src/hooks/useUserProfile'
import { getUserProfile } from '@/src/services/profile'
import { FontAwesome } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SinglePost = () => {

    const current_user =useUserProfile()
    const current_user_id = current_user.user?.uid
  
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
    
  // like state (optimistic)
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // post author details
  const [postAuthor, setPostAuthor] = useState<any | null>(null);
  const [isauthorLoading, setIsAuthorLoading] = useState(true);
  
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
          const API_URL = process.env.BACKEND_IP_ADDRESS || "http://192.168.43.235:5000";
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
          // check if current user already liked this post (optimistic/dummy user)
          try {
            const likeResp = await fetch(`${API_URL}/api/posts/is_liked/${id}`, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ user_id: current_user_id }),
            });

            if (likeResp.ok) {
              const likeData = await likeResp.json();
              setIsLiked(Boolean(likeData?.is_liked));
            } else {
              // not liked or other statuses -> set false
              setIsLiked(false);
            }
          } catch (err) {
            // network error -> assume not liked
            setIsLiked(false);
          }
          
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

  useEffect(() => {
  const fetchAuthor = async () => {
    if (!postDetails?.post_author) return;
    try {
      const author = await getUserProfile({ userId: postDetails.post_author });
      // you can store it in state if needed
      setPostAuthor(author);
    } catch (err) {
      console.error("Error fetching author profile:", err);
    }
    finally {
      setIsAuthorLoading(false);
    }
  };

  fetchAuthor();
}, [postDetails]);

  
  return (
    isLoading ? (
      <SafeAreaView className='px-5'>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* image skeleton */}
          <View className='w-full rounded-xl h-[250px] bg-zinc-300' />

          {/* title + meta skeleton */}
          <View className='mt-5'>
        <View className='h-6 w-3/4 bg-zinc-300 rounded' />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <View className='h-4 w-24 bg-zinc-200 rounded' />
          <View className='h-4 w-20 bg-zinc-200 rounded' />
        </View>
          </View>

          {/* content skeleton */}
          <View className='mt-5'>
        <View className='h-4 w-full bg-zinc-200 rounded mb-3' />
        <View className='h-4 w-11/12 bg-zinc-200 rounded mb-3' />
        <View className='h-4 w-10/12 bg-zinc-200 rounded mb-3' />
        <View className='h-4 w-9/12 bg-zinc-200 rounded mb-3' />
        <View className='h-4 w-8/12 bg-zinc-200 rounded' />
          </View>

          {/* publisher skeleton */}
          <View className='mt-5 bg-zinc-200 rounded-2xl p-3' style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <View className='h-[50px] w-[50px] bg-zinc-300 rounded-full' />
            <View className='h-5 w-40 bg-zinc-300 rounded' />
          </View>

          {/* suggestions skeleton */}
          <View className='my-8'>
        <View className='h-5 w-32 bg-zinc-300 rounded' />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mt-5' contentContainerStyle={{ gap: 12 }}>
          <View className='h-36 w-52 bg-zinc-200 rounded-xl' />
          <View className='h-36 w-52 bg-zinc-200 rounded-xl' />
          <View className='h-36 w-52 bg-zinc-200 rounded-xl' />
        </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    ) : (

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

            <View style= {s.post_interaction} className='items-center'>
              <Text>{postDetails?.created_at.split("T")[0]}</Text>
        <TouchableOpacity
          onPress={async () => {
            if (isLiking) return;
            const newLiked = !isLiked;
            // optimistic update
            setIsLiked(newLiked);
            setIsLiking(true);

            const API_URL = process.env.BACKEND_IP_ADDRESS || "http://192.168.43.235:5000";
            const endpoint = `${API_URL}/api/posts/${newLiked ? 'like' : 'unlike'}/${id}`;

            try {
              const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: current_user_id }),
              });

              if (!res.ok) {
                // revert optimistic update
                setIsLiked(!newLiked);
                setPostError(`Failed to ${newLiked ? 'like' : 'unlike'} post`);
              } else {
                // success
                setPostError(null);
              }
            } catch (e) {
              // revert optimistic update
              setIsLiked(!newLiked);
              setPostError('Network error while updating like');
            } finally {
              setIsLiking(false);
            }
          }}
          disabled={isLiking}
          style={{ flexDirection: 'row', alignItems: 'center' }}
          className={`${isLiked ? 'mr-8 h-[46px] w-[46px] bg-rose-500 rounded-full justify-center items-center' : 'mr-8 h-[46px] w-[46px] bg-purple-100 rounded-full justify-center items-center'}`}
        >
          <FontAwesome name={isLiked ? 'heart' : 'heart-o'} size={18} color={isLiked ? '#fff' : '#111'} />
        </TouchableOpacity>
            </View>
            
            <Text className='mt-5 text-lg'>{postDetails?.post_content}</Text>
          </View>

          {/* publisher details */}
          {
            isauthorLoading ? (
              <View className='mt-5 bg-zinc-200 rounded-2xl p-3' style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                <View className='h-[50px] w-[50px] bg-zinc-300 rounded-full' />
                <View className='h-5 w-40 bg-zinc-300 rounded' />
              </View>
            ): (
              <View>
                <TouchableOpacity onPress={() => handleAuthorProfilePress(postAuthor?.id)} style={s.publisher_details} className='mt-5 bg-purple-700/10 border-dashed border-[1px] border-purple-700 rounded-2xl p-3'>
                  <View className='h-[50px] w-[50px] bg-zinc-300 rounded-full'>
                    <Image
                      source={{ uri: postAuthor?.profilePic }}
                      style={{ width: '100%', height: '100%', borderRadius: 25 }}
                    />
                  </View>
                  <Text className='font-bold text-[22px] text-purple-950'>{postAuthor?.fullName}</Text>
                </TouchableOpacity>
              </View>
            )
          }
          
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