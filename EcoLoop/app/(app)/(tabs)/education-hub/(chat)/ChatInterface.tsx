import { colors } from "@/src/theme/colors";
import React, { useEffect, useRef, useState } from "react";
import {
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
};

const makeId = (p: "u" | "s"): string => `${p}-${Date.now()}`;

const ChatInterface = () => {
  const flatListRef = useRef<FlatList<any>>(null);
  const insets = useSafeAreaInsets();

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

  // keyboard offset (animated) so the bar hugs the keyboard
  const kbOffset = useRef(new Animated.Value(0)).current;
  const [kbHeight, setKbHeight] = useState(0); // raw height for padding calculations

  useEffect(() => {
    // iOS uses 'keyboardWill*' for smooth animation; Android uses 'keyboardDid*'
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: any) => {
      const h = e?.endCoordinates?.height ?? 0;
      setKbHeight(h);
      Animated.timing(kbOffset, {
        toValue: h - Math.max(insets.bottom, 0), // keep safe area into account
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

  const submit = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: makeId("u"), role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    setTimeout(() => {
      setMessages((p) => [
        ...p,
        { id: makeId("s"), role: "system", content: "Thanks! I'll help you with that right away." },
      ]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    }, 400);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={{
          marginBottom: 12,
          maxWidth: "90%",
          alignSelf: isUser ? "flex-end" : "flex-start",
          backgroundColor: isUser ? colors.brand.primary : "#f9ebff",
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text style={{ color: isUser ? "#fff" : "#660066", fontSize: 16, lineHeight: 24 }}>
          {item.content}
        </Text>
      </View>
    );
  };

  // total bottom padding for the list so last messages stay visible:
  const listBottomPad =
    inputBarHeight + Math.max(insets.bottom, 12) + (kbHeight > 0 ? kbHeight - Math.max(insets.bottom, 0) : 0);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: listBottomPad,
        }}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50)}
      />

      {/* Sticky bottom bar that animates with keyboard height */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: Animated.add(new Animated.Value(0), kbOffset),
          borderTopWidth: 1,
          borderTopColor: colors.surface.foreground + "20",
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: Math.max(insets.bottom, 12),
        }}
        onLayout={(e) => setInputBarHeight(e.nativeEvent.layout.height)}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={colors.surface.foreground + "60"}
            returnKeyType="send"
            onSubmitEditing={submit}
            onFocus={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50)}
            multiline
            className="text-purple-800 placeholder:text-purple-900/40"
            maxLength={500}
            style={{
              flex: 1,
              minHeight: 46,
              maxHeight: 120,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 8,
              fontSize: 16,
              backgroundColor: colors.surface.base + "20",
              textAlignVertical: "center",
              borderWidth: 1,
              borderRadius: 12,
              borderColor: "#6b21a8" + "33",
            }}
            />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={submit}
            style={{
              marginLeft: 12,
              height: 46,
              width: 46,
              backgroundColor: colors.brand.primary,
              marginBottom: 8,
              borderRadius: 23,
              alignItems: "center",
              justifyContent: "center",
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>→</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default ChatInterface;