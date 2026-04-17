// import { io } from "socket.io-client"
// import { useState, useEffect, useRef } from "react"

// import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, GestureResponderEvent } from "react-native"
// import { useLocalSearchParams } from "expo-router"
// import { Ionicons } from "@expo/vector-icons"
// import { Colors } from "@/constants/Colors"
// import { useAppStore } from "@/lib/store"

// interface Message {
//   id: string
//   text: string
//   sender: "user" | "worker"
//   createdAt: string
// }
// // ... keep your imports same

// export default function ChatScreen() {
//   const { workerId, workerName } = useLocalSearchParams()
//   const darkMode = useAppStore((state) => state.darkMode)

//   // 1. ENSURE MESSAGES STATE USES DYNAMIC INITIAL DATA
//   const [messages, setMessages] = useState<Message[]>([
//     { id: '1', text: `Hi! I'm ${workerName}. How can I help you today?`, sender: 'worker', createdAt: new Date().toISOString() }
//   ])
//   const [inputText, setInputText] = useState("")
//   const flatListRef = useRef<FlatList>(null)


//   // ... keep handleSend same

//   const renderMessage = ({ item }: { item: Message }) => {
//     const isUser = item.sender === "user"
//     return (
//       <View style={[
//         styles.messageBubble,
//         isUser ? styles.userBubble : styles.workerBubble,
//         isUser ? styles.userBubbleAlign : styles.workerBubbleAlign
//       ]}>
//         <Text style={[
//           styles.messageText,
//           // 2. FORCING CONTRAST: User text is always white, Worker text adapts
//           isUser ? { color: '#FFFFFF' } : { color: darkMode ? "#FFFFFF" : "#1A1A1A" }
//         ]}>{item.text}</Text>
//         <Text style={[styles.messageTime, { color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
//           {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//         </Text>
//       </View>
//     )
//   }

//   // 3. APPLY STYLES DYNAMICALLY
//   const styles = getStyles(darkMode)

//   // function handleSend(event: GestureResponderEvent): void {
//   //   throw new Error("Function not implemented.")
//   // }
// function handleSend() {
//   if (!inputText.trim()) return

//   const newMessage: Message = {
//     id: Date.now().toString(),
//     text: inputText,
//     sender: "user",
//     createdAt: new Date().toISOString()
//   }

//   setMessages((prev) => [...prev, newMessage])
//   setInputText("")
// }
//   return (
//     <KeyboardAvoidingView
//       // This is the key: ensuring the container style actually changes
//       style={[styles.container, { backgroundColor: darkMode ? "#121212" : "#FFFFFF" }]}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//     >
//       {/* Header */}
//       <View style={[styles.header, { backgroundColor: darkMode ? "#1C1C1E" : "#FFFFFF", borderBottomColor: darkMode ? "#2C2C2E" : "#E5E7EB" }]}>
//         <TouchableOpacity style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color={darkMode ? "#FFFFFF" : "#1A1A1A"} />
//         </TouchableOpacity>
//         <View style={styles.headerInfo}>
//           <Text style={[styles.headerTitle, { color: darkMode ? "#FFFFFF" : "#1A1A1A" }]}>{workerName}</Text>
//           <Text style={styles.headerSubtitle}>Online</Text>
//         </View>
//         <TouchableOpacity style={styles.moreButton}>
//           <Ionicons name="ellipsis-vertical" size={24} color={darkMode ? "#FFFFFF" : "#1A1A1A"} />
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={item => item.id}
//         renderItem={renderMessage}
//         contentContainerStyle={styles.messagesContainer}
//         showsVerticalScrollIndicator={false}
//         // Ensure background of list doesn't stay white
//         style={{ backgroundColor: darkMode ? "#121212" : "#FFFFFF" }}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//       />

//       {/* Input Area */}
//       <View style={[styles.inputContainer, { backgroundColor: darkMode ? "#1C1C1E" : "#FFFFFF", borderTopColor: darkMode ? "#2C2C2E" : "#E5E7EB" }]}>
//         <View style={[styles.inputWrapper, { backgroundColor: darkMode ? "#2C2C2E" : "#F3F4F6" }]}>
//           <TouchableOpacity style={styles.addButton}>
//             <Ionicons name="add" size={24} color={Colors.primary} />
//           </TouchableOpacity>
//           <TextInput
//             style={[styles.input, { color: darkMode ? "#FFFFFF" : "#1A1A1A" }]}
//             placeholder="Type a message..."
//             placeholderTextColor="#9CA3AF"
//             value={inputText}
//             onChangeText={setInputText}
//           />
//         </View>
//         <TouchableOpacity
//           style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
//           onPress={handleSend}
//           disabled={!inputText.trim()}
//         >
//           <Ionicons name="send" size={20} color="white" />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   )
// }

