import { colors } from "@/src/theme/colors";
import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = {
  id: string;
  role: "system" | "user";
  content: string;
};

const ChatInterface = () => {
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "system",
    content: "Welcome to EcoLoop Assistant! Ask me anything about sustainability, repair/recycle tips, and our education hub.",
  }]);
  const [input, setInput] = useState("");

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          role: "system",
          content: "Thanks! I'll get back to you with helpful resources soon.",
        },
      ]);
    }, 300);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          { maxWidth: "85%", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
          isUser 
            ? { alignSelf: "flex-end", backgroundColor: colors.brand.primary }
            : { alignSelf: "flex-start", backgroundColor: colors.surface.base }
        ]}
      >
        <Text style={{ color: isUser ? "#fff" : colors.surface.foreground }}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 44 : 0}
    >
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: 16, 
            paddingVertical: 12,
          }}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          onLayout={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        {/* Composer */}
        <View 
          style={{ 
            borderTopWidth: 1,
            borderTopColor: colors.surface.foreground + '33',
            backgroundColor: 'white',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 12),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              placeholderTextColor={colors.surface.foreground + '80'}
              returnKeyType="send"
              onSubmitEditing={submit}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 23,
                borderWidth: 1,
                borderColor: colors.surface.foreground + '4D',
                paddingHorizontal: 16,
                fontSize: 16,
                backgroundColor: colors.surface.base + '40',
                color: colors.surface.foreground,
              }}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={submit}
              style={{
                height: 46,
                paddingHorizontal: 20,
                backgroundColor: colors.brand.primary,
                borderRadius: 23,
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 70,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatInterface;