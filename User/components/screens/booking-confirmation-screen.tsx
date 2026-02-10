import { Colors } from "@/constants/Colors"
import { useAppStore, AssignedWorker } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native"

// Backend API URL - Update this to match your server IP
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.9:5000";

interface BookingConfirmationScreenProps {
    onGoHome: () => void
    onViewBookings: () => void
    onOpenChat?: (worker: AssignedWorker) => void
}

export default function BookingConfirmationScreen({ onGoHome, onViewBookings, onOpenChat }: BookingConfirmationScreenProps) {
    const currentBooking = useAppStore((state) => state.bookings[0])
    const currentLocation = useAppStore((state) => state.currentLocation)
    const user = useAppStore((state) => state.user)
    const assignWorker = useAppStore((state) => state.assignWorker)
    const darkMode = useAppStore((state) => state.darkMode)
    
    const [assignedWorker, setAssignedWorker] = useState<AssignedWorker | null>(null)
    const [loadingWorker, setLoadingWorker] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

    // Fetch assigned worker when component mounts
    useEffect(() => {
        if (currentBooking?.id) {
            fetchAssignedWorker();
        }
    }, [currentBooking?.id]);

    const fetchAssignedWorker = async () => {
        if (!currentBooking) {
            setLoadingWorker(false)
            return
        }

        try {
            setLoadingWorker(true)
            setError(null)

            // Get service category from booking items - use booking's serviceCategory if available
            const serviceCategory = currentBooking.serviceCategory || 
                                   currentBooking.items[0]?.service?.category || 
                                   currentBooking.items[0]?.service?.name?.toLowerCase() || 
                                   'default'

            const userId = user?._id || user?.id
            const userLatitude = currentLocation?.coordinates?.lat || 28.6139 // Default to Delhi
            const userLongitude = currentLocation?.coordinates?.lng || 77.2090

            console.log('Fetching worker with:', {
                serviceCategory,
                userId,
                userLatitude,
                userLongitude
            })

            const response = await fetch(`${API_URL}/api/jobs/assign-worker`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serviceCategory,
                    serviceName: currentBooking.items[0]?.service?.name || serviceCategory,
                    userId,
                    userLatitude,
                    userLongitude,
                    requiredSkills: currentBooking.items[0]?.service?.name ? 
                        [currentBooking.items[0].service.name.toLowerCase()] : [],
                    totalAmount: currentBooking.total || currentBooking.items[0]?.service?.price || 0,
                    price: currentBooking.total || currentBooking.items[0]?.service?.price || 0,
                    // Send scheduling info
                    scheduledDate: currentBooking.date || null,
                    scheduledTime: currentBooking.time || null,
                    address: currentBooking.address || currentLocation?.address || '',
                    fullAddress: currentBooking.address || currentLocation?.address || ''
                }),
            })

            const data = await response.json()
            console.log('API Response:', data)

            if (data.success && data.worker) {
                const worker: AssignedWorker = {
                    _id: data.worker._id,
                    userId: data.worker.userId,
                    name: data.worker.name,
                    title: data.worker.title,
                    profilePic: data.worker.profilePic,
                    rating: data.worker.rating,
                    experience: data.worker.experience,
                    skills: data.worker.skills,
                    city: data.worker.city,
                    hourlyRate: data.worker.hourlyRate,
                    matchScore: data.worker.matchScore
                }
                
                setAssignedWorker(worker)
                
                // Also update in store for persistence
                if (currentBooking.id) {
                    assignWorker(currentBooking.id, worker)
                }
            } else if (data.totalWorkersFound === 0 || data.error) {
                // No workers found - set null to show no worker message
                setError(data.message || 'No workers available for this service')
            } else {
                setError('Unable to fetch worker information')
            }
        } catch (err) {
            console.error('Error fetching worker:', err)
            setError('Failed to connect to server. Please check your connection.')
        } finally {
            setLoadingWorker(false)
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const safeBooking = currentBooking as any

    const handleChatPress = () => {
        if (assignedWorker && onOpenChat) {
            onOpenChat(assignedWorker)
        } else {
            Alert.alert("Chat Feature", "Chat with your assigned worker coming soon!")
        }
    }

    const handleCallPress = () => {
        Alert.alert("Call Feature", "Calling your assigned worker...")
    }

    const styles = getStyles(darkMode)

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
                    
                    {loadingWorker ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.loadingText}>Finding best worker for you...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={24} color="#FFB800" />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchAssignedWorker}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : assignedWorker ? (
                        <View style={styles.professionalInfo}>
                            <Image
                                source={{
                                    uri: assignedWorker.profilePic || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                                }}
                                style={styles.professionalImage}
                            />
                            <View style={styles.professionalDetails}>
                                <Text style={styles.professionalName}>{assignedWorker.name}</Text>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={14} color="#FFB800" />
                                    <Text style={styles.ratingText}>{assignedWorker.rating?.toFixed(1) || "0.0"} ({assignedWorker.experience || 0} jobs)</Text>
                                </View>
                                <Text style={styles.professionalExp}>
                                    {assignedWorker.experience || 0} years experience
                                </Text>
                                {!!assignedWorker.matchScore && (
                                    <View style={styles.matchBadge}>
                                        <Text style={styles.matchText}>{assignedWorker.matchScore}% Match</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.buttonGroup}>
                                <TouchableOpacity style={styles.callButton} onPress={handleCallPress}>
                                    <Ionicons name="call" size={20} color={Colors.white} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
                                    <Ionicons name="chatbubble-ellipses" size={20} color={Colors.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.noWorkerContainer}>
                            <Text style={styles.noWorkerText}>No worker assigned yet</Text>
                        </View>
                    )}
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