// // ... rest of your getStyles remains largely the same but ensure 
// // the colors inside are referencing the darkMode boolean passed in.

// const getStyles = (darkMode: boolean) => StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: darkMode ? "#121212" : "#FFFFFF",
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: darkMode ? "#2C2C2E" : "#E5E7EB",
//     backgroundColor: darkMode ? "#1C1C1E" : "#FFFFFF",
//   },
//   backButton: {
//     padding: 8,
//     marginLeft: -8,
//   },
//   headerInfo: {
//     flex: 1,
//     marginLeft: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: darkMode ? "#FFFFFF" : "#1A1A1A",
//   },
//   headerSubtitle: {
//     fontSize: 12,
//     color: '#10B981',
//     marginTop: 2,
//   },
//   moreButton: {
//     padding: 8,
//   },
//   messagesContainer: {
//     padding: 16,
//     gap: 12,
//   },
//   messageBubble: {
//     maxWidth: '80%',
//     padding: 12,
//     borderRadius: 16,
//   },
//   userBubble: {
//     backgroundColor: Colors.primary,
//     borderBottomRightRadius: 4,
//   },
//   workerBubble: {
//     backgroundColor: darkMode ? "#2C2C2E" : "#F3F4F6",
//     borderBottomLeftRadius: 4,
//   },
//   userBubbleAlign: {
//     alignSelf: 'flex-end',
//   },
//   workerBubbleAlign: {
//     alignSelf: 'flex-start',
//   },
//   messageText: {
//     fontSize: 15,
//     lineHeight: 20,
//   },
//   userMessageText: {
//     color: 'white',
//   },
//   workerMessageText: {
//     color: darkMode ? "#FFFFFF" : "#1A1A1A",
//   },
//   messageTime: {
//     fontSize: 10,
//     color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
//     marginTop: 4,
//     alignSelf: 'flex-end',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     borderTopWidth: 1,
//     borderTopColor: darkMode ? "#2C2C2E" : "#E5E7EB",
//     backgroundColor: darkMode ? "#1C1C1E" : "#FFFFFF",
//   },
//   inputWrapper: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: darkMode ? "#2C2C2E" : "#F3F4F6",
//     borderRadius: 24,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//   },
//   addButton: {
//     padding: 8,
//   },
//   input: {
//     flex: 1,
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//     fontSize: 15,
//     color: darkMode ? "#FFFFFF" : "#1A1A1A",
//     maxHeight: 100,
//   },
//   emojiButton: {
//     padding: 8,
//   },
//   sendButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: Colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   sendButtonDisabled: {
//     opacity: 0.5,
//   },
// })

// import { io } from "socket.io-client"
// import { useState, useEffect, useRef } from "react"

// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform
// } from "react-native"

// import { useLocalSearchParams } from "expo-router"
// import { Ionicons } from "@expo/vector-icons"
// import { Colors } from "@/constants/Colors"
// import { useAppStore } from "@/lib/store"

// interface Message {
//   id: string
//   text: string
//   sender: "user" | "worker"
//   createdAt: string
// }

// export default function ChatScreen() {
//   const { workerId, workerName } = useLocalSearchParams()
//   const darkMode = useAppStore((state) => state.darkMode)

//   // ✅ FIX: always string
//   const receiverId = Array.isArray(workerId) ? workerId[0] : workerId

//   // ✅ TEMP USER ID (later replace with login user)
//   const userId = "user1"

//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "1",
//       text: `Hi! I'm ${workerName}. How can I help you today?`,
//       sender: "worker",
//       createdAt: new Date().toISOString()
//     }
//   ])

//   const [inputText, setInputText] = useState("")
//   const flatListRef = useRef<FlatList>(null)
//   const socket = useRef<any>(null)

//   // ✅ SOCKET CONNECTION
//   useEffect(() => {
//     socket.current = io("http://10.28.73.219:5000")

