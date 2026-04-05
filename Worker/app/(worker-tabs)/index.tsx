import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  RefreshControl,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { useAppStore } from "@/lib/store";
import LocationScreen from "@/components/screens/location-screen";
import * as Location from "expo-location";

export default function DashboardScreen() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [workerName, setWorkerName] = useState("Worker");
  const [refreshing, setRefreshing] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const { currentLocation } = useAppStore();
  const [profileCompletion, setProfileCompletion] = useState(0);

  const handleIgnore = (jobId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMatchedJobs((prev) => prev.filter((job: any) => job._id !== jobId));
  };

  const JobLocationText = ({ jobLocation }: { jobLocation: any }) => {
    const [address, setAddress] = useState("Loading...");
    useEffect(() => {
      const getAddress = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") { setAddress("Permission denied"); return; }
          const coords = jobLocation?.coordinates;
          if (!coords || coords.length < 2) { setAddress("Unknown Location"); return; }
          const result = await Location.reverseGeocodeAsync({ latitude: coords[1], longitude: coords[0] });
          if (result?.length > 0) {
            const { name, city, district, region } = result[0];
            setAddress(name || district || city || region || "Nearby");
          } else { setAddress("Area not found"); }
        } catch { setAddress("Location Error"); }
      };
      getAddress();
    }, [jobLocation]);
    return <Text style={styles.jobLocation} numberOfLines={1}>{address}</Text>;
  };

  const fetchMatchedJobs = async (workerId: string) => {
    try {
      setLoadingJobs(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/worker-feed/${workerId}`);
      if (response.ok) {
        const data = await response.json();
        try {
          const bidsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bids/active/worker/${workerId}`);
          const bidsData = await bidsResponse.json();
          if (bidsData.success && bidsData.bids) {
            const bidJobIds = new Set(bidsData.bids.filter((b: any) => b.job?._id).map((b: any) => b.job._id.toString()));
            setMatchedJobs(data.filter((job: any) => !bidJobIds.has(job._id.toString())));
          } else { setMatchedJobs(data); }
        } catch { setMatchedJobs(data); }
      }
    } catch (error) { console.error("Fetch error:", error); }
    finally { setLoadingJobs(false); }
  };

  const initializeDashboard = async () => {
    try {
      setLoadingJobs(true);
      const savedName = await AsyncStorage.getItem("workerName");
      const workerId = await AsyncStorage.getItem("userId") || await AsyncStorage.getItem("workerId");
      if (savedName) setWorkerName(savedName);
      if (workerId) {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/work/profile/${workerId}`);
        const result = await response.json();
        if (result.success && result.data) {
          setWorkerName(result.data.name || "Worker");
          setProfileCompletion(result.data.completionPercentage || 0);
        } else { setProfileCompletion(0); }
        await fetchMatchedJobs(workerId);
      }
    } catch (error) { console.error("Dashboard Load Error:", error); setProfileCompletion(0); }
    finally { setLoadingJobs(false); }
  };

  useEffect(() => { initializeDashboard(); }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("workerName");
          await AsyncStorage.removeItem("userId");
          await AsyncStorage.removeItem("is_verified_worker");
          await AsyncStorage.removeItem("verification_requested");
          await AsyncStorage.removeItem("user");
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6366f1"]} tintColor="#6366f1" />}
    >
      {/* ── PREMIUM HEADER ── */}
      <LinearGradient
        colors={["#4f46e5", "#3730a3", "#1e1b4b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Location bar */}
        <TouchableOpacity style={styles.locationBar} onPress={() => setIsLocationModalVisible(true)} activeOpacity={0.85}>
          <View style={styles.locationIconWrap}>
            <Feather name="map-pin" size={12} color="#c7d2fe" />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {currentLocation?.address || "Set work location..."}
          </Text>
          <View style={styles.changePill}>
            <Text style={styles.changeText}>Change</Text>
            <Feather name="chevron-right" size={11} color="#c7d2fe" />
          </View>
        </TouchableOpacity>

        {/* Avatar + Welcome */}
        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{workerName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.name} numberOfLines={1}>{workerName}</Text>
            <Text style={styles.subGreeting}>Ready to earn today?</Text>
          </View>
          {/* Logout */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Feather name="log-out" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Availability toggle */}
        <View style={styles.availRow}>
          <View style={styles.availLeft}>
            <View style={[styles.dot, { backgroundColor: isAvailable ? "#34d399" : "#f87171" }]} />
            <View>
              <Text style={styles.availLabel}>AVAILABILITY</Text>
              <Text style={[styles.availStatus, { color: isAvailable ? "#34d399" : "#f87171" }]}>
                {isAvailable ? "Available for work" : "Offline"}
              </Text>
            </View>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: "rgba(248,113,113,0.3)", true: "rgba(52,211,153,0.35)" }}
            thumbColor={isAvailable ? "#34d399" : "#f87171"}
            ios_backgroundColor="rgba(248,113,113,0.3)"
          />
        </View>
      </LinearGradient>

      {/* Location modal */}
      <Modal visible={isLocationModalVisible} animationType="slide" presentationStyle="pageSheet">
        <LocationScreen onLocationSelected={() => setIsLocationModalVisible(false)} />
      </Modal>

      {/* ── PROFILE STRENGTH CARD ── */}
      {profileCompletion < 100 && (
        <View style={styles.profileCard}>
          <View style={styles.profileCardTop}>
            <View style={styles.profileCardLeft}>
              <View style={styles.profileIconWrap}>
                <Feather name="user-check" size={15} color="#6366f1" />
              </View>
              <Text style={styles.profileCardTitle}>Profile Strength</Text>
            </View>
            <View style={styles.pctBadge}>
              <Text style={styles.pctText}>{profileCompletion}%</Text>
            </View>
          </View>
          <View style={styles.progressWrap}>
            <ProgressBar value={profileCompletion} style={{ fillColor: "#6366f1", height: 7, borderRadius: 4 }} />
          </View>
          <Text style={styles.profileHint}>
            {profileCompletion < 50 ? "🚀 Complete your profile to unlock more jobs" : "✨ Almost there! Add a few more details"}
          </Text>
          <TouchableOpacity style={styles.optimizeBtn} onPress={() => router.push("/profile")} activeOpacity={0.85}>
            <Feather name="zap" size={15} color="#fff" />
            <Text style={styles.optimizeBtnText}>Optimize Profile</Text>
            <Feather name="arrow-right" size={15} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── NEW JOB REQUESTS ── */}
      <View style={styles.sectionRow}>
        <View style={styles.sectionLeft}>
          <View style={styles.fireWrap}>
            <FontAwesome5 name="fire" size={13} color="#f97316" />
          </View>
          <Text style={styles.sectionTitle}>New Job Requests</Text>
        </View>
        {matchedJobs.length > 0 && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{matchedJobs.length} new</Text>
          </View>
        )}
      </View>

      {loadingJobs ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Finding best matches...</Text>
        </View>
      ) : matchedJobs.length > 0 ? (
        matchedJobs.map((job: any) => (
          <View key={job._id} style={styles.jobCard}>
            {/* Top strip */}
            <View style={styles.jobTopRow}>
              <View style={styles.matchPill}>
                <View style={styles.greenDot} />
                <Text style={styles.matchText}>New Match</Text>
              </View>
              <Text style={styles.budgetText}>₹{job.budget}</Text>
            </View>
            {/* Details */}
            <View style={styles.jobInfoBlock}>
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={13} color="#6366f1" />
                <JobLocationText jobLocation={job.location} />
              </View>
              <View style={styles.infoRow}>
                <Feather name="briefcase" size={13} color="#6366f1" />
                <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>
              </View>
            </View>
            {/* Skills */}
            <View style={styles.skillsRow}>
              {job.skillsRequired?.slice(0, 3).map((s: string) => (
                <View key={s} style={styles.skillChip}><Text style={styles.skillText}>{s}</Text></View>
              ))}
              {job.skillsRequired?.length > 3 && (
                <View style={styles.skillChip}><Text style={styles.skillText}>+{job.skillsRequired.length - 3}</Text></View>
              )}
            </View>
            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => handleIgnore(job._id)} activeOpacity={0.7}>
                <Feather name="x" size={14} color="#94a3b8" />
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bidBtn} onPress={() => router.push({ pathname: "/work" as any, params: { jobId: job._id } })} activeOpacity={0.85}>
                <Text style={styles.bidText}>View & Bid</Text>
                <Feather name="arrow-right" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Feather name="inbox" size={28} color="#a5b4fc" />
          </View>
          <Text style={styles.emptyTitle}>No jobs found nearby</Text>
          <Text style={styles.emptySub}>Update your profile skills to get matched with more clients</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/profile")}>
            <Text style={styles.emptyBtnText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── STATS ── */}
      <View style={styles.statsRow}>
        {[
          { label: "Rating", value: "4.7", icon: "star", colors: ["#fbbf24", "#f59e0b"] },
          { label: "Completed", value: "42", icon: "briefcase", colors: ["#6366f1", "#4f46e5"] },
          { label: "On-time", value: "96%", icon: "clock", colors: ["#10b981", "#059669"] },
        ].map((item) => (
          <View key={item.label} style={styles.statCard}>
            <LinearGradient colors={item.colors as any} style={styles.statGrad}>
              <Feather name={item.icon as any} size={17} color="#fff" />
              <Text style={styles.statVal}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* ── EARNINGS ── */}
      <View style={styles.earningsCard}>
        <View style={styles.earningsTop}>
          <View style={styles.earningsTitleRow}>
            <View style={styles.earningsIconWrap}>
              <Feather name="trending-up" size={14} color="#6366f1" />
            </View>
            <Text style={styles.earningsTitle}>Earnings Overview</Text>
          </View>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        <View style={styles.earningsGrid}>
          <View style={styles.earningBox}>
            <Text style={styles.earningLabel}>Today</Text>
            <Text style={styles.earningAmt}>₹900</Text>
            <Text style={styles.earningTrend}>↑ +12%</Text>
          </View>
          <View style={styles.earningDivider} />
          <View style={styles.earningBox}>
            <Text style={styles.earningLabel}>This Week</Text>
            <Text style={styles.earningAmt}>₹5,400</Text>
            <Text style={styles.earningTrend}>↑ +8%</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewDetails}>
          <Text style={styles.viewDetailsText}>View Detailed Earnings</Text>
          <Feather name="arrow-right" size={13} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* ── PORTFOLIO ── */}
      <TouchableOpacity style={styles.portfolioCard} activeOpacity={0.8}>
        <View style={styles.portfolioIconWrap}>
          <Feather name="camera" size={22} color="#6366f1" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.portfolioTitle}>Showcase Your Work</Text>
          <Text style={styles.portfolioSub}>Add photos to attract more clients</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#cbd5e1" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const SHADOW_SM = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 3 },
});
const SHADOW_MD = Platform.select({
  ios: { shadowColor: "#4338ca", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
  android: { elevation: 6 },
});

const styles = StyleSheet.create({
  container: { paddingBottom: 80, backgroundColor: "#f1f5f9" },

  // ── HEADER
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginBottom: 20,
    gap: 8,
  },
  locationIconWrap: {
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: "rgba(165,180,252,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  locationText: { flex: 1, fontSize: 13, color: "#e0e7ff", fontWeight: "500" },
  changePill: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  changeText: { fontSize: 11, color: "#c7d2fe", fontWeight: "700" },

  // Identity
  identityRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  avatar: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "800", color: "#fff" },
  greeting: { fontSize: 12, color: "rgba(199,210,254,0.8)", marginBottom: 2 },
  name: { fontSize: 24, fontWeight: "800", color: "#fff", letterSpacing: -0.5, marginBottom: 2 },
  subGreeting: { fontSize: 12, color: "rgba(199,210,254,0.65)" },
  logoutBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center", alignItems: "center",
  },

  // Availability
  availRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  availLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  availLabel: { fontSize: 9, color: "rgba(199,210,254,0.55)", fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2 },
  availStatus: { fontSize: 14, fontWeight: "700" },

  // ── PROFILE CARD
  profileCard: {
    marginHorizontal: 16, marginTop: -14,
    backgroundColor: "#fff", borderRadius: 22, padding: 18,
    ...SHADOW_MD,
  },
  profileCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  profileCardLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  profileIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#eef2ff", justifyContent: "center", alignItems: "center" },
  profileCardTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  pctBadge: { backgroundColor: "#eef2ff", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  pctText: { fontSize: 13, fontWeight: "800", color: "#6366f1" },
  progressWrap: { marginBottom: 10 },
  profileHint: { fontSize: 12, color: "#64748b", marginBottom: 14, lineHeight: 17 },
  optimizeBtn: {
    backgroundColor: "#6366f1", borderRadius: 13, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  optimizeBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // ── SECTION HEADER
  sectionRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, marginTop: 24, marginBottom: 12,
  },
  sectionLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  fireWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#fff7ed", justifyContent: "center", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", letterSpacing: -0.3 },
  newBadge: { backgroundColor: "#eef2ff", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  newBadgeText: { fontSize: 12, fontWeight: "700", color: "#6366f1" },

  // Loading / Empty
  loadingBox: { padding: 40, alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: "#64748b" },
  emptyCard: {
    marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 22,
    padding: 32, alignItems: "center", gap: 10, ...SHADOW_SM,
  },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#eef2ff", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  emptySub: { fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 18 },
  emptyBtn: { backgroundColor: "#eef2ff", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 6 },
  emptyBtnText: { fontSize: 13, fontWeight: "700", color: "#6366f1" },

  // ── JOB CARD
  jobCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: "#fff", borderRadius: 20, padding: 16,
    ...Platform.select({
      ios: { shadowColor: "#1e1b4b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  jobTopRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 14, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  matchPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#f0fdf4", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: "#bbf7d0",
  },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#22c55e" },
  matchText: { fontSize: 12, fontWeight: "700", color: "#16a34a" },
  budgetText: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  jobInfoBlock: { gap: 9, marginBottom: 14 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  jobLocation: { fontSize: 14, fontWeight: "600", color: "#1e293b", flex: 1 },
  jobDesc: { fontSize: 13, color: "#475569", flex: 1, lineHeight: 19 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  skillChip: { backgroundColor: "#eef2ff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  skillText: { fontSize: 11, color: "#6366f1", fontWeight: "600", textTransform: "capitalize" },
  actionsRow: { flexDirection: "row", gap: 10 },
  skipBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    backgroundColor: "#f8fafc", paddingVertical: 12, borderRadius: 13,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  skipText: { fontSize: 13, fontWeight: "600", color: "#94a3b8" },
  bidBtn: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "#6366f1", paddingVertical: 12, borderRadius: 13,
  },
  bidText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // ── STATS
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginTop: 24 },
  statCard: {
    flex: 1, borderRadius: 18, overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 5 },
    }),
  },
  statGrad: { paddingVertical: 18, alignItems: "center", gap: 5 },
  statVal: { fontSize: 20, fontWeight: "900", color: "#fff" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

  // ── EARNINGS
  earningsCard: {
    marginHorizontal: 16, marginTop: 14, backgroundColor: "#fff",
    borderRadius: 22, padding: 18, ...SHADOW_SM,
  },
  earningsTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  earningsTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  earningsIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#eef2ff", justifyContent: "center", alignItems: "center" },
  earningsTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  seeAll: { fontSize: 13, fontWeight: "700", color: "#6366f1" },
  earningsGrid: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  earningBox: { flex: 1, alignItems: "center" },
  earningDivider: { width: 1, height: 44, backgroundColor: "#f1f5f9" },
  earningLabel: { fontSize: 12, color: "#94a3b8", fontWeight: "500", marginBottom: 4 },
  earningAmt: { fontSize: 22, fontWeight: "900", color: "#0f172a", marginBottom: 3 },
  earningTrend: { fontSize: 12, fontWeight: "700", color: "#10b981" },
  viewDetails: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingTop: 14, borderTopWidth: 1, borderTopColor: "#f1f5f9",
  },
  viewDetailsText: { fontSize: 13, fontWeight: "700", color: "#6366f1" },

  // ── PORTFOLIO
  portfolioCard: {
    marginHorizontal: 16, marginTop: 14, backgroundColor: "#fff",
    borderRadius: 20, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14, ...SHADOW_SM,
  },
  portfolioIconWrap: { width: 50, height: 50, borderRadius: 15, backgroundColor: "#eef2ff", justifyContent: "center", alignItems: "center" },
  portfolioTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 3 },
  portfolioSub: { fontSize: 12, color: "#64748b" },
});