import SectionTitle from '@/src/components/ui/Titles/SectionTitle'
import { useUserProfile } from '@/src/hooks/useUserProfile'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function NewEducationPost() {

  const current_user =useUserProfile()
  const current_user_id = current_user.user?.uid
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function pickImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your photos to pick an image.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (result.canceled) return
      const asset = result.assets[0]
      if (!asset?.uri) return
      setImageUri(asset.uri)
    } catch (e: any) {
      Alert.alert('Image pick failed', e?.message || String(e))
    }
  }

  async function onSubmit() {
    const BACKEND_URL = process.env.BACKEND_IP_ADDRESS || "http://192.168.43.235:5000";

    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title for the post.')
      return
    }
    if (!content.trim()) {
      Alert.alert('Validation', 'Please enter the post content.')
      return
    }

    try {
      setUploading(true)
      const endpoint = `${BACKEND_URL}/api/posts/create`

      const AUTH_HEADER = 'Bearer aB3x9FgH7kLmNpQrS8tUvW2yZ4cD6eF8hJ0kM1nB3vX5zQ7wE9rT2yU4iA6oP8sD0fG'

      const formData = new FormData()

      formData.append('post_title', title)
      formData.append('post_content', content)
      formData.append('post_author', current_user_id || '')

      if (imageUri) {
        // derive filename & mime type
        const uriParts = imageUri.split('.')
        const ext = uriParts[uriParts.length - 1] || 'jpg'
        const name = `photo.${ext}`
        const type = ext.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg'

        // RN/fetch-friendly file object
        formData.append('post_image', {
          uri: imageUri,
          name,
          type,
        } as any)
      }

      // send request
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: AUTH_HEADER,
          Accept: 'application/json',
        },
        body: formData,
      })

      let payload: any = null
      try {
        payload = await res.json()
      } catch (e) {
        // non-json response
      }

      if (!res.ok) {
        const msg = `${payload?.message} and reason is ${payload?.reason} `
        Alert.alert('Upload failed', String(msg))
        
      } else {
        Alert.alert('Success', payload?.message || 'Post created successfully')
        // Reset form
        setTitle('')
        setContent('')
        setImageUri(null)
      }
    } catch (e: any) {
      Alert.alert('Submit failed', e?.message || String(e))
    } finally {
      setUploading(false)
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <SectionTitle title_text="Create Post" />

        <Text className="mt-4 text-text">Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter post title"
          className="mt-2 bg-surface-base rounded-lg px-3 border border-surface-foreground text-text"
          style={{ height: 46 }}
        />

        <Text className="mt-4 text-text">Content</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write your post content..."
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          className="mt-2 bg-surface-base rounded-lg px-3 border border-surface-foreground text-text"
          style={{ minHeight: 160, paddingTop: 10 }}
        />

        <Text className="mt-4 text-text">Image (optional)</Text>
        <View className="mt-2 flex-row items-center gap-3">
          <TouchableOpacity onPress={pickImage} className="bg-brand-primary px-4 py-3 rounded-lg">
            <Text className="text-white font-semibold">Pick Image</Text>
          </TouchableOpacity>
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="h-20 w-28 rounded-lg" />
          ) : (
            <View style={{ height: 80, width: 112, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
              <Text className="text-text text-sm">No image</Text>
            </View>
          )}
        </View>

        <View className="mt-6">
          <TouchableOpacity
            onPress={onSubmit}
            className="bg-brand-primary rounded-lg py-3 items-center"
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Submit Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
