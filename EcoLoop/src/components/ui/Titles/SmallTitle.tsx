import React from 'react'
import { Text, View } from 'react-native'

const SmallTitle = ({title_content, className} : {title_content : string, className ?: string}) => {
  return (
    <View>
        <Text className={`font-bold text-3xl ${className}`}>{title_content}</Text>
    </View>
  )
}

export default SmallTitle