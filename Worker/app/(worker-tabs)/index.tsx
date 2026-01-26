import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  Modal,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { useAppStore } from "@/lib/store";
import LocationScreen from "@/components/screens/location-screen";

export default function DashboardScreen() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [workerName, setWorkerName] = useState("Worker");

  // --- NEW STATE FOR MATCHED JOBS ---
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const handleIgnore = (jobId: string) => {
    // Smooth animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Remove job from state
    setMatchedJobs(prevJobs =>
      prevJobs.filter((job: any) => job._id !== jobId)
    );
  };

  const { currentLocation } = useAppStore();

  useEffect(() => {
    const loadWorkerData = async () => {
      try {
        const savedName = await AsyncStorage.getItem("workerName");
        const workerId = await AsyncStorage.getItem("userId"); // Assuming you store userId on login
        if (savedName) setWorkerName(savedName);

        if (workerId) {
          fetchMatchedJobs(workerId);
        }
      } catch (error) {
        console.error("Failed to load worker data:", error);
      }
    };
    loadWorkerData();
  }, []);

  // --- FETCH JOBS FROM BACKEND ---
  // Inside DashboardScreen.tsX

  const fetchMatchedJobs = async (workerId: string) => {
    try {
      setLoadingJobs(true);
      // Note: Ensure your .env has the correct API URL
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/worker-feed/${workerId}`);

      if (response.ok) {
        const data = await response.json();
        setMatchedJobs(data); // These jobs are now filtered by SKILL and LOCATION
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("workerName");
          await AsyncStorage.removeItem("userId");
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Real-Time Location Bar */}
      <View style={styles.locationHeader}>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={16} color="#3b82f6" />
          <Text style={styles.locationText} numberOfLines={1}>
            {currentLocation?.address || "Set work location..."}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsLocationModalVisible(true)}>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isLocationModalVisible} animationType="slide" presentationStyle="pageSheet">
        <LocationScreen onLocationSelected={() => setIsLocationModalVisible(false)} />
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.title}>Welcome, {workerName}!</Text>
            <Text style={styles.subtitle}>Tasks matching your skills appear below.</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Feather name="log-out" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Completion */}
      <View style={styles.profileCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Profile Visibility</Text>
          <Text style={styles.primaryText}>70%</Text>
        </View>
        <ProgressBar value={70} style={{ fillColor: "#3b82f6" }} />
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/profile")}>
          <Text style={styles.primaryButtonText}>Optimize Profile</Text>
        </TouchableOpacity>
      </View>

      {/* New Job Requests - DYNAMIC SECTION */}
      <Text style={styles.sectionHeading}>🔥 New Job Requests</Text>

      {loadingJobs ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 20 }} />
      ) : matchedJobs.length > 0 ? (
        matchedJobs.map((job: any) => (
          <View key={job._id} style={styles.jobCard}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <View style={styles.jobInfoRow}>
                  <Feather name="map-pin" size={14} color="#6b7280" />
                  <Text style={styles.jobLocation}>Nearby Request</Text>
                </View>
                <View style={styles.jobInfoRow}>
                  <Feather name="briefcase" size={14} color="#6b7280" />
                  <Text style={styles.jobTitle} numberOfLines={2}>{job.description}</Text>
                </View>
                <View style={styles.tagRow}>
                  {job.skillsRequired?.map((skill: string) => (
                    <View key={skill} style={styles.skillBadge}>
                      <Text style={styles.skillBadgeText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={styles.priceText}>₹{job.budget}</Text>
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleIgnore(job._id)}
              >
                <Text style={styles.secondaryButtonText}>Ignore</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => router.push({
                  pathname: "/work" as any, // Path to the new details screen
                  params: { jobId: job._id }       // Passing the unique Job ID
                })}
              >
                <Text style={styles.acceptText}>View & Bid</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.whiteCard}>
          <Text style={styles.mutedText}>No jobs matching your skills right now. Check back soon!</Text>
        </View>
      )}

      <View style={styles.ongoingContainer}>
        <Text style={styles.sectionTitle}>🔧 Ongoing Job</Text>
        <View style={styles.activeJobInner}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.customerName}>Rajesh Kumar</Text>
              <Text style={styles.mutedText}>Plot 45, Gachibowli</Text>
            </View>
            <TouchableOpacity style={styles.mapButton}>
              <Text style={styles.mapButtonText}>Map</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.callButton}>
              <Feather name="phone" size={16} color="#111827" />
              <Text style={{ color: "#111827", fontWeight: "600" }}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatButton}>
              <Feather name="message-circle" size={16} color="#111827" />
              <Text style={{ color: "#111827", fontWeight: "600" }}>Chat</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.completeButton}>
            <Text style={styles.whiteBtnText}>Mark as Completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Performance */}
      <View style={styles.whiteCard}>
        <Text style={styles.sectionTitle}>📊 Your Performance</Text>
        <View style={styles.perfRow}>
          <View style={styles.perfItem}>
            <Feather name="star" size={18} color="#fbbf24" />
            <Text style={styles.perfLabel}>Rating</Text>
            <Text style={styles.perfValue}>4.7</Text>
          </View>
          <View style={styles.perfItem}>
            <Feather name="briefcase" size={18} color="#6b7280" />
            <Text style={styles.perfLabel}>Completed</Text>
            <Text style={styles.perfValue}>42</Text>
          </View>
          <View style={styles.perfItem}>
            <Feather name="clock" size={18} color="#10b981" />
            <Text style={styles.perfLabel}>On-time</Text>
            <Text style={styles.perfValue}>96%</Text>
          </View>
        </View>
        <ProgressBar value={85} style={{ fillColor: "#10b981" }} />
        <Text style={styles.perfHint}>Complete 8 more jobs to reach ⭐ 4.8</Text>
      </View>

      {/* Earnings */}
      <View style={styles.whiteCard}>
        <Text style={styles.sectionTitle}>💰 Earnings</Text>
        <View style={styles.earningsGrid}>
          <View style={styles.earningBox}>
            <Text style={styles.mutedText}>Today</Text>
            <Text style={styles.earningAmount}>₹900</Text>
          </View>
          <View style={styles.earningBox}>
            <Text style={styles.mutedText}>This Week</Text>
            <Text style={styles.earningAmount}>₹5,400</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryActionButton}>
          <Text style={styles.primaryActionText}>View Earnings Details</Text>
          <Feather name="chevron-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Portfolio */}
      <View style={styles.whiteCard}>
        <TouchableOpacity style={styles.primaryActionButton}>
          <Feather name="camera" size={18} color="#fff" />
          <Text style={styles.primaryActionText}>Add Work Photos</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 20, backgroundColor: "#f3f4f6", paddingBottom: 60 },
  header: { marginBottom: 4 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  locationText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  changeText: { fontSize: 12, color: "#3b82f6", fontWeight: "700", marginLeft: 10 },
  logoutBtn: { padding: 8, backgroundColor: "#fee2e2", borderRadius: 10 },
  profileCard: { backgroundColor: "#eff6ff", borderRadius: 16, padding: 16, gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
  primaryText: { color: "#3b82f6", fontWeight: "700" },
  mutedText: { fontSize: 13, color: "#6b7280" },
  primaryButton: { backgroundColor: "#3b82f6", padding: 12, borderRadius: 10, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 4 },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  statusIndicator: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 15, fontWeight: "600" },
  sectionHeading: { fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 8 },
  jobCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }) },
  jobInfoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  jobLocation: { fontWeight: "700", fontSize: 15, color: "#1f2937" },
  jobTitle: { fontSize: 14, color: "#4b5563" },
  urgencyText: { fontSize: 13, color: "#d97706", fontWeight: "600" },
  priceText: { fontSize: 22, fontWeight: "800", color: "#111827" },
  buttonGroup: { flexDirection: "row", gap: 10, marginTop: 12 },
  acceptButton: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#3b82f6", alignItems: "center" },
  acceptText: { fontWeight: "600", color: "#fff" },
  ongoingContainer: { backgroundColor: "#ecf2ff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#dbeafe" },
  activeJobInner: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginTop: 12 },
  customerName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  mapButton: { backgroundColor: "#3b82f6", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  mapButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  callButton: { flex: 1, backgroundColor: "#e5e7eb", flexDirection: "row", gap: 8, padding: 10, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  chatButton: { flex: 1, backgroundColor: "#e5e7eb", flexDirection: "row", gap: 8, padding: 10, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  completeButton: { backgroundColor: "#3b82f6", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  whiteBtnText: { color: "#fff", fontWeight: "600" },
  whiteCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }) },
  perfRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 16 },
  perfItem: { alignItems: "center", gap: 4 },
  perfLabel: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  perfValue: { fontSize: 18, fontWeight: "700", color: "#111827" },
  perfHint: { fontSize: 12, color: "#6b7280", textAlign: "center", marginTop: 8, fontStyle: "italic" },
  earningsGrid: { flexDirection: "row", gap: 12, marginVertical: 16 },
  earningBox: { flex: 1, backgroundColor: "#f9fafb", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#f3f4f6" },
  earningAmount: { fontSize: 20, fontWeight: "800", color: "#111827", marginTop: 4 },
  mutedSmall: { fontSize: 12, color: "#9ca3af", fontWeight: "400" },
  primaryActionButton: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryActionText: { color: "#fff", fontWeight: "700" },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#7386ae",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secondaryButtonText: { color: "#111827", fontWeight: "600" },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  skillBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#dbeafe' },
  skillBadgeText: { fontSize: 10, color: '#3b82f6', fontWeight: '700', textTransform: 'capitalize' },
});