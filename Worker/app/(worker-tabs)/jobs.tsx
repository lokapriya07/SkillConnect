import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Clock,
  DollarSign,
  CheckCircle,
  Calendar,
  ArrowRight,
  X,
  Phone,
  User,
  Wrench,
  Scissors,
  Sparkles,
  Zap,
  Hammer,
  MapPin,
  Navigation,
  FileText,
  PlayCircle,
  Mic,
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
  isHiredJob?: boolean;
  hiredAmount?: number | null;
  workerStatus?: string;
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

// Avatar color palette based on first letter
const AVATAR_COLORS = [
  "#2563eb", "#16a34a", "#dc2626", "#9333ea",
  "#ea580c", "#0891b2", "#be185d", "#d97706",
];
const getAvatarColor = (name: string) => {
  const code = (name || "C").charCodeAt(0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

export default function ActiveJobsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedJob, setSelectedJob] = useState<DisplayJob | null>(null);
  const [assignedJobs, setAssignedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.9:5000";

  // --- Fetch Data from Backend ---
  const fetchJobs = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (!assignedJobs.length) setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const workerId = user._id || user.id;

      const response = await fetch(`${API_URL}/api/jobs/worker/${workerId}/assigned-jobs`);
      const data = await response.json();
      if (data.success) {
        setAssignedJobs(data.jobs);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + polling every 15 seconds
  useEffect(() => {
    fetchJobs();
    pollingRef.current = setInterval(() => fetchJobs(), 15000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchJobs]);

  const onRefresh = useCallback(() => fetchJobs(true), [fetchJobs]);

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
        Alert.alert("Success", "Job accepted! Status updated to Scheduled.");
        fetchJobs();
        setSelectedJob(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to accept job");
    } finally {
      setActionLoading(null);
    }
  };

  // --- Start Job Function ---
  const handleStartJob = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const response = await fetch(`${API_URL}/api/jobs/worker/${jobId}/start`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Service started! Status updated to In Progress.");
        fetchJobs();
        setSelectedJob(null);
      } else {
        Alert.alert("Error", data.error || "Failed to start job");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to start job");
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

  // --- Google Maps / Apple Maps Integration ---
  const openInMaps = (job: DisplayJob) => {
    const lat = job.latitude;
    const lng = job.longitude;
    const label = encodeURIComponent(job.address || job.title || "Service Location");

    let url: string;

    if (lat && lng) {
      // Use coordinates when available (most accurate)
      if (Platform.OS === "ios") {
        url = `maps:0,0?q=${lat},${lng}(${label})`;
      } else {
        url = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
      }
    } else if (job.address && job.address !== "Address not available") {
      // Fallback: search by address string
      const encodedAddress = encodeURIComponent(job.address);
      url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    } else {
      Alert.alert("No Location", "This job doesn't have a location yet.");
      return;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Final fallback: Google Maps web
          const encodedAddress = encodeURIComponent(job.address || "");
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
        }
      })
      .catch(() => Alert.alert("Error", "Could not open maps"));
  };

  // Build media URL safely
  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/^\//, "")}`;
  };

  // --- DYNAMIC DATA MAPPING ---
  const displayAssignedJobs = useMemo(() => {
    const toTitleCase = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());
    const getSmartName = (job: any) => {
      if (job.serviceName?.trim()) return toTitleCase(job.serviceName.trim());
      if (job.skillsRequired?.[0]) return toTitleCase(job.skillsRequired[0]);
      if (job.description?.trim()) return toTitleCase(job.description.trim().split(/\s+/).slice(0, 5).join(' '));
      return 'Service Booking';
    };

    return assignedJobs.map((job: any) => ({
      id: job._id,
      title: getSmartName(job),
      client: job.userName || "Customer",
      clientAvatar: (job.userName || "C").charAt(0).toUpperCase(),
      userName: job.userName,
      userPhone: job.userPhone,
      totalAmount: job.totalAmount || job.budget || 0,
      paidAmount: job.paidAmount || 0,
      scheduledDate: job.scheduledDate || "Date TBD",
      scheduledTime: job.scheduledTime || "Time TBD",
      status: job.status === "assigned" ? "upcoming" :
        job.status === "scheduled" ? "active" :
          job.status === "hired" || job.status === "booked" ? "upcoming" :
            job.status === "in_progress" ? "active" :
              job.status === "completed" ? "completed" : "upcoming",
      isHiredJob: job.isHiredJob || false,
      hiredAmount: job.hiredAmount || null,
      workerStatus: job.workerStatus || 'Assigned',
      progress: job.status === "in_progress" ? 50 : job.status === "completed" ? 100 : 0,
      address: job.address || "Address not available",
      latitude: job.location?.coordinates?.[1],
      longitude: job.location?.coordinates?.[0],
      milestones: [{ id: "m1", title: "Service Completion", amount: job.totalAmount || job.budget, status: job.status === 'completed' ? 'paid' as const : 'pending' as const }],
      originalJob: job,
    }));
  }, [assignedJobs]);

  const currentDisplayJobs = useMemo(() => {
    return displayAssignedJobs.filter(job => job.status === activeTab);
  }, [displayAssignedJobs, activeTab]);

  const getJobStatusBadge = (job: DisplayJob) => {
    const status = job.status;
    if (job.isHiredJob && status === "upcoming") {
      return (
        <View style={[styles.badge, styles.bgHiredSoft]}>
          <CheckCircle size={12} color="#059669" style={{ marginRight: 4 }} />
          <Text style={styles.textHired}>You're Hired!</Text>
        </View>
      );
    }
    if (status === "active") return <View style={[styles.badge, styles.bgPrimarySoft]}><Text style={styles.textPrimary}>In Progress</Text></View>;
    if (status === "upcoming" && job.originalJob?.status === "scheduled") return <View style={[styles.badge, styles.bgAmberSoft]}><Text style={styles.textAmber}>On the Way</Text></View>;
    if (status === "upcoming") return <View style={[styles.badge, styles.bgAmberSoft]}><Text style={styles.textAmber}>Assigned</Text></View>;
    if (status === "completed") return <View style={[styles.badge, styles.bgGreenSoft]}><CheckCircle size={12} color="#15803d" style={{ marginRight: 4 }} /><Text style={styles.textGreen}>Completed</Text></View>;
    return <View style={[styles.badge, styles.bgSecondary]}><Text style={styles.textSecondary}>{status}</Text></View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && !assignedJobs.length ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollPadding}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} tintColor="#2563eb" />
          }
        >
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
                const hasAddress = job.address && job.address !== "Address not available";
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
                      {getJobStatusBadge(job)}
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
                        <MapPin size={14} color="#EA4335" />
                        <Text style={styles.metaLabelText} numberOfLines={1}>
                          {hasAddress ? job.address.split(',')[0] : "No address"}
                        </Text>
                        {hasAddress && (
                          <TouchableOpacity onPress={() => openInMaps(job)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Navigation size={14} color="#4285F4" />
                          </TouchableOpacity>
                        )}
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

      {/* ===================== DETAILS MODAL ===================== */}
      <Modal visible={!!selectedJob} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>{selectedJob?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedJob(null)} style={styles.closeBtn}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>

              {/* ── Client Information ── */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Client Information</Text>
                <View style={styles.clientInfoRow}>
                  {/* Colored initials avatar */}
                  <View style={[
                    styles.clientAvatarLarge,
                    { backgroundColor: getAvatarColor(selectedJob?.userName || "C") }
                  ]}>
                    <Text style={styles.clientAvatarInitial}>
                      {(selectedJob?.userName || "C").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientNameLarge}>
                      {selectedJob?.userName || "Customer"}
                    </Text>
                    {selectedJob?.userPhone ? (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${selectedJob.userPhone}`)}
                        style={styles.phoneRow}
                      >
                        <Phone size={13} color="#2563eb" />
                        <Text style={styles.clientPhone}>{selectedJob.userPhone}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* ── Service Address ── */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Service Address</Text>
                {selectedJob?.address && selectedJob.address !== "Address not available" ? (
                  <TouchableOpacity
                    style={styles.addressCard}
                    onPress={() => selectedJob && openInMaps(selectedJob)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addressIconWrap}>
                      <MapPin size={18} color="#EA4335" />
                    </View>
                    <Text style={styles.addressText}>{selectedJob.address}</Text>
                    <View style={styles.navigateBtn}>
                      <Navigation size={16} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.addressCard, { opacity: 0.5 }]}>
                    <MapPin size={18} color="#94a3b8" />
                    <Text style={[styles.addressText, { color: "#94a3b8", marginLeft: 8 }]}>
                      Address not available
                    </Text>
                  </View>
                )}
              </View>

              {/* ── Problem Description ── */}
              {selectedJob?.originalJob?.description && (
                <View style={styles.infoSection}>
                  <View style={styles.sectionTitleRow}>
                    <FileText size={15} color="#2563eb" />
                    <Text style={styles.sectionTitle}>Problem Description</Text>
                  </View>
                  <Text style={styles.descriptionText}>
                    {selectedJob.originalJob.description}
                  </Text>
                </View>
              )}

              {/* ── Uploaded Media ── */}
              {(selectedJob?.originalJob?.imagePath ||
                selectedJob?.originalJob?.videoPath ||
                selectedJob?.originalJob?.audioPath) && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Uploaded Media</Text>

                    {/* Image Thumbnail */}
                    {selectedJob.originalJob.imagePath && (() => {
                      const imgUrl = getMediaUrl(selectedJob.originalJob.imagePath);
                      return imgUrl ? (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(imgUrl)}
                          style={styles.mediaThumbnailWrap}
                          activeOpacity={0.85}
                        >
                          <Image
                            source={{ uri: imgUrl }}
                            style={styles.mediaThumbnail}
                            resizeMode="cover"
                          />
                          <View style={styles.mediaOverlayTag}>
                            <Ionicons name="image" size={12} color="#fff" />
                            <Text style={styles.mediaOverlayText}>Tap to enlarge</Text>
                          </View>
                        </TouchableOpacity>
                      ) : null;
                    })()}

                    {/* Video Link */}
                    {selectedJob.originalJob.videoPath && (() => {
                      const vidUrl = getMediaUrl(selectedJob.originalJob.videoPath);
                      return vidUrl ? (
                        <TouchableOpacity
                          style={styles.mediaLinkCard}
                          onPress={() => Linking.openURL(vidUrl)}
                        >
                          <View style={[styles.mediaLinkIcon, { backgroundColor: "#eff6ff" }]}>
                            <PlayCircle size={20} color="#2563eb" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.mediaLinkTitle}>Video Recording</Text>
                            <Text style={styles.mediaLinkSub}>Tap to play video</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </TouchableOpacity>
                      ) : null;
                    })()}

                    {/* Audio Link */}
                    {selectedJob.originalJob.audioPath && (() => {
                      const audUrl = getMediaUrl(selectedJob.originalJob.audioPath);
                      return audUrl ? (
                        <TouchableOpacity
                          style={styles.mediaLinkCard}
                          onPress={() => Linking.openURL(audUrl)}
                        >
                          <View style={[styles.mediaLinkIcon, { backgroundColor: "#f0fdf4" }]}>
                            <Mic size={20} color="#16a34a" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.mediaLinkTitle}>Audio Recording</Text>
                            <Text style={styles.mediaLinkSub}>Tap to play audio</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </TouchableOpacity>
                      ) : null;
                    })()}
                  </View>
                )}

              {/* ── Bid Rate & Payment ── */}
              <View style={styles.paymentSection}>
                <View style={styles.paymentItem}>
                  <DollarSign size={14} color="#16a34a" />
                  <Text style={styles.paymentLabel}>Your Bid Rate</Text>
                  <Text style={[styles.paymentValue, { color: '#16a34a' }]}>
                    ₹{selectedJob?.hiredAmount || selectedJob?.totalAmount || 0}
                  </Text>
                </View>
                <View style={styles.paymentDivider} />
                <View style={styles.paymentItem}>
                  <CheckCircle size={14} color={selectedJob?.status === 'completed' ? '#16a34a' : '#94a3b8'} />
                  <Text style={styles.paymentLabel}>Payment</Text>
                  <Text style={[styles.paymentValue, { color: selectedJob?.status === 'completed' ? '#16a34a' : '#94a3b8' }]}>
                    {selectedJob?.status === 'completed'
                      ? '₹' + (selectedJob?.hiredAmount || selectedJob?.totalAmount)
                      : 'Pending'}
                  </Text>
                </View>
              </View>

            </ScrollView>

            {/* Modal Footer Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelectedJob(null)}>
                <Text style={styles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>

              {/* Accept Job - assigned status */}
              {selectedJob?.status === "upcoming" && selectedJob?.originalJob?.status !== "scheduled" && (
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

              {/* Start Service - scheduled status */}
              {selectedJob?.originalJob?.status === "scheduled" && (
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: '#db2777' }]}
                  onPress={() => handleStartJob(selectedJob.id)}
                  disabled={!!actionLoading}
                >
                  {actionLoading === selectedJob.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Zap size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.primaryBtnText}>Start Service</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Mark Complete - in_progress status */}
              {selectedJob?.status === "active" && selectedJob?.originalJob?.status === "in_progress" && (
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
  // ── Layout ──
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollPadding: { padding: 16, paddingBottom: 100 },

  // ── Header ──
  headerContainer: { marginBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: "bold", color: "#0f172a" },
  pageSubtitle: { fontSize: 16, color: "#64748b", marginTop: 4 },

  // ── Stats ──
  statsGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 12, borderColor: "#e2e8f0", flexDirection: "row", alignItems: "center", gap: 12, elevation: 2 },
  statIconContainer: { padding: 10, borderRadius: 10 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  statLabel: { fontSize: 12, color: "#64748b" },

  // ── Tabs ──
  tabsContainer: { flexDirection: "row", backgroundColor: "#e2e8f0", padding: 4, borderRadius: 10, marginVertical: 24 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabButtonActive: { backgroundColor: "#fff" },
  tabButtonText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  tabButtonTextActive: { color: "#0f172a", fontWeight: "600" },

  // ── Job List ──
  jobListContainer: { paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0", elevation: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1, marginLeft: 12 },
  jobTitleText: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  clientNameText: { fontSize: 14, color: "#64748b" },
  serviceInfoBanner: { flexDirection: "row", backgroundColor: "#f8fafc", borderRadius: 8, padding: 8, marginBottom: 12, gap: 16 },
  serviceInfoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  serviceInfoText: { fontSize: 12, color: "#64748b" },
  metaDataRow: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaValueText: { fontSize: 13, color: "#0f172a", fontWeight: "500" },
  metaLabelText: { fontSize: 13, color: "#64748b", maxWidth: 140 },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12 },
  leftActions: { flexDirection: "row", gap: 4 },
  ghostBtn: { flexDirection: "row", alignItems: "center", padding: 8, borderRadius: 6 },
  ghostBtnText: { color: "#64748b", fontSize: 13, fontWeight: "500" },
  outlineBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  outlineBtnText: { fontSize: 13, fontWeight: "600" },

  // ── Badges ──
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  bgPrimarySoft: { backgroundColor: "#eff6ff" },
  textPrimary: { color: "#2563eb", fontSize: 12, fontWeight: "600" },
  bgAmberSoft: { backgroundColor: "#fffbeb" },
  textAmber: { color: "#b45309", fontSize: 12, fontWeight: "600" },
  bgGreenSoft: { backgroundColor: "#f0fdf4" },
  textGreen: { color: "#15803d", fontSize: 12, fontWeight: "600" },
  bgHiredSoft: { backgroundColor: "#d1fae5" },
  textHired: { color: "#059669", fontSize: 12, fontWeight: "700" },
  bgSecondary: { backgroundColor: "#f1f5f9" },
  textSecondary: { color: "#475569", fontSize: 12, fontWeight: "600" },

  // ── Empty ──
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a", marginTop: 16 },

  // ── Modal ──
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 8, maxHeight: height * 0.92 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#0f172a", flex: 1, marginRight: 12 },
  closeBtn: { padding: 4, backgroundColor: "#f1f5f9", borderRadius: 8 },
  modalBody: { marginBottom: 8 },

  // ── Modal Sections ──
  infoSection: { marginBottom: 20 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },

  // ── Client Row ──
  clientInfoRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#f8fafc", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  clientAvatarLarge: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  clientAvatarInitial: { fontSize: 22, fontWeight: "700", color: "#fff" },
  clientNameLarge: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  clientPhone: { fontSize: 14, color: "#2563eb", fontWeight: "500" },

  // ── Address ──
  addressCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  addressIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center" },
  addressText: { fontSize: 14, color: "#0f172a", flex: 1, lineHeight: 20 },
  navigateBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },

  // ── Description ──
  descriptionText: { fontSize: 14, color: "#374151", lineHeight: 22, backgroundColor: "#f8fafc", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },

  // ── Media ──
  mediaThumbnailWrap: { borderRadius: 12, overflow: "hidden", marginBottom: 10, position: "relative" },
  mediaThumbnail: { width: "100%", height: 140, borderRadius: 12 },
  mediaOverlayTag: { position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 },
  mediaOverlayText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  mediaLinkCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#f8fafc", padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  mediaLinkIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  mediaLinkTitle: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  mediaLinkSub: { fontSize: 12, color: "#64748b", marginTop: 2 },

  // ── Payment ──
  paymentSection: { flexDirection: "row", backgroundColor: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  paymentItem: { flex: 1, alignItems: "center", gap: 4 },
  paymentDivider: { width: 1, backgroundColor: "#e2e8f0", marginHorizontal: 8 },
  paymentLabel: { fontSize: 12, color: "#64748b", fontWeight: "500" },
  paymentValue: { fontSize: 18, fontWeight: "700", color: "#0f172a" },

  // ── Footer ──
  modalFooter: { flexDirection: "row", gap: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 14, paddingBottom: 8 },
  secondaryBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" },
  secondaryBtnText: { fontWeight: "600", color: "#0f172a" },
  primaryBtn: { flex: 2, padding: 12, borderRadius: 10, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
});