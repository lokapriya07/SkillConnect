import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle,
  Calendar,
  AlertTriangle,
  ArrowRight,
  X,
  Phone,
  User,
  Wrench,
  Scissors,
  Sparkles,
  Zap,
  Hammer,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height } = Dimensions.get("window");

// --- Interfaces ---
interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: "pending" | "in-progress" | "completed" | "paid";
}

interface DisplayJob {
  id: string;
  title: string;
  client: string;
  clientAvatar: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  progress: number;
  isOnline?: boolean;
  unreadMessages?: number;
  milestones: Milestone[];
  isAssignedJob?: boolean;
  userName?: string;
  userPhone?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  paymentMethod?: string;
  serviceDetails?: any;
  originalJob?: any;
}

// --- Dynamic Icon & Color Mappers ---
const getServiceIcon = (serviceName: string) => {
  const name = serviceName?.toLowerCase() || "";
  if (name.includes("haircut") || name.includes("salon") || name.includes("beauty")) return Scissors;
  if (name.includes("cleaning") || name.includes("kitchen") || name.includes("bathroom") || name.includes("sofa")) return Sparkles;
  if (name.includes("plumbing") || name.includes("tap") || name.includes("drain")) return Wrench;
  if (name.includes("electrical") || name.includes("wiring") || name.includes("power")) return Zap;
  if (name.includes("carpentry") || name.includes("wood") || name.includes("furniture")) return Hammer;
  return Wrench;
};

const getServiceColor = (serviceName: string) => {
  const name = serviceName?.toLowerCase() || "";
  if (name.includes("haircut") || name.includes("salon") || name.includes("beauty")) return "#EC4899";
  if (name.includes("cleaning") || name.includes("kitchen") || name.includes("bathroom") || name.includes("sofa")) return "#007BFF";
  if (name.includes("plumbing") || name.includes("tap") || name.includes("drain")) return "#46A3FF";
  if (name.includes("electrical") || name.includes("wiring") || name.includes("power")) return "#FFB800";
  if (name.includes("carpentry") || name.includes("wood") || name.includes("furniture")) return "#8B4513";
  return "#2563eb";
};

