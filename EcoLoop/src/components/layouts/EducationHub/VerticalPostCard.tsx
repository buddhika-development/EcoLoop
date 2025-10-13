import PostCardTitle from '@/src/components/ui/Titles/PostCardTitle'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'


const VerticalPostCard = ({post_title, post_content, post_id, post_image} : {
    post_title : string,
    post_content : string,
    post_id?: string | number,
    post_image?: string
}) => {

    const router = useRouter()
    
    const handlePress = () => {
        if (!post_id) {
            console.warn('VerticalPostCard: missing post_id, cannot navigate')
            return
        }

        const id = String(post_id)
        router.push(`/(app)/(tabs)/education-hub/post/${post_id}`)
    }

  return (
    <TouchableOpacity style = {s.container} onPress={handlePress}>
        <View className='w-[120px] h-[120px] rounded-xl bg-zinc-400'>
            <Image
                source={{ uri: post_image ?? 'https://via.placeholder.com/120' }}
                className='w-full h-full rounded-xl'
                resizeMode='cover'
            />
        </View>
        
        {/* post detials section */}
        <View style = {s.postDetails}>
            <PostCardTitle 
                title_content= {post_title}
            />
            <Text className='w-11/12 mt-1 leading-5 line-clamp-3'>{post_content}</Text>
        </View>
    </TouchableOpacity>
  )

}

const s = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        alignItems: "flex-start", // Optional: vertically center content
    },
    postDetails: {
        flex: 1, // Takes remaining space
        paddingTop: 10
    }
})

export default VerticalPostCard