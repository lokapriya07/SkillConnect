// app/components/ui/badge.tsx
import React from "react"
import { View, Text, StyleSheet } from "react-native"

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, color }) => {
  return (
    <View style={[styles.container, { backgroundColor: color || "#ddd" }]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
})
