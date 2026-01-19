import { Colors } from "@/constants/Colors"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef } from "react"
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface BookingConfirmationScreenProps {
    onGoHome: () => void
    onViewBookings: () => void
}

export default function BookingConfirmationScreen({ onGoHome, onViewBookings }: BookingConfirmationScreenProps) {
    // FIX 1: Retrieve 'bookings' array and get the first item (latest booking)
    const currentBooking = useAppStore((state) => state.bookings[0])

    const scaleAnim = useRef(new Animated.Value(0)).current
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(50)).current

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]).start()
    }, [])

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    // Helper to safely access properties that might not be in the strict Interface yet
    const safeBooking = currentBooking as any;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Success Animation */}
                <Animated.View style={[styles.successContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.successCircle}>
                        <Ionicons name="checkmark" size={60} color={Colors.white} />
                    </View>
                    <Text style={styles.successTitle}>Booking Confirmed!</Text>
                    <Text style={styles.successSubtitle}>Your service has been successfully booked</Text>
                </Animated.View>

                {/* Booking Details */}
                <Animated.View
                    style={[
                        styles.detailsCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.bookingIdContainer}>
                        <Text style={styles.bookingIdLabel}>Booking ID</Text>
                        <Text style={styles.bookingId}>#{currentBooking?.id || "SH20241204001"}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Date & Time */}
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Date & Time</Text>
                            <Text style={styles.detailValue}>
                                {currentBooking?.date ? formatDate(new Date(currentBooking.date)) : "December 5, 2024"}
                            </Text>
                            {/* FIX 2: Use 'time' property (standardized) or fallback to timeSlot */}
                            <Text style={styles.detailSubvalue}>{currentBooking?.time || safeBooking?.timeSlot || "10:00 AM"}</Text>
                        </View>
                    </View>

                    {/* Service Address */}
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="location-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Service Address</Text>
                            <Text style={styles.detailValue}>Home</Text>
                            <Text style={styles.detailSubvalue}>{currentBooking?.address || "123 Main Street"}</Text>
                        </View>
                    </View>

                    {/* Payment */}
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons name="card-outline" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Payment Method</Text>
                            <Text style={styles.detailValue}>
                                {safeBooking?.paymentMethod === "card"
                                    ? "Credit/Debit Card"
                                    : safeBooking?.paymentMethod === "upi"
                                        ? "UPI Payment"
                                        : safeBooking?.paymentMethod === "wallet"
                                            ? "Digital Wallet"
                                            : "Cash on Service"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Total Amount */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>Rs. {currentBooking?.total || "299"}</Text>
                    </View>
                </Animated.View>

                {/* Assigned Professional */}
                <Animated.View
                    style={[
                        styles.professionalCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={styles.professionalTitle}>Assigned Professional</Text>
                    <View style={styles.professionalInfo}>
                        <Image
                            source={{
                                uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                            }}
                            style={styles.professionalImage}
                        />
                        <View style={styles.professionalDetails}>
                            <Text style={styles.professionalName}>John Smith</Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#FFB800" />
                                <Text style={styles.ratingText}>4.9 (200+ services)</Text>
                            </View>
                            <Text style={styles.professionalExp}>5 years experience</Text>
                        </View>
                        <TouchableOpacity style={styles.callButton}>
                            <Ionicons name="call" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Tips Card */}
                <Animated.View
                    style={[
                        styles.tipsCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.tipsHeader}>
                        <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
                        <Text style={styles.tipsTitle}>Quick Tips</Text>
                    </View>
                    <Text style={styles.tipsText}>- Ensure someone is available at the address during the scheduled time</Text>
                    <Text style={styles.tipsText}>- Keep the work area accessible for the professional</Text>
                    <Text style={styles.tipsText}>- You can reschedule up to 2 hours before the service</Text>
                </Animated.View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={styles.bottomButtons}>
                <TouchableOpacity style={styles.secondaryButton} onPress={onViewBookings}>
                    <Text style={styles.secondaryButtonText}>View Bookings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={onGoHome}>
                    <Text style={styles.primaryButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 120,
    },
    successContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    successCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#4CAF50", // Success Green
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: "center",
    },
    detailsCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    bookingIdContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    bookingIdLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    bookingId: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 16,
    },
    detailRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E3F2FD", // Primary Light
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
    },
    detailSubvalue: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.primary,
    },
    professionalCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    professionalTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 12,
    },
    professionalInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    professionalImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 12,
    },
    professionalDetails: {
        flex: 1,
    },
    professionalName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    ratingText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    professionalExp: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    callButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#4CAF50", // Success
        alignItems: "center",
        justifyContent: "center",
    },
    tipsCard: {
        backgroundColor: "#E3F2FD", // Primary Light
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    tipsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
        marginLeft: 8,
    },
    tipsText: {
        fontSize: 13,
        color: Colors.text,
        marginBottom: 6,
        lineHeight: 18,
    },
    bottomButtons: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        padding: 16,
        paddingBottom: 30,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
        alignItems: "center",
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.primary,
    },
    primaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: "center",
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
})
