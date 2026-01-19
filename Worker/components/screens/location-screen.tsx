"use client"

import { Button } from "@/components/ui/button"
import { Colors } from "@/constants/Colors"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, TouchableOpacity, View, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";

interface LocationScreenProps {
    onLocationSelected: () => void;
}

export default function LocationScreen({ onLocationSelected }: LocationScreenProps) {
    const router = useRouter();
    const [isDetecting, setIsDetecting] = useState(false)
    const pulseAnim = useRef(new Animated.Value(1)).current
    const { savedAddresses, setCurrentLocation } = useAppStore()

    useEffect(() => {
        let animation: Animated.CompositeAnimation
        if (isDetecting) {
            animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ]),
            )
            animation.start()
        } else {
            pulseAnim.setValue(1)
        }
        return () => animation?.stop()
    }, [isDetecting])

    const handleDetectLocation = async () => {
        setIsDetecting(true)
        try {
            // 1. Request Permission (This triggers the system "Allow access" popup)
            const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync()

            if (status !== "granted") {
                setIsDetecting(false)
                if (!canAskAgain) {
                    Alert.alert(
                        "Permission Required",
                        "Location access is permanently denied. Please enable it in Settings.",
                        [{ text: "Cancel" }, { text: "Settings", onPress: () => Linking.openSettings() }]
                    );
                } else {
                    Alert.alert("Permission Denied", "We need location to show local jobs.");
                }
                return
            }

            // 2. Get Real Position (High Accuracy)
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            })

            // 3. Reverse Geocode (Get Address from Coordinates)
            const [addressResult] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            })

            if (addressResult) {
                const formattedAddress = [
                    addressResult.streetNumber,
                    addressResult.street,
                    addressResult.district,
                    addressResult.city,
                ].filter(Boolean).join(", ")

                // 4. Update Global Store
                setCurrentLocation({
                    address: formattedAddress || "Current Location",
                    coordinates: { lat: location.coords.latitude, lng: location.coords.longitude },
                })

                // 5. Success - Notify parent to close modal
                onLocationSelected()
            }
        } catch (error) {
            Alert.alert("Error", "Could not fetch location. Ensure GPS is enabled.")
        } finally {
            setIsDetecting(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Set your location</Text>
                    <Text style={styles.headerSubtitle}>To find services available in your area</Text>
                </View>

                <TouchableOpacity
                    style={[styles.detectContainer, isDetecting && styles.detectActive]}
                    onPress={handleDetectLocation}
                    disabled={isDetecting}
                >
                    <View style={styles.detectIconWrapper}>
                        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], opacity: isDetecting ? 0.3 : 0 }]} />
                        <View style={styles.detectIcon}>
                            {isDetecting ? <ActivityIndicator color={Colors.primary} /> : <Ionicons name="locate" size={28} color={Colors.primary} />}
                        </View>
                    </View>
                    <View style={styles.detectTextContainer}>
                        <Text style={styles.detectTitle}>{isDetecting ? "Detecting..." : "Use current location"}</Text>
                        <Text style={styles.detectSubtitle}>Using GPS to find your location</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>

                <Button
                    title="Enter location manually"
                    onPress={() => router.push("/manual-location")}
                    variant="outline"
                    style={styles.manualButton}
                />

                {savedAddresses?.length > 0 && (
                    <View style={styles.savedSection}>
                        <Text style={styles.savedTitle}>Saved Addresses</Text>
                        {savedAddresses.map((addr: any) => (
                            <TouchableOpacity key={addr.id} style={styles.savedAddress} onPress={onLocationSelected}>
                                <Ionicons name={addr.type === "home" ? "home" : "location"} size={20} color={Colors.primary} />
                                <View style={styles.savedAddressContent}>
                                    <Text style={styles.savedAddressType}>{addr.type}</Text>
                                    <Text style={styles.savedAddressText} numberOfLines={1}>{addr.fullAddress}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { flex: 1, paddingHorizontal: 24 },
    header: { paddingVertical: 24, alignItems: "center" },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: "#111" },
    headerSubtitle: { fontSize: 16, color: "#666" },
    detectContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 16, padding: 16, marginBottom: 24 },
    detectActive: { borderColor: Colors.primary, borderWidth: 1 },
    detectIconWrapper: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
    pulseRing: { position: "absolute", width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary },
    detectIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 2 },
    detectTextContainer: { flex: 1, marginLeft: 12 },
    detectTitle: { fontSize: 16, fontWeight: "600" },
    detectSubtitle: { fontSize: 14, color: "#999" },
    divider: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#eee" },
    dividerText: { paddingHorizontal: 12, color: "#aaa" },
    manualButton: { marginBottom: 24 },
    savedSection: { marginTop: 10 },
    savedTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
    savedAddress: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
    savedAddressContent: { marginLeft: 12, flex: 1 },
    savedAddressType: { fontWeight: "600", textTransform: "capitalize" },
    savedAddressText: { color: "#666", fontSize: 13 },
});