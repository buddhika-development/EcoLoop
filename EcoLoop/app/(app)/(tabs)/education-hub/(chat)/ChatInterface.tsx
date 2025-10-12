import { api } from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  EmitterSubscription,
  FlatList,
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = {
  id: string;
  role: "system" | "user";
  content: string;
  pending?: boolean;
};

const makeId = (p: "u" | "s"): string => `${p}-${Date.now()}`;

const ChatInterface = () => {
  const flatListRef = useRef<FlatList<any>>(null);
  const insets = useSafeAreaInsets();
  const kbOffset = useRef(new Animated.Value(0)).current;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content:
        "Welcome to EcoLoop Assistant! Ask me anything about sustainability, repair/recycle tips, and our education hub.",
    },
  ]);

  const [input, setInput] = useState("");
  const [inputBarHeight, setInputBarHeight] = useState(60);
  const [kbHeight, setKbHeight] = useState(0);
  const [loading, setLoading] = useState(false);

  // Handle keyboard animation
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: any) => {
      const h = e?.endCoordinates?.height ?? 0;
      setKbHeight(h);
      Animated.timing(kbOffset, {
        toValue: h - Math.max(insets.bottom, 0),
        duration: Platform.OS === "ios" ? e?.duration ?? 250 : 0,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
      });
    };

    const onHide = (e: any) => {
      setKbHeight(0);
      Animated.timing(kbOffset, {
        toValue: 0,
        duration: Platform.OS === "ios" ? e?.duration ?? 200 : 0,
        useNativeDriver: false,
      }).start();
    };

    const subShow: EmitterSubscription = Keyboard.addListener(showEvent as any, onShow);
    const subHide: EmitterSubscription = Keyboard.addListener(hideEvent as any, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [insets.bottom, kbOffset]);

  const submit = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message
    const userMsg: Message = { id: makeId("u"), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Add pending system message (typing indicator)
    const pendingId = makeId("s");
    setMessages((prev) => [
      ...prev,
      { id: pendingId, role: "system", content: "Thinking...", pending: true },
    ]);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      setLoading(true);
      const API_URL = process.env.BACKEND_IP_ADDRESS || "http://192.168.43.235:5000";
      const endpoint = `${API_URL}/api/educator_chat/chat`;

      const res = await api.post(
        endpoint,
        { question: text },
        {
          headers: {
            Authorization:
              "Bearer aB3x9FgH7kLmNpQrS8tUvW2yZ4cD6eF8hJ0kM1nB3vX5zQ7wE9rT2yU4iA6oP8sD0fG",
          },
        }
      );

      const geminiResp = res?.data?.response ?? res?.data ?? "No response";
      const content =
        typeof geminiResp === "string" ? geminiResp : JSON.stringify(geminiResp);

      // Replace pending message with real response
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId ? { ...m, content, pending: false } : m
        )
      );
    } catch (e: any) {
      const errMsg =
        e?.response?.data?.error ??
        e?.message ??
        "Something went wrong. Please try again later.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, content: `Error: ${errMsg}`, pending: false }
            : m
        )
      );
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    const isPending = item.pending;

    return (
      <View
        style={{
          marginVertical: 6,
          maxWidth: "85%",
          alignSelf: isUser ? "flex-end" : "flex-start",
          backgroundColor: isUser ? colors.brand.primary : "#f2e6ff",
          borderRadius: 18,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderTopRightRadius: isUser ? 4 : 18,
          borderTopLeftRadius: isUser ? 18 : 4,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 2,
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator size="small" color={isUser ? "#fff" : "#6b21a8"} />
            <Text
              style={{
                color: isUser ? "#fff" : "#6b21a8",
                fontSize: 15,
                marginLeft: 8,
              }}
            >
              Thinking...
            </Text>
          </View>
        ) : (
          <Text
            style={{
              color: isUser ? "#fff" : "#4a0072",
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            {item.content}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: inputBarHeight + kbHeight + 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
        }
      />

      {/* Input Bar */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: kbOffset,
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#ddd",
          paddingHorizontal: 12,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
        }}
        onLayout={(e) => setInputBarHeight(e.nativeEvent.layout.height)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            backgroundColor: "#fafafa",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "#ddd",
            paddingHorizontal: 10,
            paddingVertical: Platform.OS === "ios" ? 8 : 0,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            returnKeyType="send"
            onSubmitEditing={submit}
            multiline
            style={{
              flex: 1,
              fontSize: 16,
              color: "#333",
              maxHeight: 120,
              paddingHorizontal: 8,
              textAlignVertical: "center",
            }}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={submit}
            disabled={loading}
            style={{
              marginLeft: 8,
              height: 44,
              width: 44,
              borderRadius: 22,
              backgroundColor: loading ? "#b266ff" : colors.brand.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default ChatInterface;