//     socket.current.on("connect", () => {
//       console.log("✅ Connected")

//       socket.current.emit("register", userId)
//     })

//     socket.current.on("receive_message", (data: any) => {
//       const newMessage: Message = {
//         id: Date.now().toString(),
//         text: data.message,
//         sender: "worker",
//         createdAt: new Date().toISOString()
//       }

//       setMessages((prev) => [...prev, newMessage])
//     })

//     return () => {
//       socket.current?.disconnect()
//     }
//   }, [])

//   // ✅ IMPROVED AUTO SCROLL
//   useEffect(() => {
//     setTimeout(() => {
//       flatListRef.current?.scrollToEnd({ animated: true })
//     }, 100)
//   }, [messages])

//   // ✅ SEND MESSAGE
//   function handleSend() {
//     if (!inputText.trim() || !receiverId) return

//     const newMessage: Message = {
//       id: Date.now().toString(),
//       text: inputText,
//       sender: "user",
//       createdAt: new Date().toISOString()
//     }

//     setMessages((prev) => [...prev, newMessage])

//     if (socket.current?.connected) {
//       socket.current.emit("send_message", {
//         jobId: "123",
//         senderId: userId,
//         receiverId: receiverId,
//         message: inputText
//       })
//     } else {
//       console.log("❌ Socket not connected")
//     }

//     setInputText("")
//   }

//   const styles = getStyles(darkMode)

//   const renderMessage = ({ item }: { item: Message }) => {
//     const isUser = item.sender === "user"

//     return (
//       <View
//         style={[
//           styles.messageBubble,
//           isUser ? styles.userBubble : styles.workerBubble
//         ]}
//       >
//         <Text
//           style={[
//             styles.messageText,
//             isUser
//               ? { color: "#FFFFFF" }
//               : { color: darkMode ? "#FFFFFF" : "#1A1A1A" }
//           ]}
//         >
//           {item.text}
//         </Text>

//         <Text style={styles.messageTime}>
//           {new Date(item.createdAt).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit"
//           })}
//         </Text>
//       </View>
//     )
//   }

//   return (
//     <KeyboardAvoidingView
//       style={[
//         styles.container,
//         { backgroundColor: darkMode ? "#121212" : "#FFFFFF" }
//       ]}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>{workerName}</Text>
//       </View>

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item) => item.id}
//         renderItem={renderMessage}
//         contentContainerStyle={styles.messagesContainer}
//       />

//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type message..."
//           placeholderTextColor="#9CA3AF"
//           value={inputText}
//           onChangeText={setInputText}
//         />

//         <TouchableOpacity
//           onPress={handleSend}
//           style={{
//             backgroundColor: Colors.primary,
//             padding: 10,
//             borderRadius: 50
//           }}
//         >
//           <Ionicons name="send" size={20} color="white" />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   )
// }

// const getStyles = (darkMode: boolean) =>
//   StyleSheet.create({
//     container: { flex: 1 },

//     header: {
//       padding: 15,
//       borderBottomWidth: 1,
//       borderBottomColor: darkMode ? "#333" : "#ddd"
//     },

//     headerTitle: {
//       fontSize: 18,
//       fontWeight: "bold",
//       color: darkMode ? "#fff" : "#000"
//     },

//     messagesContainer: {
//       padding: 10
//     },

//     messageBubble: {
//       padding: 10,
//       borderRadius: 10,
//       marginVertical: 5,
//       maxWidth: "80%"
//     },

//     userBubble: {
//       backgroundColor: Colors.primary,
//       alignSelf: "flex-end"
//     },

//     workerBubble: {
//       backgroundColor: darkMode ? "#333" : "#eee",
//       alignSelf: "flex-start"
//     },

//     messageText: {
//       fontSize: 15
//     },

//     messageTime: {
//       fontSize: 10,
//       marginTop: 5,
//       alignSelf: "flex-end",
//       color: "#888"
//     },

//     inputContainer: {
//       flexDirection: "row",
//       padding: 10,
//       alignItems: "center"
//     },

//     input: {
//       flex: 1,
//       borderWidth: 1,
//       borderRadius: 20,
//       paddingHorizontal: 10,
//       marginRight: 10,
//       color: darkMode ? "#fff" : "#000",
//       borderColor: darkMode ? "#555" : "#ccc"
//     }
//   })




