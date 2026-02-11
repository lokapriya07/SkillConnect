import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, GestureResponderEvent } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { useAppStore } from "@/lib/store"

interface Message {
  id: string
  text: string
  sender: "user" | "worker"
  createdAt: string
}
// ... keep your imports same

export default function ChatScreen() {
  const { workerId, workerName } = useLocalSearchParams()
  const darkMode = useAppStore((state) => state.darkMode)

  // 1. ENSURE MESSAGES STATE USES DYNAMIC INITIAL DATA
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `Hi! I'm ${workerName}. How can I help you today?`, sender: 'worker', createdAt: new Date().toISOString() }
  ])
  const [inputText, setInputText] = useState("")
  const flatListRef = useRef<FlatList>(null)

  // ... keep handleSend same

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user"
    return (
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.workerBubble,
        isUser ? styles.userBubbleAlign : styles.workerBubbleAlign
      ]}>
        <Text style={[
          styles.messageText,
          // 2. FORCING CONTRAST: User text is always white, Worker text adapts
          isUser ? { color: '#FFFFFF' } : { color: darkMode ? "#FFFFFF" : "#1A1A1A" }
        ]}>{item.text}</Text>
        <Text style={[styles.messageTime, { color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    )
  }

  // 3. APPLY STYLES DYNAMICALLY
  const styles = getStyles(darkMode)

  function handleSend(event: GestureResponderEvent): void {
    throw new Error("Function not implemented.")
  }

  return (
    <KeyboardAvoidingView
      // This is the key: ensuring the container style actually changes
      style={[styles.container, { backgroundColor: darkMode ? "#121212" : "#FFFFFF" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: darkMode ? "#1C1C1E" : "#FFFFFF", borderBottomColor: darkMode ? "#2C2C2E" : "#E5E7EB" }]}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={darkMode ? "#FFFFFF" : "#1A1A1A"} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: darkMode ? "#FFFFFF" : "#1A1A1A" }]}>{workerName}</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={darkMode ? "#FFFFFF" : "#1A1A1A"} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        // Ensure background of list doesn't stay white
        style={{ backgroundColor: darkMode ? "#121212" : "#FFFFFF" }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: darkMode ? "#1C1C1E" : "#FFFFFF", borderTopColor: darkMode ? "#2C2C2E" : "#E5E7EB" }]}>
        <View style={[styles.inputWrapper, { backgroundColor: darkMode ? "#2C2C2E" : "#F3F4F6" }]}>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { color: darkMode ? "#FFFFFF" : "#1A1A1A" }]}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// ... rest of your getStyles remains largely the same but ensure 
// the colors inside are referencing the darkMode boolean passed in.

const getStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? "#121212" : "#FFFFFF",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? "#2C2C2E" : "#E5E7EB",
    backgroundColor: darkMode ? "#1C1C1E" : "#FFFFFF",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: darkMode ? "#FFFFFF" : "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  messagesContainer: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  workerBubble: {
    backgroundColor: darkMode ? "#2C2C2E" : "#F3F4F6",
    borderBottomLeftRadius: 4,
  },
  userBubbleAlign: {
    alignSelf: 'flex-end',
  },
  workerBubbleAlign: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  workerMessageText: {
    color: darkMode ? "#FFFFFF" : "#1A1A1A",
  },
  messageTime: {
    fontSize: 10,
    color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: darkMode ? "#2C2C2E" : "#E5E7EB",
    backgroundColor: darkMode ? "#1C1C1E" : "#FFFFFF",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkMode ? "#2C2C2E" : "#F3F4F6",
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 15,
    color: darkMode ? "#FFFFFF" : "#1A1A1A",
    maxHeight: 100,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
})
