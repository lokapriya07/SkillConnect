"use client"

import { Colors } from "@/constants/Colors"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { useState } from "react"
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function BookingsScreen() {
    const { bookings, updateBooking, cancelBooking } = useAppStore()

    const [showPicker, setShowPicker] = useState(false)
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
    const [rescheduleDate, setRescheduleDate] = useState(new Date())

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || ""
        if (s === "upcoming" || s === "confirmed") return Colors.primary
        if (s === "completed") return Colors.success
        if (s === "cancelled") return Colors.error
        return Colors.textSecondary
    }

    const getStatusBg = (status: string) => {
        const s = status?.toLowerCase() || ""
        if (s === "upcoming" || s === "confirmed") return Colors.primaryLight
        if (s === "completed") return "#E8F5E9"
        if (s === "cancelled") return "#FFEBEE"
        return Colors.background
    }

    const handleCancelPress = (bookingId: string, bookingDate: string, bookingTime: string) => {
        try {
            const appointmentDate = new Date(bookingDate)
            const [time, modifier] = (bookingTime || "12:00 PM").split(' ')
            let [hours, minutes] = time.split(':').map(Number)

            if (modifier === 'PM' && hours < 12) hours += 12
            if (modifier === 'AM' && hours === 12) hours = 0

            appointmentDate.setHours(hours, minutes, 0, 0)
            const diffInHours = (appointmentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)

            if (diffInHours <= 1) {
                Alert.alert("Cannot Cancel", "1 hour time limit exceeded. You cannot cancel this service anymore.")
            } else {
                Alert.alert("Cancel Booking", "Are you sure? This booking will be removed from your list.", [
                    { text: "No", style: "cancel" },
                    {
                        text: "Yes, Cancel",
                        style: "destructive",
                        onPress: () => {
                            if (cancelBooking) cancelBooking(bookingId)
                        }
                    }
                ])
            }
        } catch (e) {
            console.error("Date parsing error", e)
        }
    }

    const confirmReschedule = (bookingId: string, newDate: Date) => {
        const dateString = newDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        const timeString = newDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })

        Alert.alert("Confirm Reschedule", `Move to ${dateString} at ${timeString}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Confirm", onPress: () => { if (updateBooking) updateBooking(bookingId, { date: dateString, time: timeString }) } }
        ])
    }

    const startReschedule = (bookingId: string) => {
        setSelectedBookingId(bookingId)
        if (Platform.OS === 'android') {
            // Android doesn't support 'datetime' mode. We open Date first, then Time.
            DateTimePickerAndroid.open({
                value: rescheduleDate,
                onChange: (event, date) => {
                    if (event.type === 'set' && date) {
                        DateTimePickerAndroid.open({
                            value: date,
                            onChange: (timeEvent, time) => {
                                if (timeEvent.type === 'set' && time) confirmReschedule(bookingId, time)
                            },
                            mode: 'time',
                            is24Hour: false,
                        })
                    }
                },
                mode: 'date',
                minimumDate: new Date(),
            })
        } else {
            setShowPicker(true)
        }
    }

    // Filter out cancelled bookings so they disappear immediately
    const visibleBookings = bookings.filter(b => b.status !== "cancelled")

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Bookings</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {visibleBookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={80} color={Colors.border} />
                        <Text style={styles.emptyText}>No bookings found</Text>
                    </View>
                ) : (
                    visibleBookings.map((booking: any) => {
                        const status = booking.status?.toLowerCase() || "confirmed"
                        const isActive = status === "upcoming" || status === "confirmed"

                        return (
                            <View key={booking.id} style={styles.bookingCard}>
                                <View style={styles.bookingHeader}>
                                    <Image
                                        source={{ uri: booking.serviceImage || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&h=100&fit=crop" }}
                                        style={styles.bookingImage}
                                    />
                                    <View style={styles.bookingInfo}>
                                        <Text style={styles.bookingService}>{booking.serviceName || "Service"}</Text>
                                        <Text style={styles.bookingProvider}>by {booking.providerName || "Professional"}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(status) }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                                                {status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.bookingPrice}>Rs. {booking.total || booking.price}</Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.bookingDetails}>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                                        <Text style={styles.detailText}>{booking.date}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                                        <Text style={styles.detailText}>{booking.time}</Text>
                                    </View>
                                </View>

                                {isActive && (
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity style={styles.rescheduleButton} onPress={() => startReschedule(booking.id)}>
                                            <Text style={styles.rescheduleText}>Reschedule</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => handleCancelPress(booking.id, booking.date, booking.time)}
                                        >
                                            <Text style={styles.cancelText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )
                    })
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {Platform.OS === 'ios' && showPicker && (
                <DateTimePicker
                    value={rescheduleDate}
                    mode="datetime"
                    display="spinner"
                    minimumDate={new Date()}
                    onChange={(event, date) => {
                        setShowPicker(false)
                        if (date && selectedBookingId) confirmReschedule(selectedBookingId, date)
                    }}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: Colors.white },
    headerTitle: { fontSize: 24, fontWeight: "700", color: Colors.text },
    content: { flex: 1, padding: 16 },
    bookingCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
    bookingHeader: { flexDirection: "row", alignItems: "flex-start" },
    bookingImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
    bookingInfo: { flex: 1 },
    bookingService: { fontSize: 16, fontWeight: "600", color: Colors.text },
    bookingProvider: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
    statusBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: "700" },
    bookingPrice: { fontSize: 16, fontWeight: "700", color: Colors.primary },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
    bookingDetails: { flexDirection: "row", gap: 20 },
    detailItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    detailText: { fontSize: 13, color: Colors.textSecondary },
    actionButtons: { flexDirection: "row", gap: 12, marginTop: 12 },
    rescheduleButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, alignItems: "center" },
    rescheduleText: { fontSize: 14, fontWeight: "500", color: Colors.primary },
    cancelButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.error, alignItems: "center" },
    cancelText: { fontSize: 14, fontWeight: "500", color: Colors.error },
    emptyContainer: { alignItems: "center", marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: "700", color: Colors.text, marginTop: 16 },
})