import { io } from "socket.io-client"
import { useState, useEffect, useRef } from "react"

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from "react-native"

import { useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { useAppStore } from "@/lib/store"

interface Message {
  id: string
  text: string
  sender: "user" | "worker"
  createdAt: string
  options?: string[]
}

// 🔥 CHAT FLOW
const chatFlow: any = {
  start: {
    message: "Hi! I'm Support Team. How can I help you today?",
    options: ["Booking Issue", "Payment Issue", "Account Help"]
  },

  "Booking Issue": {
    message: "What problem are you facing?",
    options: ["Cancel booking", "Worker not arrived"]
  },

  "Payment Issue": {
    message: "Select your payment issue",
    options: ["Payment failed", "Money deducted"]
  },

  "Account Help": {
    message: "Choose account help",
    options: ["Update profile", "Change password"]
  },

  "Cancel booking": {
    message: "Go to My Bookings, \nCancel option.",
    options: []
  },

  "Worker not arrived": {
    message: "We will reassign a worker.",
    options: []
  },

  "Payment failed": {
    message: "Try again or use another method.",
    options: []
  },

  "Money deducted": {
    message: "Refund will be processed in 3-5 days.",
    options: []
  },
  "Update profile": {
    message: "Go to Profile, \nclick on Edit,  \nEdit your changes, \nclick on Save",
    options: []
  },
  "Change password": {
    message: "Go to Profile, \nclick on Profile,  \nclick on Security, \nclick on Change password, \nclick on Save",
    options: []
  },

}

export default function ChatScreen() {
  const { workerId, workerName } = useLocalSearchParams()
  const darkMode = useAppStore((state) => state.darkMode)

  const receiverId = Array.isArray(workerId) ? workerId[0] : workerId
  const userId = "user1"

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: chatFlow.start.message,
      sender: "worker",
      createdAt: new Date().toISOString(),
      options: chatFlow.start.options
    }
  ])

  const [inputText, setInputText] = useState("")
  const flatListRef = useRef<FlatList>(null)
  const socket = useRef<any>(null)

  // ✅ SOCKET CONNECTION
  useEffect(() => {
    socket.current = io("http://10.0.2.2:5000")

    socket.current.on("connect", () => {
      console.log("✅ Connected")
      socket.current.emit("register", userId)
    })

    socket.current.on("receive_message", (data: any) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        sender: "worker",
        createdAt: new Date().toISOString()
      }

      setMessages((prev) => [...prev, newMessage])
    })

    return () => {
      socket.current?.disconnect()
    }
  }, [])

  // ✅ AUTO SCROLL
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [messages])

  // 🔥 OPTION CLICK HANDLER
  function handleOptionClick(option: string) {
    const next = chatFlow[option]
    if (!next) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: option,
      sender: "user",
      createdAt: new Date().toISOString()
    }

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: next.message,
      sender: "worker",
      createdAt: new Date().toISOString(),
      options: next.options
    }

    setMessages((prev) => [...prev, userMsg, botMsg])
  }

  // ✅ SEND MESSAGE (normal chat still works)
  function handleSend() {
    if (!inputText.trim() || !receiverId) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      createdAt: new Date().toISOString()
    }

    setMessages((prev) => [...prev, newMessage])

    if (socket.current?.connected) {
      socket.current.emit("send_message", {
        jobId: "123",
        senderId: userId,
        receiverId: receiverId,
        message: inputText
      })
    }

    setInputText("")
  }

  const styles = getStyles(darkMode)

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user"

    return (
      <View>
        {/* MESSAGE */}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.workerBubble
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser
                ? { color: "#FFFFFF" }
                : { color: darkMode ? "#FFFFFF" : "#1A1A1A" }
            ]}
          >
            {item.text}
          </Text>

          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </Text>
        </View>

        {/* 🔥 OPTIONS */}
        {!isUser && item.options && item.options.length > 0 && (
          <View style={{ marginTop: 8 }}>
            {item.options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={styles.optionButton}
                onPress={() => handleOptionClick(opt)}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#121212" : "#FFFFFF" }
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{workerName}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type message..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity
          onPress={handleSend}
          style={{
            backgroundColor: Colors.primary,
            padding: 10,
            borderRadius: 50
          }}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: { flex: 1 },

    header: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: darkMode ? "#333" : "#ddd"
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: darkMode ? "#fff" : "#000"
    },

    messagesContainer: {
      padding: 10
    },

    messageBubble: {
      padding: 10,
      borderRadius: 10,
      marginVertical: 5,
      maxWidth: "80%"
    },

    userBubble: {
      backgroundColor: Colors.primary,
      alignSelf: "flex-end"
    },

    workerBubble: {
      backgroundColor: darkMode ? "#333" : "#eee",
      alignSelf: "flex-start"
    },

    messageText: {
      fontSize: 15
    },

    messageTime: {
      fontSize: 10,
      marginTop: 5,
      alignSelf: "flex-end",
      color: "#888"
    },

    inputContainer: {
      flexDirection: "row",
      padding: 10,
      alignItems: "center"
    },

    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 10,
      marginRight: 10,
      color: darkMode ? "#fff" : "#000",
      borderColor: darkMode ? "#555" : "#ccc"
    },

    // 🔥 OPTION BUTTON STYLE
    optionButton: {
      borderWidth: 1,
      borderColor: "#FF3B30",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginVertical: 4,
      alignSelf: "flex-start"
    },

    optionText: {
      color: "#FF3B30",
      fontWeight: "600"
    }
  })




