import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"

interface QuickActionProps {
  title: string
  description?: string
  icon: keyof typeof Feather.glyphMap
  route: string
}

export function QuickAction({
  title,
  description,
  icon,
  route,
}: QuickActionProps) {
  const navigation = useNavigation()

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate(route as never)}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <Feather name={icon} size={20} color="#4f46e5" />
      </View>

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(79,70,229,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
  },
  description: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    color: "#6b7280",
  },
})