export default function ActiveJobsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedJob, setSelectedJob] = useState<DisplayJob | null>(null);
  const [assignedJobs, setAssignedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.9:5000";

  // --- Fetch Data from Backend ---
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const workerId = user.workerProfileId || user._id;

      const response = await fetch(`${API_URL}/api/jobs/worker/${workerId}/assigned-jobs`);
      const data = await response.json();
      if (data.success) {
        setAssignedJobs(data.jobs);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // --- Accept Job Function ---
  const handleAcceptJob = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const response = await fetch(`${API_URL}/api/jobs/worker/${jobId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Job accepted and moved to In Progress.");
        fetchJobs(); 
        setSelectedJob(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to accept job");
    } finally {
      setActionLoading(null);
    }
  };

  // --- Complete Job Function ---
  const handleCompleteJob = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const response = await fetch(`${API_URL}/api/jobs/worker/${jobId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'completed' })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Great Job!", "Service marked as completed.");
        fetchJobs(); 
        setSelectedJob(null);
      } else {
        Alert.alert("Error", data.error || "Failed to complete job");
      }
    } catch (error) {
      Alert.alert("Error", "Check your backend connection and complete route.");
    } finally {
      setActionLoading(null);
    }
  };

  // --- Google Maps Integration ---
  const openGoogleMaps = (job: DisplayJob) => {
    const lat = job.latitude;
    const lng = job.longitude;
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${job.title})`,
    });
    if (url) Linking.openURL(url);
  };

  // --- DYNAMIC DATA MAPPING ---
  const displayAssignedJobs = useMemo(() => {
    return assignedJobs.map((job: any) => ({
      id: job._id,
      title: job.serviceName || "Service Job",
      client: job.userName || "Customer",
      clientAvatar: (job.userName || "C").charAt(0).toUpperCase(),
      userName: job.userName,
      userPhone: job.userPhone,
      totalAmount: job.totalAmount || job.budget || 0,
      paidAmount: job.paidAmount || 0,
      scheduledDate: job.scheduledDate || "Date TBD",
      scheduledTime: job.scheduledTime || "Time TBD",
      // Map statuses correctly for the tabs
      status: job.status === "assigned" ? "upcoming" : 
              job.status === "in_progress" ? "active" : 
              job.status === "completed" ? "completed" : "upcoming",
      progress: job.status === "in_progress" ? 50 : job.status === "completed" ? 100 : 0,
      address: job.fullAddress || job.address || "Address not available",
      latitude: job.location?.coordinates?.[1],
      longitude: job.location?.coordinates?.[0],
      milestones: [{ id: "m1", title: "Service Completion", amount: job.totalAmount || job.budget, status: job.status === 'completed' ? 'paid' : 'pending' }],
      originalJob: job,
    }));
  }, [assignedJobs]);

  const currentDisplayJobs = useMemo(() => {
    return displayAssignedJobs.filter(job => job.status === activeTab);
  }, [displayAssignedJobs, activeTab]);

  const getJobStatusBadge = (status: string) => {
    if (status === "active") return <View style={[styles.badge, styles.bgPrimarySoft]}><Text style={styles.textPrimary}>In Progress</Text></View>;
    if (status === "upcoming") return <View style={[styles.badge, styles.bgAmberSoft]}><Text style={styles.textAmber}>Assigned</Text></View>;
    if (status === "completed") return <View style={[styles.badge, styles.bgGreenSoft]}><CheckCircle size={12} color="#15803d" style={{ marginRight: 4 }} /><Text style={styles.textGreen}>Completed</Text></View>;
    return <View style={[styles.badge, styles.bgSecondary]}><Text style={styles.textSecondary}>{status}</Text></View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && !assignedJobs.length ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollPadding}>
          <View style={styles.headerContainer}>
            <Text style={styles.pageTitle}>My Jobs</Text>
            <Text style={styles.pageSubtitle}>Track and manage your service bookings</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, styles.bgPrimarySoft]}>
                <Clock size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.statNumber}>{displayAssignedJobs.filter(j => j.status === 'active').length}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, styles.bgGreenSoft]}>
                <CheckCircle size={20} color="#15803d" />
              </View>
              <View>
                <Text style={styles.statNumber}>{displayAssignedJobs.filter(j => j.status === 'completed').length}</Text>
                <Text style={styles.statLabel}>Done</Text>
              </View>
            </View>
          </View>

          <View style={styles.tabsContainer}>
            {[
              { id: "upcoming", label: "Upcoming" },
              { id: "active", label: "In Progress" },
              { id: "completed", label: "Completed" }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
              >
                <Text style={[styles.tabButtonText, activeTab === tab.id && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.jobListContainer}>
            {currentDisplayJobs.length > 0 ? (
              currentDisplayJobs.map((job) => {
                const ServiceIcon = getServiceIcon(job.title);
                const serviceColor = getServiceColor(job.title);
                return (
                  <View key={job.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.avatarCircle, { backgroundColor: serviceColor + '20' }]}>
                        <ServiceIcon size={20} color={serviceColor} />
                      </View>
                      <View style={styles.headerText}>
                        <Text style={styles.jobTitleText} numberOfLines={1}>{job.title}</Text>
                        <Text style={styles.clientNameText}>{job.client}</Text>
                      </View>
                      {getJobStatusBadge(job.status)}
                    </View>

                    <View style={styles.serviceInfoBanner}>
                      <View style={styles.serviceInfoItem}>
                        <Calendar size={14} color="#64748b" />
                        <Text style={styles.serviceInfoText}>{job.scheduledDate}</Text>
                      </View>
                      <View style={styles.serviceInfoItem}>
                        <Clock size={14} color="#64748b" />
                        <Text style={styles.serviceInfoText}>{job.scheduledTime}</Text>
                      </View>
                    </View>

                    <View style={styles.metaDataRow}>
                      <View style={styles.metaItem}>
                        <DollarSign size={14} color={serviceColor} />
                        <Text style={styles.metaValueText}>₹{job.totalAmount}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="location-sharp" size={14} color="#EA4335" />
                        <Text style={styles.metaLabelText} numberOfLines={1}>{job.address.split(',')[0]}</Text>
                        <TouchableOpacity onPress={() => openGoogleMaps(job)}>
                          <Ionicons name="navigate" size={14} color="#4285F4" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <View style={styles.leftActions}>
                        <TouchableOpacity style={styles.ghostBtn} onPress={() => Linking.openURL(`tel:${job.userPhone}`)}>
                          <Phone size={16} color="#64748b" style={{ marginRight: 4 }} />
                          <Text style={styles.ghostBtnText}>Call</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={[styles.outlineBtn, { borderColor: serviceColor }]}
                        onPress={() => setSelectedJob(job)}
                      >
                        <Text style={[styles.outlineBtnText, { color: serviceColor }]}>Details</Text>
                        <ArrowRight size={14} color={serviceColor} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Clock size={48} color="#94a3b8" />
                <Text style={styles.emptyTitle}>No {activeTab} jobs</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Details Modal */}
      <Modal visible={!!selectedJob} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedJob?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedJob(null)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Client Information</Text>
                <View style={styles.clientInfoRow}>
                  <View style={[styles.clientAvatarLarge, { backgroundColor: '#e2e8f0' }]}>
                    <User size={24} color="#64748b" />
                  </View>
                  <View>
                    <Text style={styles.clientNameLarge}>{selectedJob?.userName}</Text>
                    <Text style={styles.clientPhone}>{selectedJob?.userPhone}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Service Address</Text>
                <View style={styles.addressRow}>
                  <Ionicons name="location-sharp" size={18} color="#EA4335" />
                  <Text style={styles.addressText}>{selectedJob?.address}</Text>
                </View>
              </View>

              <View style={styles.paymentRow}>
                <View style={styles.paymentItem}>
                  <Text style={styles.paymentLabel}>Earnings</Text>
                  <Text style={styles.paymentValue}>₹{selectedJob?.totalAmount}</Text>
                </View>
                <View style={styles.paymentItem}>
                  <Text style={styles.paymentLabel}>Paid Status</Text>
                  <Text style={[styles.paymentValue, { color: selectedJob?.status === 'completed' ? '#16a34a' : '#64748b' }]}>
                    {selectedJob?.status === 'completed' ? '₹' + selectedJob?.totalAmount : 'Pending'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelectedJob(null)}>
                <Text style={styles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>
              
              {/* Acceptance Button */}
              {selectedJob?.status === "upcoming" && (
                <TouchableOpacity 
                  style={[styles.primaryBtn, { backgroundColor: '#16a34a' }]}
                  onPress={() => handleAcceptJob(selectedJob.id)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === selectedJob.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <CheckCircle size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.primaryBtnText}>Accept Job</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Completion Button */}
              {selectedJob?.status === "active" && (
                <TouchableOpacity 
                  style={[styles.primaryBtn, { backgroundColor: '#2563eb' }]}
                  onPress={() => handleCompleteJob(selectedJob.id)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === selectedJob.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <CheckCircle size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.primaryBtnText}>Mark Completed</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollPadding: { padding: 16, paddingBottom: 100 },
  headerContainer: { marginBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: "bold", color: "#0f172a" },
  pageSubtitle: { fontSize: 16, color: "#64748b", marginTop: 4 },
  statsGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 12, borderColor: "#e2e8f0", flexDirection: "row", alignItems: "center", gap: 12, elevation: 2 },
  statIconContainer: { padding: 10, borderRadius: 10 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  statLabel: { fontSize: 12, color: "#64748b" },
  tabsContainer: { flexDirection: "row", backgroundColor: "#e2e8f0", padding: 4, borderRadius: 10, marginVertical: 24 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabButtonActive: { backgroundColor: "#fff" },
  tabButtonText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  tabButtonTextActive: { color: "#0f172a", fontWeight: "600" },
  jobListContainer: { paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1, marginLeft: 12 },
  jobTitleText: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  clientNameText: { fontSize: 14, color: "#64748b" },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  bgPrimarySoft: { backgroundColor: "#eff6ff" },
  textPrimary: { color: "#2563eb", fontSize: 12, fontWeight: "600" },
  bgAmberSoft: { backgroundColor: "#fffbeb" },
  textAmber: { color: "#b45309", fontSize: 12, fontWeight: "600" },
  bgGreenSoft: { backgroundColor: "#f0fdf4" },
  textGreen: { color: "#15803d", fontSize: 12, fontWeight: "600" },
  bgSecondary: { backgroundColor: "#f1f5f9" },
  textSecondary: { color: "#475569", fontSize: 12, fontWeight: "600" },
  serviceInfoBanner: { flexDirection: "row", backgroundColor: "#f8fafc", borderRadius: 8, padding: 8, marginBottom: 12, gap: 16 },
  serviceInfoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  serviceInfoText: { fontSize: 12, color: "#64748b" },
  metaDataRow: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaValueText: { fontSize: 13, color: "#0f172a", fontWeight: "500" },
  metaLabelText: { fontSize: 13, color: "#64748b", maxWidth: 150 },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12 },
  leftActions: { flexDirection: "row", gap: 4 },
  ghostBtn: { flexDirection: "row", alignItems: "center", padding: 8, borderRadius: 6 },
  ghostBtnText: { color: "#64748b", fontSize: 13, fontWeight: "500" },
  outlineBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  outlineBtnText: { fontSize: 13, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a", marginTop: 16 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: height * 0.85 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#0f172a", flex: 1 },
  modalBody: { marginBottom: 16 },
  infoSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: 12 },
  clientInfoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  clientAvatarLarge: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  clientNameLarge: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  clientPhone: { fontSize: 14, color: "#64748b" },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addressText: { fontSize: 14, color: "#0f172a", flex: 1 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between" },
  paymentItem: { alignItems: "center" },
  paymentLabel: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  paymentValue: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  modalFooter: { flexDirection: "row", gap: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  secondaryBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" },
  secondaryBtnText: { fontWeight: "600", color: "#0f172a" },
  primaryBtn: { flex: 2, padding: 12, borderRadius: 10, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
});