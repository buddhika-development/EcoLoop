import SectionTitle from '@/components/ui/Titles/SectionTitle'
import PostVerticalScrollerSection from '@/src/components/layouts/EducationHub/PostVerticalScrollerSection'
import SmallTitle from '@/src/components/ui/Titles/SmallTitle'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SinglePost = () => {

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

  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

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
        <View className='w-full bg-zinc-300 rounded-xl h-[250px]'></View>

        {/* post content sections */}
        <View className='mt-5'>
          <SectionTitle title_text='This is sample post template'/>

          <View style= {s.post_interaction}>
            <Text>2025 Jan 23</Text>
            <Text>Like Button</Text>
          </View>
          
          <Text className='mt-5 text-lg'>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus vero quo iste sequi nulla libero, inventore odit ab dolorem nesciunt quam laudantium autem in quod eos quis ducimus exercitationem incidunt eaque est, excepturi, aut hic error. Dicta quasi, quas nihil tempora animi, nobis velit praesentium accusamus quae officia ut amet illum? Eum tempora laudantium dolor odit consequuntur ex officiis, repellat possimus. Itaque quibusdam, tenetur deleniti inventore velit quaerat laboriosam aliquid repellat sunt iure delectus suscipit sapiente veniam excepturi consequatur impedit! Quaerat, maxime rem. Omnis repellendus laboriosam doloremque mollitia, ab temporibus neque ad? Nobis eius hic expedita veniam iste voluptates at iure quis minus iusto corporis dolorum, cum, laudantium illum consequuntur, distinctio facilis! Cumque repellat ea doloremque laborum provident exercitationem fugiat eveniet facilis natus, temporibus magnam iusto. Dolores maxime sunt ullam quis harum voluptates, debitis ducimus corrupti omnis ratione, vitae rerum ipsa quos repellendus nihil incidunt voluptatem, dolorem iste. Dolore eos repellendus eaque. Aliquid sunt porro repellendus ex est voluptatem consequuntur praesentium officiis, modi explicabo laudantium! Quo hic cumque fuga at officiis repellendus repellat. Illo ratione excepturi, eum totam velit a fuga ipsum in! Consequuntur laudantium beatae autem voluptatibus illo sapiente repudiandae illum possimus eos, sed maxime distinctio, officia, deserunt labore.
          </Text>
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
            <PostVerticalScrollerSection posts={posts} />
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