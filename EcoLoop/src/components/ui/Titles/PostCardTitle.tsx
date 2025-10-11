import React from 'react'
import { Text, View } from 'react-native'

const PostCardTitle = ({title_content, className} : {title_content : string, className ?: string}) => {
  return (
    <View>
        <Text className={`font-bold text-[20px] ${className}`}>{title_content}</Text>
    </View>
  )
}

export default PostCardTitle