"use client"

import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native"
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

            {/* TOP SECTION: Hero Image showing a Professional at work */}
            <View style={styles.topSection}>
                <Image
                    source={{ uri: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80" }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />

                {/* Branding on top of image */}
                <View style={styles.brandOverlay}>
                    <Text style={styles.brandTagline}>Partner with Us</Text>
                </View>
            </View>

            {/* BOTTOM SECTION: The Value Proposition Card */}
            <View style={styles.bottomSection}>

                {/* Floating Tool Badge */}
                <View style={styles.logoBadge}>
                    <Ionicons name="briefcase" size={32} color={Colors.primary} />
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>
                        Your Skills.{"\n"}
                        <Text style={styles.titleHighlight}>Your Business.</Text>
                    </Text>

                    <Text style={styles.description}>
                        The all-in-one platform to find local jobs, manage your portfolio, and get paid securely.
                    </Text>

                    {/* Feature Highlights for Workers */}
                    <View style={styles.featuresRow}>
                        <View style={styles.featurePill}>
                            <Ionicons name="flash" size={16} color={Colors.primary} />
                            <Text style={styles.featurePillText}>Instant Leads</Text>
                        </View>
                        <View style={styles.featurePill}>
                            <Ionicons name="calendar" size={16} color={Colors.primary} />
                            <Text style={styles.featurePillText}>Flexibility</Text>
                        </View>
                        <View style={styles.featurePill}>
                            <Ionicons name="card" size={16} color={Colors.primary} />
                            <Text style={styles.featurePillText}>Fast Payouts</Text>
                        </View>
                    </View>

                    <View style={styles.spacer} />

                    {/* Primary Action: Onboarding/Login */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        activeOpacity={0.9}
                        onPress={() => router.push("/auth/phone")} // Updated to point to phone verification
                    >
                        <Text style={styles.primaryButtonText}>Join as a Professional</Text>
                        <View style={styles.iconCircle}>
                            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                        </View>
                    </TouchableOpacity>

                    {/* Secondary Action: Demo/Browse */}
                    {/* <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => router.replace("/(worker-tabs)")}
                    >
                        <Text style={styles.skipText}>Browse Available Jobs</Text>
                    </TouchableOpacity> */}
                </View>
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
        height: height * 0.45,
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
        bottom: 60,
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
        paddingHorizontal: 28,
        paddingTop: 45,
        alignItems: 'center',
    },
    logoBadge: {
        position: 'absolute',
        top: -30,
        alignSelf: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 40,
    },
    title: {
        fontSize: 34,
        fontWeight: "800",
        color: "#121212",
        textAlign: "center",
        lineHeight: 42,
        marginBottom: 16,
    },
    titleHighlight: {
        color: Colors.primary,
    },
    description: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 24,
    },
    featuresRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 30,
    },
    featurePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#F4F7FF",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 25,
        gap: 6,
        borderWidth: 1,
        borderColor: "#E0E7FF",
    },
    featurePillText: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.primary,
    },
    spacer: {
        flex: 1,
        height: 30,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: Colors.primary,
        height: 64,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        marginTop: 10, // Add some top margin instead of relying on a spacer
        marginBottom: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFF",
        flex: 1,
        textAlign: 'center',
        marginLeft: 40,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButton: {
        paddingVertical: 15,
        marginBottom: 20,
    },
    skipText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
        textDecorationLine: 'underline',
    },
})