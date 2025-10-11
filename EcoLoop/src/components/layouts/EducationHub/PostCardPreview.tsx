import PostCardTitle from '@/src/components/ui/Titles/PostCardTitle'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const PostCardPreview = ({post_title,post_content, post_image, post_id} : {
  post_title : string,
  post_content : string,
  post_image : string,
  post_id : string
}) => {

  const router = useRouter()

  const handlePress = () => {
    router.push(`/(app)/(tabs)/education-hub/post/${post_id}`)
  }
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <View className='w-full h-[150px] rounded-lg'>
        <Image
          source={{ uri: post_image }}
          style={{ width: '100%', height: '100%', borderRadius: 8 }}
          resizeMode='cover'
        />
      </View>

      {/* post content detials */}
      <View className='mt-4'>
        <PostCardTitle title_content= {post_title} className='' />
        <Text className='mt-2 text-[14px] line-clamp-3'>{post_content}</Text>
      </View>
      
    </TouchableOpacity>
  )
}

export default PostCardPreview