import React, { useState, useMemo } from "react";
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
} from "react-native";
import {
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle,
  Calendar,
  Upload,
  AlertTriangle,
  ArrowRight,
  X,
} from "lucide-react-native";

const { height } = Dimensions.get("window");

// --- Interfaces ---
interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: "pending" | "in-progress" | "completed" | "paid";
}

interface ActiveJob {
  id: string;
  title: string;
  client: string;
  clientAvatar: string;
  totalAmount: number;
  paidAmount: number;
  startDate: string;
  dueDate: string;
  status: "in-progress" | "upcoming" | "completed" | "disputed";
  milestones: Milestone[];
  progress: number;
  unreadMessages: number;
  isOnline?: boolean;
}

// --- Exact Mock Data ---
const activeJobs: ActiveJob[] = [
  {
    id: "1",
    title: "Electrical Panel Upgrade",
    client: "Mike Johnson",
    clientAvatar: "M",
    totalAmount: 2800,
    paidAmount: 1000,
    startDate: "Dec 5, 2024",
    dueDate: "Dec 12, 2024",
    status: "in-progress",
    progress: 45,
    unreadMessages: 2,
    isOnline: true,
    milestones: [
      { id: "m1", title: "Initial inspection & planning", amount: 500, status: "completed" },
      { id: "m2", title: "Permit acquisition", amount: 500, status: "completed" },
      { id: "m3", title: "Panel installation", amount: 1200, status: "in-progress" },
      { id: "m4", title: "Final inspection & cleanup", amount: 600, status: "pending" },
    ],
  },
  {
    id: "2",
    title: "Kitchen Sink Installation",
    client: "Sarah Wilson",
    clientAvatar: "S",
    totalAmount: 200,
    paidAmount: 0,
    startDate: "Dec 10, 2024",
    dueDate: "Dec 11, 2024",
    status: "upcoming",
    progress: 0,
    unreadMessages: 0,
    isOnline: false,
    milestones: [{ id: "m1", title: "Complete installation", amount: 200, status: "pending" }],
  },
];

const completedJobs: ActiveJob[] = [
  {
    id: "3",
    title: "Bathroom Plumbing Repair",
    client: "John Smith",
    clientAvatar: "J",
    totalAmount: 350,
    paidAmount: 350,
    startDate: "Nov 28, 2024",
    dueDate: "Nov 30, 2024",
    status: "completed",
    progress: 100,
    unreadMessages: 0,
    isOnline: false,
    milestones: [{ id: "m1", title: "Full repair", amount: 350, status: "paid" }],
  },
];

const disputedJobs: ActiveJob[] = [
  {
    id: "4",
    title: "HVAC Maintenance",
    client: "ABC Properties",
    clientAvatar: "A",
    totalAmount: 150,
    paidAmount: 75,
    startDate: "Nov 20, 2024",
    dueDate: "Nov 21, 2024",
    status: "disputed",
    progress: 100,
    unreadMessages: 5,
    isOnline: true,
    milestones: [{ id: "m1", title: "Maintenance service", amount: 150, status: "pending" }],
  },
];

