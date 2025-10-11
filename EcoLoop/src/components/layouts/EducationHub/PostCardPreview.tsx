import PostCardTitle from '@/src/components/ui/Titles/PostCardTitle'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

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
      <View className='w-full bg-gray-300 h-[150px] rounded-lg'></View>

      {/* post content detials */}
      <View className='mt-4'>
        <PostCardTitle title_content= {post_title} className='' />
        <Text className='mt-2 text-[14px]'>{post_content}</Text>
      </View>
      
    </TouchableOpacity>
  )
}

export default PostCardPreview