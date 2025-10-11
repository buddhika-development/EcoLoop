import React from 'react'
import { Text } from 'react-native'

const SectionTitle = ( {title_text} : {title_text : string}) => {
  return (
    <Text className="text-6xl font-bold text-text">{title_text}</Text>
  )
}

export default SectionTitle
