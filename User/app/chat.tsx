import { Text, View } from "react-native"
import { useLocalSearchParams } from "expo-router"

export default function ChatScreen() {
  const { workerId, workerName } = useLocalSearchParams()

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        Chat with {workerName}
      </Text>
    </View>
  )
}
