"use client"

import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import {Colors} from "@/constants/Colors"

const { width, height } = Dimensions.get("window")

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* TOP SECTION: Full Background Image */}
      <View style={styles.topSection}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80" }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        {/* Dark Overlay to make text/logos pop if we put them on top */}
        <View style={styles.overlay} />
      </View>

      {/* BOTTOM SECTION: Floating Card Design */}
      <View style={styles.bottomSection}>

        {/* Floating Logo Badge */}
        <View style={styles.logoBadge}>
          <Ionicons name="construct" size={32} color={Colors.primary} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>
            Home Services{"\n"}
            <Text style={styles.titleHighlight}>Made Simple.</Text>
          </Text>

          <Text style={styles.description}>
            Find trusted professionals for cleaning, repair, and painting instantly.
          </Text>

          {/* Horizontal Feature Pills */}
          <View style={styles.featuresRow}>
            <View style={styles.featurePill}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
              <Text style={styles.featurePillText}>Verified</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="time" size={16} color={Colors.primary} />
              <Text style={styles.featurePillText}>Fast</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="wallet" size={16} color={Colors.primary} />
              <Text style={styles.featurePillText}>Affordable</Text>
            </View>
          </View>

          <View style={styles.spacer} />

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.9}
            onPress={() => router.push("/auth/phone")}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <View style={styles.iconCircle}>
              <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.skipText}>Skip & Browse</Text>
          </TouchableOpacity>
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
    height: height * 0.55,
    width: "100%",
    position: 'relative',
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  bottomSection: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: -40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 40,
    alignItems: 'center',
  },
  logoBadge: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 12,
  },
  titleHighlight: {
    color: Colors.primary,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  // 👇 CHANGED SECTION STARTS HERE
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F0F5FA", // Changed to a very light blue/grey
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  // 👆 CHANGED SECTION ENDS HERE
  featurePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary, // Text remains blue
  },
  spacer: {
    flex: 1,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
    marginLeft: 20,
    flex: 1,
    textAlign: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
  },
})