"use client"

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from "react-native"
import { useLocalSearchParams } from "expo-router"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Clipboard from "expo-clipboard"

const TRACKING_STEPS = [
  { key: "pending", label: "Requested", icon: "receipt-outline" },
  { key: "confirmed", label: "Assigned", icon: "person-outline" },
  { key: "on_the_way", label: "On the way", icon: "car-outline" },
  { key: "in_progress", label: "In progress", icon: "construct-outline" },
  { key: "completed", label: "Completed", icon: "checkmark-done-outline" },
]

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  on_the_way: 2,
  in_progress: 3,
  completed: 4,
}

export default function BookingDetailsScreen() {
  const scheme = useColorScheme()
  const isDark = scheme === "dark"

  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const booking = useAppStore(s => s.bookings.find(b => b.id === bookingId))

  if (!booking) {
    return <Text style={{ padding: 20 }}>Booking not found</Text>
  }

  const professional = booking.professional
  const currentIndex = STATUS_ORDER[booking.status]

  const theme = {
    bg: isDark ? ["#020617", "#020617"] : ["#E0F2FE", "#F0FDFA"],
    text: isDark ? "#E5E7EB" : "#1e3a8a",
    subText: isDark ? "#9CA3AF" : "#64748b",
    card: isDark ? "#0F172A" : "#FFFFFF",
    accent: "#f97316",
    muted: isDark ? "#334155" : "#E2E8F0",
  }

  const copyBookingId = async () => {
    await Clipboard.setStringAsync(booking.id)
    Alert.alert("Copied", "Booking ID copied to clipboard")
  }

  const estimatedCompletion = "6:30 PM" // can be dynamic later

  const actionLabel =
    booking.status === "pending"
      ? "Cancel Booking"
      : booking.status === "completed"
      ? "Rate & Review"
      : "Need Help?"

  return (
    <LinearGradient colors={theme.bg} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* TITLE */}
        <Text style={[styles.title, { color: theme.text }]}>
          Booking Details
        </Text>

        {/* BOOKING ID */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.rowBetween}>
            <Text style={{ color: theme.subText }}>
              Booking ID: <Text style={{ fontWeight: "700" }}>{booking.id}</Text>
            </Text>
            <TouchableOpacity onPress={copyBookingId}>
              <Ionicons name="copy-outline" size={18} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TRACKER */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.trackerRow}>
            {TRACKING_STEPS.map((step, index) => {
              const active = index <= currentIndex
              const last = index === TRACKING_STEPS.length - 1

              return (
                <View key={step.key} style={styles.stepWrapper}>
                  <View
                    style={[
                      styles.stepIcon,
                      active && { backgroundColor: theme.accent },
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={14}
                      color={active ? "#FFF" : theme.subText}
                    />
                  </View>

                  {!last && (
                    <View
                      style={[
                        styles.stepLine,
                        active && { backgroundColor: theme.accent },
                      ]}
                    />
                  )}

                  <Text style={{ fontSize: 10, color: theme.subText }}>
                    {step.label}
                  </Text>
                </View>
              )
            })}
          </View>

          <Text style={{ marginTop: 12, color: theme.subText }}>
            Estimated completion by <Text style={{ fontWeight: "700" }}>{estimatedCompletion}</Text>
          </Text>
        </View>

        {/* SERVICES */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Services</Text>
          {booking.items.map((item, index) => (
            <Text key={index} style={{ color: theme.subText, marginTop: 6 }}>
              • {item.service.name}
            </Text>
          ))}
        </View>

        {/* ADDRESS */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Service Address</Text>
          <Text style={{ color: theme.subText, marginTop: 6 }}>
            {booking.address || "No address provided"}
          </Text>
        </View>

        {/* PROFESSIONAL */}
        {professional && (
          <View style={[styles.card, styles.workerRow, { backgroundColor: theme.card }]}>
            <Image source={{ uri: professional.image }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: "700" }}>
                {professional.name}
              </Text>
              <Text style={{ color: theme.subText }}>
                ⭐ {professional.rating}
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="call-outline" size={18} color={theme.accent} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="chatbubble-outline" size={18} color={theme.accent} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ACTION BUTTON */}
        <TouchableOpacity style={[styles.cta, { backgroundColor: theme.accent }]}>
          <Text style={{ color: "#FFF", fontWeight: "700" }}>{actionLabel}</Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <Text style={styles.footer}>
          ✔ Background-verified professionals • Need help? Contact support
        </Text>

      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 16 },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },

  sectionTitle: { fontSize: 16, fontWeight: "700" },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  trackerRow: { flexDirection: "row", justifyContent: "space-between" },

  stepWrapper: { alignItems: "center", flex: 1 },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepLine: {
    position: "absolute",
    top: 16,
    right: "-50%",
    width: "100%",
    height: 3,
    backgroundColor: "#CBD5F5",
    zIndex: 1,
  },

  workerRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 56, height: 56, borderRadius: 28 },

  actionRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFF1E6",
  },

  cta: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.7,
    marginTop: 20,
  },
})