// import { io } from "socket.io-client"
// import { useState, useEffect, useRef } from "react"
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform
// } from "react-native"
// import { useLocalSearchParams } from "expo-router"
// import { Ionicons } from "@expo/vector-icons"
// import * as Linking from "expo-linking"

// import { Colors } from "@/constants/Colors"
// import { useAppStore } from "@/lib/store"

// interface Message {
//   id: string
//   text: string
//   sender: "user" | "worker"
//   createdAt: string
//   options?: string[]
// }

// // 🔥 CHAT FLOW
// const chatFlow: any = {
//   start: {
//     message: "Hi! I'm Support Team 👋\nHow can I help you today?",
//     options: ["Booking Issue", "Payment Issue", "Account Help"]
//   },
//   "Booking Issue": {
//     message: "What problem are you facing?",
//     options: ["Cancel booking", "Worker not arrived"]
//   },
//   "Payment Issue": {
//     message: "Select your payment issue",
//     options: ["Payment failed", "Money deducted"]
//   },
//   "Account Help": {
//     message: "What would you like to do?",
//     options: ["Update profile", "Change password"]
//   },
//   "Cancel booking": {
//     message:
//       "📌 Steps:\n1. My Bookings\n2. Select booking\n3. Cancel\n4. Confirm"
//   },
//   "Worker not arrived": {
//     message:
//       "⚠️ Wait 10 mins → Contact support → We'll reassign"
//   },
//   "Payment failed": {
//     message:
//       "💳 Check balance → Try another method → Retry"
//   },
//   "Money deducted": {
//     message:
//       "💰 Refund in 3–5 days → Check bank"
//   },
//   "Update profile": {
//     message:
//       "👤 Profile → Edit → Update details → Save"
//   },
//   "Change password": {
//     message:
//       "🔐 Profile → Security → Change password → Save"
//   }
// }

// export default function ChatScreen() {
//   const { workerId, workerName, workerPhone } = useLocalSearchParams()

//   const darkMode = useAppStore((state) => state.darkMode)

//   const receiverId = Array.isArray(workerId) ? workerId[0] : workerId
//   const phoneNumber = Array.isArray(workerPhone)
//     ? workerPhone[0]
//     : workerPhone

//   const userId = "user1"

//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "1",
//       text: chatFlow.start.message,
//       sender: "worker",
//       createdAt: new Date().toISOString(),
//       options: chatFlow.start.options
//     }
//   ])

//   const [inputText, setInputText] = useState("")
//   const [typing, setTyping] = useState(false)

//   const flatListRef = useRef<FlatList>(null)
//   const socket = useRef<any>(null)

//   // ✅ SOCKET
//   useEffect(() => {
//     socket.current = io("http://10.0.2.2:5000")

//     socket.current.on("connect", () => {
//       socket.current.emit("register", userId)
//     })

//     socket.current.on("receive_message", (data: any) => {
//       const newMessage: Message = {
//         id: Date.now().toString(),
//         text: data.message,
//         sender: "worker",
//         createdAt: new Date().toISOString()
//       }

//       setMessages((prev) => [...prev, newMessage])
//     })

