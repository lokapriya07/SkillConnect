"use client"

import { Button } from "@/components/ui/Button"
import { Colors } from "@/constants/Colors"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"; 

interface LocationScreenProps {
  onLocationSelected: () => void
  onManualEntry: () => void
  onSkip?: () => void
}

export default function LocationScreen({ onLocationSelected, onManualEntry }: LocationScreenProps) {
  const [isDetecting, setIsDetecting] = useState(false)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const { savedAddresses, setCurrentLocation } = useAppStore()
  const darkMode = useAppStore((state) => state.darkMode)

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
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is needed to find services near you.")
        setIsDetecting(false)
        return
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })

      if (addressResult) {
        const formattedAddress = [
          addressResult.street,
          addressResult.district,
          addressResult.city,
        ].filter(Boolean).join(", ")

        setCurrentLocation({
          address: formattedAddress || "Current Location",
          coordinates: { lat: location.coords.latitude, lng: location.coords.longitude },
        })
        onLocationSelected()
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch location. Please try manual entry.")
    } finally {
      setIsDetecting(false)
    }
  }

  const styles = getStyles(darkMode)

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
          <Ionicons name="chevron-forward" size={20} color={darkMode ? Colors.gray[500] : Colors.gray[400]} />
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button title="Enter location manually" onPress={onManualEntry} variant="outline" style={styles.manualButton} />

        {savedAddresses?.length > 0 && (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>Saved Addresses</Text>
            {savedAddresses.map((addr) => (
              <TouchableOpacity key={addr.id} style={styles.savedAddress} onPress={() => onLocationSelected()}>
                <View style={styles.savedIcon}>
                  <Ionicons name={addr.type === "home" ? "home" : "location"} size={20} color={Colors.primary} />
                </View>
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

const getStyles = (darkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: darkMode ? Colors.backgroundDark : "#fff" },
  content: { flex: 1, paddingHorizontal: 24 },
  header: { paddingVertical: 24, alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: darkMode ? Colors.textDark : "#111" },
  headerSubtitle: { fontSize: 16, color: darkMode ? Colors.textSecondaryDark : "#666" },
  detectContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: darkMode ? Colors.surfaceDark : "#f9f9f9", 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  detectActive: { borderColor: Colors.primary, borderWidth: 1 },
  detectIconWrapper: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  pulseRing: { position: "absolute", width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary },
  detectIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: darkMode ? Colors.surfaceDark : "#fff", alignItems: "center", justifyContent: "center", elevation: 2 },
  detectTextContainer: { flex: 1, marginLeft: 12 },
  detectTitle: { fontSize: 16, fontWeight: "600", color: darkMode ? Colors.textDark : "#111" },
  detectSubtitle: { fontSize: 14, color: darkMode ? Colors.textSecondaryDark : "#999" },
  divider: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: darkMode ? Colors.borderDark : "#eee" },
  dividerText: { paddingHorizontal: 12, color: darkMode ? Colors.gray[600] : "#aaa" },
  manualButton: { marginBottom: 24 },
  savedSection: { marginTop: 10 },
  savedTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: darkMode ? Colors.textDark : "#111" },
  savedAddress: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: darkMode ? Colors.borderDark : "#eee" },
  savedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkMode ? '#1E3A5F' : '#E3F2FD',
    alignItems: "center",
    justifyContent: "center",
  },
  savedAddressContent: { marginLeft: 12, flex: 1 },
  savedAddressType: { fontWeight: "600", textTransform: "capitalize", color: darkMode ? Colors.textDark : "#111" },
  savedAddressText: { color: darkMode ? Colors.textSecondaryDark : "#666", fontSize: 13 },
})