const getStyles = (darkMode: boolean) => {
    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: darkMode ? Colors.backgroundDark : Colors.background,
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
        color: darkMode ? Colors.textDark : Colors.text,
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
        textAlign: "center",
    },
    detailsCard: {
        backgroundColor: darkMode ? Colors.surfaceDark : Colors.white,
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
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
        marginBottom: 4,
    },
    bookingId: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: darkMode ? Colors.borderDark : Colors.border,
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
        backgroundColor: darkMode ? "#1E3A5F" : "#E3F2FD", // Primary Light/Dark
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "600",
        color: darkMode ? Colors.textDark : Colors.text,
    },
    detailSubvalue: {
        fontSize: 13,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
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
        color: darkMode ? Colors.textDark : Colors.text,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.primary,
    },
    professionalCard: {
        backgroundColor: darkMode ? Colors.surfaceDark : Colors.white,
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
        color: darkMode ? Colors.textDark : Colors.text,
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
        color: darkMode ? Colors.textDark : Colors.text,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    ratingText: {
        fontSize: 12,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
        marginLeft: 4,
    },
    professionalExp: {
        fontSize: 12,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
    },
    matchBadge: {
        backgroundColor: darkMode ? "#1E3A5F" : "#E3F2FD",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
        alignSelf: "flex-start",
    },
    matchText: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.primary,
    },
    buttonGroup: {
        flexDirection: "row",
        marginLeft: 12,
    },
    callButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#10B981", // Success Green
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    chatButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingContainer: {
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        fontSize: 14,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
        marginTop: 8,
    },
    errorContainer: {
        alignItems: "center",
        padding: 16,
        backgroundColor: darkMode ? "#2C1A1A" : "#FFFBEB",
        borderRadius: 12,
    },
    errorText: {
        fontSize: 14,
        color: darkMode ? Colors.textDark : Colors.text,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: "600",
    },
    noWorkerContainer: {
        alignItems: "center",
        padding: 20,
    },
    noWorkerText: {
        fontSize: 14,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
    },
    tipsCard: {
        backgroundColor: darkMode ? Colors.surfaceDark : Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    tipsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: darkMode ? Colors.textDark : Colors.text,
        marginLeft: 8,
    },
    tipsText: {
        fontSize: 13,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
        marginBottom: 6,
        lineHeight: 18,
    },
    bottomButtons: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: darkMode ? Colors.borderDark : Colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: darkMode ? Colors.textDark : Colors.text,
    },
    primaryButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
})
}