export default function ActiveJobsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedJob, setSelectedJob] = useState<ActiveJob | null>(null);

  // --- Status Rendering Logic ---
  const getJobStatusBadge = (status: ActiveJob["status"]) => {
    switch (status) {
      case "in-progress":
        return <View style={[styles.badge, styles.bgPrimarySoft]}><Text style={styles.textPrimary}>In Progress</Text></View>;
      case "upcoming":
        return <View style={[styles.badge, styles.bgAmberSoft]}><Text style={styles.textAmber}>Upcoming</Text></View>;
      case "completed":
        return <View style={[styles.badge, styles.bgGreenSoft]}><CheckCircle size={12} color="#15803d" style={{ marginRight: 4 }} /><Text style={styles.textGreen}>Completed</Text></View>;
      case "disputed":
        return <View style={[styles.badge, styles.bgRedSoft]}><AlertTriangle size={12} color="#b91c1c" style={{ marginRight: 4 }} /><Text style={styles.textRed}>Disputed</Text></View>;
    }
  };

  const getMilestoneStatusBadge = (status: Milestone["status"]) => {
    switch (status) {
      case "pending":
        return <View style={[styles.badge, styles.bgSecondary]}><Text style={styles.textSecondary}>Pending</Text></View>;
      case "in-progress":
        return <View style={[styles.badge, styles.bgPrimarySoft]}><Text style={styles.textPrimary}>In Progress</Text></View>;
      case "completed":
        return <View style={[styles.badge, styles.bgGreenSoft]}><CheckCircle size={12} color="#15803d" style={{ marginRight: 4 }} /><Text style={styles.textGreen}>Complete</Text></View>;
      case "paid":
        return <View style={[styles.badge, styles.bgGreenSoft]}><DollarSign size={12} color="#15803d" style={{ marginRight: 4 }} /><Text style={styles.textGreen}>Paid</Text></View>;
    }
  };

  // --- Filter Logic ---
  const currentDisplayJobs = useMemo(() => {
    if (activeTab === "active") return activeJobs.filter(j => j.status === "in-progress");
    if (activeTab === "upcoming") return activeJobs.filter(j => j.status === "upcoming");
    if (activeTab === "completed") return completedJobs;
    if (activeTab === "disputes") return disputedJobs;
    return [];
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {/* Page Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>Active Jobs</Text>
          <Text style={styles.pageSubtitle}>Track and manage your current jobs</Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.bgPrimarySoft]}>
              <Clock size={20} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.statNumber}>{activeJobs.filter(j => j.status === "in-progress").length}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.bgAmberSoft]}>
              <Calendar size={20} color="#b45309" />
            </View>
            <View>
              <Text style={styles.statNumber}>{activeJobs.filter(j => j.status === "upcoming").length}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statsGrid, { marginTop: 12 }]}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.bgGreenSoft]}>
              <CheckCircle size={20} color="#15803d" />
            </View>
            <View>
              <Text style={styles.statNumber}>{completedJobs.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.bgRedSoft]}>
              <AlertTriangle size={20} color="#b91c1c" />
            </View>
            <View>
              <Text style={styles.statNumber}>{disputedJobs.length}</Text>
              <Text style={styles.statLabel}>Disputes</Text>
            </View>
          </View>
        </View>

        {/* Tabs Selection */}
        <View style={styles.tabsContainer}>
          {["active", "upcoming", "completed", "disputes"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                {tab === "active" ? "In Progress" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Job List */}
        <View style={styles.jobListContainer}>
          {currentDisplayJobs.length > 0 ? (
            currentDisplayJobs.map((job) => (
              <View key={job.id} style={[styles.card, job.status === "disputed" && styles.cardDisputed]}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitial}>{job.clientAvatar}</Text>
                    </View>
                    {job.isOnline && <View style={styles.onlineIndicator} />}
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.jobTitleText} numberOfLines={1}>{job.title}</Text>
                    <Text style={styles.clientNameText}>{job.client}</Text>
                  </View>
                  {getJobStatusBadge(job.status)}
                </View>

                <View style={styles.progressBox}>
                  <View style={styles.progressTextRow}>
                    <Text style={styles.progressLabelText}>Progress</Text>
                    <Text style={styles.progressPercentText}>{job.progress}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${job.progress}%` }]} />
                  </View>
                </View>

                <View style={styles.metaDataRow}>
                  <View style={styles.metaItem}>
                    <DollarSign size={14} color="#2563eb" />
                    <Text style={styles.metaValueText}>${job.paidAmount} / ${job.totalAmount}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color="#64748b" />
                    <Text style={styles.metaLabelText}>Due: {job.dueDate}</Text>
                  </View>
                  {job.unreadMessages > 0 && (
                    <View style={styles.metaItem}>
                      <MessageSquare size={14} color="#2563eb" />
                      <Text style={styles.unreadText}>{job.unreadMessages} new</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  <View style={styles.leftActions}>
                    <TouchableOpacity style={styles.ghostBtn}>
                      <MessageSquare size={16} color="#64748b" style={{ marginRight: 4 }} />
                      <Text style={styles.ghostBtnText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ghostBtn}>
                      <Upload size={16} color="#64748b" style={{ marginRight: 4 }} />
                      <Text style={styles.ghostBtnText}>Files</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={() => setSelectedJob(job)}
                  >
                    <Text style={styles.outlineBtnText}>View Details</Text>
                    <ArrowRight size={14} color="#0f172a" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Clock size={48} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptySubtitle}>There are no jobs in this category currently.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal: Job Details */}
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
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Client</Text>
                <Text style={styles.modalInfoValue}>{selectedJob?.client}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Total Amount</Text>
                <Text style={styles.modalInfoValue}>${selectedJob?.totalAmount}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Amount Paid</Text>
                <Text style={[styles.modalInfoValue, { color: '#16a34a' }]}>${selectedJob?.paidAmount}</Text>
              </View>

              <View style={styles.separator} />

              <Text style={styles.milestoneHeading}>Milestones</Text>
              {selectedJob?.milestones.map((m, idx) => (
                <View key={m.id} style={styles.milestoneCard}>
                  <View style={styles.milestoneLeft}>
                    <Text style={styles.milestoneNumber}>{idx + 1}</Text>
                    <View>
                      <Text style={styles.milestoneTitleText}>{m.title}</Text>
                      <Text style={styles.milestoneAmountText}>${m.amount}</Text>
                    </View>
                  </View>
                  {getMilestoneStatusBadge(m.status)}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelectedJob(null)}>
                <Text style={styles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>
              {selectedJob?.status === "in-progress" && (
                <TouchableOpacity style={styles.primaryBtn}>
                  <CheckCircle size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Mark Milestone Complete</Text>
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
  scrollPadding: { padding: 16 },
  headerContainer: { marginBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: "bold", color: "#0f172a" },
  pageSubtitle: { fontSize: 16, color: "#64748b", marginTop: 4 },
  statsGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 12, borderColor: "#e2e8f0", flexDirection: "row", alignItems: "center", gap: 12, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }, android: { elevation: 2 } }) },
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
  cardDisputed: { borderColor: "#fecaca" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatarContainer: { position: "relative" },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: "#2563eb", fontWeight: "bold", fontSize: 16 },
  onlineIndicator: { position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: "#22c55e", borderWidth: 2, borderColor: "#fff" },
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
  bgRedSoft: { backgroundColor: "#fef2f2" },
  textRed: { color: "#b91c1c", fontSize: 12, fontWeight: "600" },
  bgSecondary: { backgroundColor: "#f1f5f9" },
  textSecondary: { color: "#475569", fontSize: 12, fontWeight: "600" },
  progressBox: { marginBottom: 16 },
  progressTextRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabelText: { fontSize: 13, color: "#64748b" },
  progressPercentText: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  progressTrack: { height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2563eb" },
  metaDataRow: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaValueText: { fontSize: 13, color: "#0f172a", fontWeight: "500" },
  metaLabelText: { fontSize: 13, color: "#64748b" },
  unreadText: { fontSize: 13, color: "#2563eb", fontWeight: "500" },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12 },
  leftActions: { flexDirection: "row", gap: 4 },
  ghostBtn: { flexDirection: "row", alignItems: "center", padding: 8, borderRadius: 6 },
  ghostBtnText: { color: "#64748b", fontSize: 13, fontWeight: "500" },
  outlineBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  outlineBtnText: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: height * 0.8 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  modalBody: { marginBottom: 24 },
  modalInfoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  modalInfoLabel: { color: "#64748b", fontSize: 15 },
  modalInfoValue: { color: "#0f172a", fontSize: 15, fontWeight: "600" },
  separator: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 16 },
  milestoneHeading: { fontSize: 16, fontWeight: "bold", color: "#0f172a", marginBottom: 12 },
  milestoneCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#f8fafc", borderRadius: 12, marginBottom: 8 },
  milestoneLeft: { flexDirection: "row", gap: 12, alignItems: "center" },
  milestoneNumber: { color: "#94a3b8", fontSize: 14, fontWeight: "500" },
  milestoneTitleText: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  milestoneAmountText: { fontSize: 12, color: "#64748b" },
  modalFooter: { flexDirection: "row", gap: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  secondaryBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" },
  secondaryBtnText: { fontWeight: "600", color: "#0f172a" },
  primaryBtn: { flex: 2, backgroundColor: "#2563eb", padding: 12, borderRadius: 10, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: "#64748b", marginTop: 4, textAlign: "center" }
});