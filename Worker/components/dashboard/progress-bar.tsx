import React from "react"
import { View, Text, StyleSheet } from "react-native"

interface ProgressBarProps {
  value: number
  label?: string
  showPercentage?: boolean
  style?: any
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  style,
}: ProgressBarProps) {
  return (
    <View style={[styles.container, style]}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{value}%</Text>
          )}
        </View>
      )}

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(Math.max(value, 0), 100)}%` },
          ]}
        />
      </View>
    </View>
  )
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    color: "#6b7280", // muted foreground
  },
  percentage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827", // foreground
  },
  track: {
    height: 8,
    backgroundColor: "#e5e7eb", // muted
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#3b82f6", // primary
    borderRadius: 999,
  },
})