//     return () => socket.current?.disconnect()
//   }, [])

//   // 🔽 AUTO SCROLL
//   useEffect(() => {
//     flatListRef.current?.scrollToEnd({ animated: true })
//   }, [messages])

//   // 🔥 CALL FUNCTION
//   const handleCall = async () => {
//     if (!phoneNumber) {
//       alert("Phone number not available")
//       return
//     }

//     const url = `tel:${phoneNumber}`

//     const supported = await Linking.canOpenURL(url)
//     if (supported) {
//       await Linking.openURL(url)
//     } else {
//       alert("Calling not supported on this device")
//     }
//   }

//   // 🔥 OPTION CLICK
//   function handleOptionClick(option: string) {
//     const next = chatFlow[option]
//     if (!next) return

//     const userMsg: Message = {
//       id: Date.now().toString(),
//       text: option,
//       sender: "user",
//       createdAt: new Date().toISOString()
//     }

//     setMessages((prev) => [...prev, userMsg])
//     setTyping(true)

//     setTimeout(() => {
//       const botMsg: Message = {
//         id: Date.now().toString(),
//         text: next.message,
//         sender: "worker",
//         createdAt: new Date().toISOString(),
//         options: next.options || []
//       }

//       setTyping(false)
//       setMessages((prev) => [...prev, botMsg])
//     }, 600)
//   }

//   // 🔥 SEND
//   function handleSend() {
//     if (!inputText.trim() || !receiverId) return

//     const newMessage: Message = {
//       id: Date.now().toString(),
//       text: inputText,
//       sender: "user",
//       createdAt: new Date().toISOString()
//     }

//     setMessages((prev) => [...prev, newMessage])

//     socket.current?.emit("send_message", {
//       senderId: userId,
//       receiverId,
//       message: inputText
//     })

//     setInputText("")
//   }

//   const styles = getStyles(darkMode)

//   const renderMessage = ({ item }: { item: Message }) => {
//     const isUser = item.sender === "user"

//     return (
//       <View>
//         <View
//           style={[
//             styles.bubble,
//             isUser ? styles.user : styles.worker
//           ]}
//         >
//           <Text style={styles.text}>{item.text}</Text>
//           <Text style={styles.time}>
//             {new Date(item.createdAt).toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit"
//             })}
//           </Text>
//         </View>

//         {!isUser && item.options && (
//           <View>
//             {item.options.map((opt, i) => (
//               <TouchableOpacity
//                 key={i}
//                 style={styles.optionBtn}
//                 onPress={() => handleOptionClick(opt)}
//               >
//                 <Text style={styles.optionText}>{opt}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </View>
//     )
//   }

//   return (
//     <KeyboardAvoidingView
//       style={[styles.container]}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       {/* 🔥 HEADER WITH CALL */}
//       <View style={styles.header}>
//         <Text style={styles.title}>{workerName}</Text>

//         <TouchableOpacity onPress={handleCall}>
//           <Ionicons name="call" size={22} color={Colors.primary} />
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ padding: 10 }}
//       />

//       {typing && (
//         <Text style={{ marginLeft: 10, color: "#888" }}>
//           Support typing...
//         </Text>
//       )}

//       <View style={styles.inputRow}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type message..."
//           value={inputText}
//           onChangeText={setInputText}
//         />

//         <TouchableOpacity style={styles.send} onPress={handleSend}>
//           <Ionicons name="send" size={18} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   )
// }

// // 🎨 STYLES
// const getStyles = (darkMode: boolean) =>
//   StyleSheet.create({
//     container: { flex: 1 },

//     header: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       padding: 15,
//       borderBottomWidth: 1
//     },

//     title: {
//       fontSize: 18,
//       fontWeight: "600"
//     },

//     bubble: {
//       padding: 12,
//       borderRadius: 15,
//       marginVertical: 5,
//       maxWidth: "80%"
//     },

//     user: {
//       backgroundColor: Colors.primary,
//       alignSelf: "flex-end"
//     },

//     worker: {
//       backgroundColor: "#eee",
//       alignSelf: "flex-start"
//     },

//     text: { fontSize: 15 },

//     time: {
//       fontSize: 10,
//       alignSelf: "flex-end",
//       color: "#888"
//     },

//     inputRow: {
//       flexDirection: "row",
//       padding: 10
//     },

