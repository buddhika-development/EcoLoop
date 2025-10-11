import React, { useRef } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import PostCardPreview from './PostCardPreview'

const PostVerticalScrollerSection = ({ posts }: { posts?: any[] }) => {
  const scrollViewRef = useRef<ScrollView>(null)

  const items = posts ?? []

  return (
    <View>
      {/* Posts Container with Horizontal Scroll */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
      >
        {items.map((post, index) => (
          <View
            key={index}
            className="border-[1px] rounded-xl p-[10px] border-zinc-200"
            style={s.postWrapper}
          >
            <PostCardPreview
              post_id={post.post_id}
              post_title={post.post_title ?? post.title}
              post_content={post.post_content ?? post.content}
              post_image={post.post_image ?? post.post_image_url ?? post.image}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 12,
  },
  postWrapper: {
    width: 280,
  }
})

export default PostVerticalScrollerSection