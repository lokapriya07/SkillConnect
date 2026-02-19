"use client"

import { Colors } from "@/constants/Colors"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { useEffect, useState } from "react"
import { Alert, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native"
import { Linking } from "react-native"
import { useRouter } from "expo-router"

export default function BookingsScreen() {
    const router = useRouter()
    const { bookings, updateBooking, cancelBooking, darkMode, user } = useAppStore()
    const [hiredJobs, setHiredJobs] = useState<any[]>([])
    const [loadingHiredJobs, setLoadingHiredJobs] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const currentUserId = user?._id || user?.id

    // Fetch hired jobs from backend when component mounts
    useEffect(() => {
        if (currentUserId) {
            fetchHiredJobs();
        }
    }, [currentUserId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchHiredJobs();
        setRefreshing(false);
    };

    const fetchHiredJobs = async () => {
        try {
            setLoadingHiredJobs(true);
            const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.9:5000";
            const response = await fetch(`${API_URL}/api/jobs/user/${currentUserId}`);
            const data = await response.json();

            if (data.success && data.jobs) {
                // Filter hired/assigned/booked jobs that have a hiredWorker
                // Note: the hire endpoint sets status = 'assigned', not 'hired'/'booked'
                const hired = data.jobs.filter((job: any) =>
                    ['hired', 'booked', 'assigned', 'in_progress', 'scheduled'].includes(job.status) &&
                    job.hiredWorker &&
                    job.hiredWorker.workerName  // ensure hiredWorker data is present
                );
                setHiredJobs(hired);
            }
        } catch (error) {
            console.error("Error fetching hired jobs:", error);
        } finally {
            setLoadingHiredJobs(false);
        }
    }

    // Filter bookings: show only current user's bookings, exclude 'hired_*' entries
    // (hired jobs are now sourced only from the API via hiredJobs state, not the local store)
    const userBookingsList = bookings.filter(b =>
        b.status !== "cancelled" &&
        !b.id?.startsWith('hired_') &&  // exclude old persisted hired jobs from store
        (!b.userId || b.userId === currentUserId)
    )

    // Theme colors
    const backgroundColor = darkMode ? Colors.backgroundDark : Colors.background
    const surfaceColor = darkMode ? Colors.surfaceDark : Colors.surface
    const textColor = darkMode ? Colors.textDark : Colors.text
    const textSecondaryColor = darkMode ? Colors.textSecondaryDark : Colors.textSecondary
    const borderColor = darkMode ? Colors.borderDark : Colors.border
    const primaryLightColor = darkMode ? "#1E3A5F" : "#E3F2FD"

    const [showPicker, setShowPicker] = useState(false)
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
    const [rescheduleDate, setRescheduleDate] = useState(new Date())

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || ""
        if (s === "upcoming" || s === "confirmed") return "#fff"  // White for confirmed/upcoming
        if (s === "completed") return Colors.success
        if (s === "cancelled") return Colors.error
        return textSecondaryColor
    }

    const getStatusBg = (status: string) => {
        const s = status?.toLowerCase() || ""
        if (s === "upcoming" || s === "confirmed") return Colors.primary
        if (s === "completed") return darkMode ? "#1B5E20" : "#E8F5E9"
        if (s === "cancelled") return darkMode ? "#5C1A1A" : "#FFEBEE"
        return surfaceColor
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

    // Dynamic styles
    const getStyles = () => StyleSheet.create({
        container: { flex: 1, backgroundColor: backgroundColor },
        header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: surfaceColor, borderBottomWidth: 1, borderBottomColor: borderColor },
        headerTitle: { fontSize: 24, fontWeight: "700", color: textColor },
        content: { flex: 1, padding: 16 },
        bookingCard: { backgroundColor: surfaceColor, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: borderColor },
        bookingHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
        bookingImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
        bookingInfo: { flex: 1 },
        bookingService: { fontSize: 16, fontWeight: "600", color: textColor },
        bookingProvider: { fontSize: 13, color: textSecondaryColor, marginBottom: 8 },
        statusBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
        statusText: { fontSize: 10, fontWeight: "700" },
        bookingPrice: { fontSize: 16, fontWeight: "700", color: Colors.primary },
        divider: { height: 1, backgroundColor: borderColor, marginVertical: 12 },
        bookingDetails: { flexDirection: "row", gap: 20 },
        detailItem: { flexDirection: "row", alignItems: "center", gap: 6 },
        detailText: { fontSize: 13, color: textSecondaryColor },
        actionButtons: { flexDirection: "row", gap: 12, marginTop: 12 },
        rescheduleButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, alignItems: "center" },
        rescheduleText: { fontSize: 14, fontWeight: "500", color: Colors.primary },
        cancelButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.error, alignItems: "center" },
        cancelText: { fontSize: 14, fontWeight: "500", color: Colors.error },
        emptyContainer: { alignItems: "center", marginTop: 100 },
        emptyText: { fontSize: 18, fontWeight: "700", color: textColor, marginTop: 16 },
        callButton: { backgroundColor: "#2ecc71", padding: 12, borderRadius: 50 },
        chatButton: { backgroundColor: "#3498db", padding: 12, borderRadius: 50 },
        priceAndActions: { alignItems: "flex-end" },
        callChatGroup: { flexDirection: "row", gap: 8, marginTop: 8 },
    })

    const styles = getStyles()

    // Combine regular bookings with hired jobs from bids
    const allBookings = [
        ...userBookingsList,
        ...hiredJobs.map(job => {
            // Build a smart short name: prefer serviceName, then first skill, then first 4 words of description
            const toTitleCase = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());
            const smartName =
                (job.serviceName && job.serviceName.trim())
                    ? toTitleCase(job.serviceName.trim())
                    : (job.skillsRequired?.[0])
                        ? toTitleCase(job.skillsRequired[0])
                        : (job.description)
                            ? toTitleCase(job.description.trim().split(/\s+/).slice(0, 5).join(' '))
                            : 'Service Booking';

            return ({
                id: `hired_${job._id}`,
                items: [{
                    service: {
                        id: job._id,
                        name: smartName,
                        description: job.description || "",
                        price: job.hiredWorker?.bidAmount || job.totalAmount || job.budget || 0,
                        duration: "",
                        image: job.imagePath || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&h=100&fit=crop",
                        rating: 0,
                        reviews: 0,
                        category: job.skillsRequired?.[0] || "Hired Service"
                    },
                    quantity: 1
                }],
                total: job.hiredWorker?.bidAmount || job.totalAmount || job.budget || 0,
                status: "confirmed",
                date: job.scheduledDate || new Date().toLocaleDateString(),
                time: job.scheduledTime || "To be confirmed",
                address: job.fullAddress || job.address || "",
                paymentMethod: "confirmed",
                providerName: job.hiredWorker?.workerName || "Worker",
                assignedWorker: {
                    _id: job.hiredWorker?.workerId || "",
                    userId: job.hiredWorker?.workerId || "",
                    name: job.hiredWorker?.workerName || "Worker",
                    phone: "",
                    profilePic: job.hiredWorker?.workerProfilePic
                },
                isHiredJob: true
            });
        })
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Bookings</Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            >
                {loadingHiredJobs ? (
                    <View style={styles.emptyContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.emptyText}>Loading bookings...</Text>
                    </View>
                ) : allBookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={80} color={textSecondaryColor} />
                        <Text style={styles.emptyText}>No bookings found</Text>
                    </View>
                ) : (
                    allBookings.map((booking: any) => {
                        const worker = booking.assignedWorker || booking.worker
                        const status = booking.status?.toLowerCase() || "confirmed"
                        const isActive = status === "upcoming" || status === "confirmed"
                        const providerName = booking.providerName || (booking.assignedWorker?.name ? `Hired: ${booking.assignedWorker.name}` : "Professional")

                        return (
                            <TouchableOpacity
                                key={booking.id}
                                style={styles.bookingCard}
                                activeOpacity={0.9}
                                onPress={() =>
                                    router.push({
                                        pathname: "/booking-details",
                                        params: { bookingId: booking.id },
                                    })
                                }
                            >
                                <View style={styles.bookingHeader}>
                                    <Image
                                        source={{
                                            uri:
                                                booking.items?.[0]?.service?.image ||
                                                "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&h=100&fit=crop"
                                        }}
                                        style={styles.bookingImage}
                                    />
                                    <View style={styles.bookingInfo}>
                                        <Text style={styles.bookingService}>{booking.items?.[0]?.service?.name || "Service"}</Text>
                                        <Text style={styles.bookingProvider}>by {providerName}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(status) }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                                                {booking.isHiredJob ? 'HIRED' : status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Price + Call/Chat */}
                                    <View style={styles.priceAndActions}>
                                        <Text style={styles.bookingPrice}>Rs. {booking.total || booking.price}</Text>
                                        {isActive && (
                                            <View style={styles.callChatGroup}>
                                                <TouchableOpacity
                                                    style={styles.callButton}
                                                    onPress={() => Linking.openURL(`tel:${worker.phone}`)}
                                                >
                                                    <Ionicons name="call" size={20} color="white" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.chatButton}
                                                    onPress={() =>
                                                        router.push({
                                                            pathname: "/chat",
                                                            params: { workerId: worker.id, workerName: worker.name },
                                                        })
                                                    }
                                                >
                                                    <Ionicons name="chatbubble" size={20} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.bookingDetails}>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="calendar-outline" size={16} color={textSecondaryColor} />
                                        <Text style={styles.detailText}>{booking.date}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="time-outline" size={16} color={textSecondaryColor} />
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
                            </TouchableOpacity>
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
