import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"

interface StatCardProps {
  title: string
  value: string | number
  icon: keyof typeof Feather.glyphMap
  trend?: {
    value: number
    positive: boolean
  }
  style?: any
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Feather name={icon} size={16} color="#4f46e5" />
        </View>

        {trend && (
          <Text
            style={[
              styles.trend,
              { color: trend.positive ? "#16a34a" : "#dc2626" },
            ]}
          >
            {trend.positive ? "+" : "-"}
            {Math.abs(trend.value)}%
          </Text>
        )}
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    width: "48%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(79,70,229,0.1)",
  },
  trend: {
    fontSize: 10,
    fontWeight: "600",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  title: {
    fontSize: 10,
    color: "#6b7280",
  },
})
