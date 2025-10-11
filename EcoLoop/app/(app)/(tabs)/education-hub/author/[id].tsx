import PostVerticalScrollerSection from '@/src/components/layouts/EducationHub/PostVerticalScrollerSection'
import VerticalPostCard from '@/src/components/layouts/EducationHub/VerticalPostCard'
import SmallTitle from '@/src/components/ui/Titles/SmallTitle'
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const AuthorProfile = () => {

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
    
  return (
    <SafeAreaView className='px-5'>

        <ScrollView
            showsVerticalScrollIndicator = {false}
        >

            {/* publisher deitals */}
            <View style = {s.profile_header}>
                <View className='w-[60px] h-[60px] bg-zinc-400 rounded-full'></View>
                <SmallTitle title_content='Hohn Wick Albert' />
            </View>

            {/* recent posts */}
            <View className='mt-8'>
                <SmallTitle title_content='Recent Addeds' />
                <View className='mt-5'>
                    <PostVerticalScrollerSection posts={posts}/>
                </View>
            </View>
            
            {/* post list */}
            <View>

                <View className='mb-5 mt-8'>
                    <SmallTitle title_content='All Publication' />
                </View>
                
                {
                    posts.map((post, index) => (
                        <View className='mb-4 border-b p-4 border-zinc-200  rounded-xl' key={index}>
                            <VerticalPostCard
                                post_id={post.post_id}
                                post_content= {post.content}
                                post_title= {post.title}
                            />
                        </View>
                    ))
                }
            </View>
        </ScrollView>
        
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