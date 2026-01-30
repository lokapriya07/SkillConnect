"use client"

import { View, Text, StyleSheet, Image } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { useAppStore } from "@/lib/store"
import { Colors } from "@/constants/Colors"
import { Ionicons } from "@expo/vector-icons"


export default function BookingDetailsScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()

  const booking = useAppStore(
    s => s.bookings.find(b => b.id === bookingId)
  )

  if (!booking) {
    return <Text style={{ padding: 20 }}>Booking not found</Text>
  }

  // ✅ FIX: use professional (not worker)
  const professional = booking.professional
  const status = booking.status

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {booking.items?.[0]?.service?.name}
      </Text>

      {/* STATUS */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <Text style={styles.statusValue}>{status.toUpperCase()}</Text>
      </View>

      {/* PROFESSIONAL INFO */}
      {professional && (
        <View style={styles.workerCard}>
          <Image
            source={{ uri: professional.image }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.workerName}>{professional.name}</Text>
            <Text style={styles.workerSub}>
              ⭐ {professional.rating} • Assigned Professional
            </Text>
          </View>
        </View>
      )}

      {/* DATE & TIME */}
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={18} />
        <Text>{booking.date}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={18} />
        <Text>{booking.time}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },

  statusCard: {
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusLabel: { fontSize: 12, color: Colors.textSecondary },
  statusValue: { fontSize: 16, fontWeight: "700", marginTop: 4 },

  workerCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  workerName: { fontSize: 16, fontWeight: "600" },
  workerSub: { fontSize: 12, color: Colors.textSecondary },

  infoRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
})