//     input: {
//       flex: 1,
//       backgroundColor: "#f1f1f1",
//       borderRadius: 20,
//       paddingHorizontal: 10
//     },

//     send: {
//       backgroundColor: Colors.primary,
//       padding: 10,
//       borderRadius: 50,
//       marginLeft: 8
//     },

//     optionBtn: {
//       backgroundColor: Colors.primary + "20",
//       padding: 8,
//       borderRadius: 15,
//       marginVertical: 4
//     },

//     optionText: {
//       color: Colors.primary,
//       fontWeight: "600"
//     }
//   })





// import { io } from "socket.io-client"
// import { useState, useEffect, useRef } from "react"
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform
// } from "react-native"
// import { useLocalSearchParams } from "expo-router"
// import { Ionicons } from "@expo/vector-icons"

// import { Colors } from "@/constants/Colors"
// import { useAppStore } from "@/lib/store"

// interface Message {
//   id: string
//   text: string
//   sender: "user" | "worker"
//   createdAt: string
//   options?: string[]
// }

// // 🔥 PROFESSIONAL CHAT FLOW
// const chatFlow: any = {
//   start: {
//     message: "👋 Welcome to Support!\nHow can we assist you today?",
//     options: [
//       "📅 Booking Issue",
//       "💳 Payment Issue",
//       "👤 Account Help"
//     ]
//   },

//   "📅 Booking Issue": {
//     message: "Please choose your booking issue:",
//     options: [
//       "❌ Cancel booking",
//       "⏰ Worker not arrived",
//       "📆 Reschedule booking",
    
//     ]
//   },

//   "❌ Cancel booking": {
//     message:
//       "📌 Steps:\n1. My Bookings\n2. Select booking\n3. Cancel\n4. Confirm\n\n💰 Refund in 3–5 days",

//   },

//   "⏰ Worker not arrived": {
//     message:
//       "⚠️ Wait 10–15 mins → Call worker → If not reachable, contact support.\n\nWe will reassign.",
    
//   },

//   "📆 Reschedule booking": {
//     message:
//       "📅 My Bookings → Select → Reschedule → Choose time",
    
//   },

//   "💳 Payment Issue": {
//     message: "Select your payment issue:",
//     options: [
//       "❌ Payment failed",
//       "💰 Money deducted",
     
//     ]
//   },

//   "❌ Payment failed": {
//     message:
//       "💳 Check balance → Try another method → Retry after few mins",
  
//   },

//   "💰 Money deducted": {
//     message:
//       "💰 Refund will be processed in 3–5 working days.\nCheck bank statement.",
   
//   },

//   "👤 Account Help": {
//     message: "Choose option:",
//     options: [
//       "✏️ Update profile",
//       "🔐 Change password",
     
//     ]
//   },

//   "✏️ Update profile": {
//     message:
//       "👤 Profile → Edit → Update → Save",
   
//   },

//   "🔐 Change password": {
//     message:
//       "🔐 Profile → Security → Change password → Save",
  
//   },

//   "🏠 Main menu": {
//     message: "👋 How can we assist you today?",
//     options: [
//       "📅 Booking Issue",
//       "💳 Payment Issue",
//       "👤 Account Help"
//     ]
//   }
// }

// export default function ChatScreen() {
//   const { workerId, workerName } = useLocalSearchParams()

//   const darkMode = useAppStore((state) => state.darkMode)

//   const receiverId = Array.isArray(workerId) ? workerId[0] : workerId
//   const userId = "user1"

//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "1",
//       text: chatFlow.start.message,
//       sender: "worker",
//       createdAt: new Date().toISOString(),
//       options: chatFlow.start.options
//     }
//   ])

//   const [inputText, setInputText] = useState("")
//   const [typing, setTyping] = useState(false)

//   const flatListRef = useRef<FlatList>(null)
//   const socket = useRef<any>(null)

//   // SOCKET
//   useEffect(() => {
//     socket.current = io("http://10.0.2.2:5000")

//     socket.current.on("connect", () => {
//       socket.current.emit("register", userId)
//     })

//     socket.current.on("receive_message", (data: any) => {
//       const newMessage: Message = {
//         id: Date.now().toString(),
//         text: data.message,
//         sender: "worker",
//         createdAt: new Date().toISOString()
//       }

//       setMessages((prev) => [...prev, newMessage])
//     })

