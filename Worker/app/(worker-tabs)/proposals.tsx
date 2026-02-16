import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Types ---
interface Bid {
  _id: string;
  amount: number;
  message: string;
  status: "pending" | "accepted" | "rejected" | "hired" | "closed";
  createdAt: string;
  hiredAt?: string;
  job: {
    _id: string;
    serviceName?: string;
    description?: string;
    status?: string;
    budget?: number;
    location?: {
      coordinates: [number, number];
    };
    scheduledDate?: string;
    scheduledTime?: string;
    address?: string;
    fullAddress?: string;
  } | null;
}

export default function ProposalsScreen() {
  const router = useRouter();
  const [activeBids, setActiveBids] = useState<Bid[]>([]);
  const [hiredBids, setHiredBids] = useState<Bid[]>([]);
  const [closedBids, setClosedBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "hired" | "closed">("pending");
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.9:5000";

  // Fetch all bids on mount
  const fetchBids = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      const workerId = user._id || user.id;

      // Fetch active bids (pending)
      const activeResponse = await fetch(`${API_URL}/api/bids/active/worker/${workerId}`);
      const activeData = await activeResponse.json();
      
      // Fetch hired bids
      const hiredResponse = await fetch(`${API_URL}/api/bids/hired/worker/${workerId}`);
      const hiredData = await hiredResponse.json();

      // Fetch closed bids
      const closedResponse = await fetch(`${API_URL}/api/bids/closed/worker/${workerId}`);
      const closedData = await closedResponse.json();

      if (activeData.success) {
        setActiveBids(activeData.bids || []);
      }
      
      if (hiredData.success) {
        setHiredBids(hiredData.bids || []);
      }

      if (closedData.success) {
        setClosedBids(closedData.bids || []);
      }
      
    } catch (error) {
      console.error("Fetch Bids Error:", error);
      Alert.alert("Error", "Failed to load your proposals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBids();
    setRefreshing(false);
  };

  const handleWithdraw = async () => {
    if (!selectedBid) return;
    
    try {
      // In a real app, you'd call an API to withdraw the bid
      // For now, just remove from local state
      setActiveBids(prev => prev.filter(bid => bid._id !== selectedBid._id));
      setIsModalVisible(false);
      setSelectedBid(null);
      Alert.alert("Success", "Your proposal has been withdrawn");
    } catch (error) {
      Alert.alert("Error", "Failed to withdraw proposal");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return { bg: "#FEF3C7", text: "#92400E", icon: "clock" as const };
      case "hired": return { bg: "#DCFCE7", text: "#166534", icon: "check-circle" as const };
      case "closed": return { bg: "#FEE2E2", text: "#991B1B", icon: "x-circle" as const };
      default: return { bg: "#F3F4F6", text: "#374151", icon: "info" as const };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} min ago`;
    return "Just now";
  };

  const getDisplayBids = () => {
    switch (activeTab) {
      case "pending": return activeBids;
      case "hired": return hiredBids;
      case "closed": return closedBids;
      default: return activeBids;
    }
  };

  const displayBids = getDisplayBids();

  const renderBidCard = (bid: Bid) => {
    const statusStyle = getStatusStyle(bid.status);
    const job = bid.job;
    
    // If job is null, show a simplified card
    if (!job) {
      return (
        <View key={bid._id} style={[styles.card, styles.inactiveCard]}>
          <View style={styles.rowBetween}>
            <Text style={styles.jobTitle}>Job No Longer Available</Text>
            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Feather name={statusStyle.icon} size={12} color={statusStyle.text} />
              <Text style={[styles.badgeText, { color: statusStyle.text }]}> {bid.status}</Text>
            </View>
          </View>
          <Text style={styles.mutedText}>This job has been removed or completed by another worker.</Text>
          <Text style={styles.amountText}>Your Bid: ₹{bid.amount}</Text>
        </View>
      );
    }

    return (
      <View key={bid._id} style={[styles.card, bid.status === 'closed' && styles.inactiveCard]}>
        <View style={styles.rowBetween}>
          <Text style={styles.jobTitle}>{job.serviceName || "Service Request"}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Feather name={statusStyle.icon} size={12} color={statusStyle.text} />
            <Text style={[styles.badgeText, { color: statusStyle.text }]}> {bid.status}</Text>
          </View>
        </View>

        <Text style={styles.mutedText} numberOfLines={2}>
          {job.description || "Service request from client"}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Feather name="dollar-sign" size={14} color="#2563eb" />
            <Text style={styles.detailText}>Your Bid: ₹{bid.amount}</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="clock" size={14} color="#6b7280" />
            <Text style={styles.detailText}>{formatTimeAgo(bid.createdAt)}</Text>
          </View>
        </View>

        {bid.message && (
          <Text style={styles.messagePreview} numberOfLines={2}>"{bid.message}"</Text>
        )}

        <View style={styles.cardFooter}>
          {bid.status === "pending" && (
            <>
              <TouchableOpacity 
                style={styles.viewBtn} 
                onPress={() => router.push(`/job/${job._id}` as any)}
              >
                <Feather name="external-link" size={14} color="#2563eb" />
                <Text style={styles.viewBtnText}> View Job</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.withdrawBtn} 
                onPress={() => { 
                  setSelectedBid(bid); 
                  setIsModalVisible(true); 
                }}
              >
                <Feather name="trash-2" size={14} color="#ef4444" />
                <Text style={styles.withdrawText}> Withdraw</Text>
              </TouchableOpacity>
            </>
          )}

          {bid.status === "hired" && (
            <TouchableOpacity 
              style={styles.startBtn} 
              onPress={() => router.push("/(worker-tabs)/jobs" as any)}
            >
              <Feather name="briefcase" size={14} color="#fff" />
              <Text style={styles.startBtnText}> View in My Jobs</Text>
            </TouchableOpacity>
          )}

          {bid.status === "closed" && (
            <Text style={styles.closedText}>This job was assigned to another worker</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Proposals</Text>
          <Text style={styles.subtitle}>
            {activeBids.length} active • {hiredBids.length} hired
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.pendingCard]}>
            <Feather name="clock" size={20} color="#92400E" />
            <Text style={styles.statNumber}>{activeBids.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.hiredCard]}>
            <Feather name="check-circle" size={20} color="#166534" />
            <Text style={styles.statNumber}>{hiredBids.length}</Text>
            <Text style={styles.statLabel}>Hired</Text>
          </View>
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabBar}>
          {(["pending", "hired", "closed"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading your proposals...</Text>
          </View>
        ) : displayBids.length > 0 ? (
          displayBids.map(renderBidCard)
        ) : (
          <View style={styles.emptyState}>
            <Feather 
              name={activeTab === "pending" ? "file-plus" : activeTab === "hired" ? "check-circle" : "x-circle"} 
              size={48} 
              color="#9ca3af" 
            />
            <Text style={styles.emptyText}>
              {activeTab === "pending" && "No pending proposals"}
              {activeTab === "hired" && "No hired jobs yet"}
              {activeTab === "closed" && "No closed proposals"}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === "pending" && "Browse available jobs and submit proposals"}
              {activeTab === "hired" && "Jobs you're hired for will appear here"}
              {activeTab === "closed" && "Declined proposals will appear here"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Withdraw Confirmation Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Feather name="alert-triangle" size={40} color="#ef4444" />
            <Text style={styles.modalTitle}>Withdraw Proposal?</Text>
            <Text style={styles.modalSub}>
              Are you sure you want to withdraw your proposal for "{selectedBid?.job?.serviceName || 'this job'}"? 
              This cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancel} 
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDelete} onPress={handleWithdraw}>
                <Text style={styles.deleteText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, gap: 16 },
  header: { marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  pendingCard: {
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },
  hiredCard: {
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
  },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#0f172a", marginTop: 4 },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  tabBar: { 
    flexDirection: "row", 
    backgroundColor: "#e2e8f0", 
    borderRadius: 10, 
    padding: 4 
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { 
    backgroundColor: "#fff", 
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  activeTabText: { color: "#0f172a", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  inactiveCard: {
    opacity: 0.7,
    backgroundColor: "#f8fafc",
  },
  rowBetween: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  jobTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", flex: 1, marginRight: 8 },
  badge: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  badgeText: { fontSize: 11, fontWeight: "bold", textTransform: "capitalize" },
  mutedText: { fontSize: 13, color: "#6b7280", marginTop: 8 },
  amountText: { fontSize: 14, fontWeight: "600", color: "#2563eb", marginTop: 8 },
  detailsRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 13, color: "#374151" },
  messagePreview: { 
    fontSize: 13, 
    color: "#6b7280", 
    fontStyle: "italic", 
    marginTop: 12,
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 8,
  },
  cardFooter: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    borderTopWidth: 1, 
    borderTopColor: "#f1f5f9", 
    marginTop: 12, 
    paddingTop: 12 
  },
  viewBtn: { flexDirection: "row", alignItems: "center" },
  viewBtnText: { color: "#2563eb", fontSize: 14, fontWeight: "600" },
  withdrawBtn: { flexDirection: "row", alignItems: "center" },
  withdrawText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
  startBtn: { 
    backgroundColor: "#16a34a", 
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8,
    gap: 6,
  },
  startBtnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  closedText: { color: "#94a3b8", fontSize: 12, fontStyle: "italic" },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 14,
  },
  emptyState: { 
    padding: 40, 
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyText: { 
    marginTop: 16, 
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  emptySubtext: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    padding: 20 
  },
  modalContent: { 
    backgroundColor: "#fff", 
    borderRadius: 20, 
    padding: 24,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, marginTop: 12 },
  modalSub: { color: "#6b7280", marginBottom: 20, textAlign: "center" },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  modalCancel: { 
    flex: 1, 
    padding: 14, 
    alignItems: "center", 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: "#e2e8f0" 
  },
  cancelText: { color: "#0f172a", fontWeight: "600" },
  modalDelete: { 
    flex: 1, 
    padding: 14, 
    alignItems: "center", 
    borderRadius: 10, 
    backgroundColor: "#ef4444" 
  },
  deleteText: { color: "#fff", fontWeight: "600" },
});
