"use client"

import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import { Colors } from "@/constants/Colors"

const { width, height } = Dimensions.get("window")

export default function WorkerWelcomeScreen() {
    const router = useRouter()

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* TOP SECTION: Hero Image */}
            <View style={styles.topSection}>
                <Image
                    source={{ uri: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80" }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />

                <View style={styles.brandOverlay}>
                    <Text style={styles.brandTagline}>Partner with Us</Text>
                </View>
            </View>

            {/* BOTTOM SECTION */}
            <View style={styles.bottomSection}>
                {/* Floating Tool Badge */}
                <View style={styles.logoBadge}>
                    <Ionicons name="briefcase" size={32} color={Colors.primary} />
                </View>

                {/* Added ScrollView to prevent cutting on small devices */}
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>
                            Your Skills.{"\n"}
                            <Text style={styles.titleHighlight}>Your Business.</Text>
                        </Text>

                        <Text style={styles.description}>
                            The all-in-one platform to find local jobs, manage your portfolio, and get paid securely.
                        </Text>

                        {/* Feature Highlights */}
                        <View style={styles.featuresRow}>
                            <View style={styles.featurePill}>
                                <Ionicons name="flash" size={14} color={Colors.primary} />
                                <Text style={styles.featurePillText}>Instant Leads</Text>
                            </View>
                            <View style={styles.featurePill}>
                                <Ionicons name="calendar" size={14} color={Colors.primary} />
                                <Text style={styles.featurePillText}>Flexibility</Text>
                            </View>
                            <View style={styles.featurePill}>
                                <Ionicons name="card" size={14} color={Colors.primary} />
                                <Text style={styles.featurePillText}>Fast Payouts</Text>
                            </View>
                        </View>

                        {/* Primary Action */}
                        <TouchableOpacity
                            style={styles.primaryButton}
                            activeOpacity={0.9}
                            onPress={() => router.push("/auth/phone")}
                        >
                            <Text style={styles.primaryButtonText}>Join as a Professional</Text>
                            <View style={styles.iconCircle}>
                                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                            </View>
                        </TouchableOpacity>

                        {/* Secondary Action */}
                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={() => router.replace("/(worker-tabs)")}
                        >
                            <Text style={styles.skipText}>Skip and Browse</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    topSection: {
        height: height * 0.40, // Reduced slightly to give more room to content
        width: "100%",
        position: 'relative',
    },
    backgroundImage: {
        width: "100%",
        height: "100%",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    brandOverlay: {
        position: 'absolute',
        bottom: 50,
        left: 28,
    },
    brandTagline: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    bottomSection: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginTop: -32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
    },
    logoBadge: {
        position: 'absolute',
        top: -30,
        alignSelf: 'center',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    scrollView: {
        flex: 1,
        marginTop: 40, // Space for the badge
    },
    scrollContent: {
        paddingBottom: 20,
        alignItems: 'center',
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: 30, // Slightly smaller to prevent overflow
        fontWeight: "800",
        color: "#121212",
        textAlign: "center",
        lineHeight: 38,
        marginBottom: 12,
    },
    titleHighlight: {
        color: Colors.primary,
    },
    description: {
        fontSize: 15,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 22,
    },
    featuresRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 25,
    },
    featurePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#F4F7FF",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 4,
        borderWidth: 1,
        borderColor: "#E0E7FF",
    },
    featurePillText: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.primary,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: Colors.primary,
        height: 60,
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        marginBottom: 12,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#FFF",
        flex: 1,
        textAlign: 'center',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    skipText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#888",
        textDecorationLine: 'underline',
    },
})