//     return () => socket.current?.disconnect()
//   }, [])

//   // AUTO SCROLL
//   useEffect(() => {
//     flatListRef.current?.scrollToEnd({ animated: true })
//   }, [messages])

//   function handleOptionClick(option: string) {
//     const next = chatFlow[option]
//     if (!next) return

//     const userMsg: Message = {
//       id: Date.now().toString(),
//       text: option,
//       sender: "user",
//       createdAt: new Date().toISOString()
//     }

//     setMessages((prev) => [...prev, userMsg])
//     setTyping(true)

//     setTimeout(() => {
//       const botMsg: Message = {
//         id: Date.now().toString(),
//         text: next.message,
//         sender: "worker",
//         createdAt: new Date().toISOString(),
//         options: next.options || []
//       }

//       setTyping(false)
//       setMessages((prev) => [...prev, botMsg])
//     }, 600)
//   }

//   function handleSend() {
//     if (!inputText.trim() || !receiverId) return

//     const newMessage: Message = {
//       id: Date.now().toString(),
//       text: inputText,
//       sender: "user",
//       createdAt: new Date().toISOString()
//     }

//     setMessages((prev) => [...prev, newMessage])

//     socket.current?.emit("send_message", {
//       senderId: userId,
//       receiverId,
//       message: inputText
//     })

//     setInputText("")
//   }

//   const styles = getStyles(darkMode)

//   const renderMessage = ({ item }: { item: Message }) => {
//     const isUser = item.sender === "user"

//     return (
//       <View>
//         <View
//           style={[
//             styles.bubble,
//             isUser ? styles.user : styles.worker
//           ]}
//         >
//           <Text style={styles.text}>{item.text}</Text>
//           <Text style={styles.time}>
//             {new Date(item.createdAt).toLocaleTimeString([], {
//               hour: "2-digit",
//               minute: "2-digit"
//             })}
//           </Text>
//         </View>

//         {!isUser && item.options && (
//           <View>
//             {item.options.map((opt, i) => (
//               <TouchableOpacity
//                 key={i}
//                 style={styles.optionBtn}
//                 onPress={() => handleOptionClick(opt)}
//               >
//                 <Text style={styles.optionText}>{opt}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </View>
//     )
//   }

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       {/* HEADER (NO CALL BUTTON) */}
//       <View style={styles.header}>
//         <Text style={styles.title}>{workerName}</Text>
//       </View>

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ padding: 10 }}
//       />

//       {typing && (
//         <Text style={{ marginLeft: 10, color: "#888" }}>
//           Support typing...
//         </Text>
//       )}

//       <View style={styles.inputRow}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type message..."
//           value={inputText}
//           onChangeText={setInputText}
//         />

//         <TouchableOpacity style={styles.send} onPress={handleSend}>
//           <Ionicons name="send" size={18} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   )
// }

// // STYLES
// const getStyles = (darkMode: boolean) =>
//   StyleSheet.create({
//     container: { flex: 1 },

//     header: {
//       padding: 15,
//       borderBottomWidth: 1
//     },

//     title: {
//       fontSize: 18,
//       fontWeight: "600"
//     },

//     bubble: {
//       padding: 12,
//       borderRadius: 15,
//       marginVertical: 5,
//       maxWidth: "80%"
//     },

//     user: {
//       backgroundColor: Colors.primary,
//       alignSelf: "flex-end"
//     },

//     worker: {
//       backgroundColor: "#eee",
//       alignSelf: "flex-start"
//     },

//     text: { fontSize: 15 },

//     time: {
//       fontSize: 10,
//       alignSelf: "flex-end",
//       color: "#888"
//     },

//     inputRow: {
//       flexDirection: "row",
//       padding: 10
//     },

//     input: {
//       flex: 1,
//       backgroundColor: "#f1f1f1",
//       borderRadius: 20,
//       paddingHorizontal: 10
//     },

//     send: {
//       backgroundColor: Colors.primary,
//       padding: 10,
//       borderRadius: 50,
//       marginLeft: 8
//     },

//     optionBtn: {
//       backgroundColor: Colors.primary + "20",
//       padding: 8,
//       borderRadius: 15,
//       marginVertical: 4
//     },

//     optionText: {
//       color: Colors.primary,
//       fontWeight: "600"
//     }
//   })