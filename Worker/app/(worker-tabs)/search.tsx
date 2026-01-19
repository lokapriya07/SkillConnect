import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Star,
  X,
  Zap,
  DollarSign,
  ChevronDown,
  Check,
} from "lucide-react-native";

const { height, width } = Dimensions.get("window");

// --- Interfaces ---
// Defining this interface resolves the "Property does not exist" error
interface Job {
  id: string;
  title: string;
  description: string;
  client: {
    name: string;
    rating: number;
    jobs: number;
  };
  budget: {
    min: number;
    max: number;
    type: "fixed" | "hourly";
  };
  location: string;
  distance: number;
  skills: string[];
  postedAt: string;
  proposals: number;
  category: string;
  isUrgent?: boolean;   // Optional property
  matchScore?: number;  // Optional property
}

// --- MOCK DATA ---
const RECOMMENDED_JOBS: Job[] = [
  {
    id: "1",
    title: "Kitchen Sink Installation",
    description: "Need a professional plumber to install a new kitchen sink with garbage disposal. Must have experience with modern fixtures.",
    client: { name: "Sarah Wilson", rating: 4.8, jobs: 12 },
    budget: { min: 150, max: 250, type: "fixed" },
    location: "San Francisco, CA",
    distance: 2,
    skills: ["Plumbing", "Installation"],
    postedAt: "2 hours ago",
    proposals: 5,
    matchScore: 95,
    isUrgent: true,
    category: "Plumbing",
  },
  {
    id: "2",
    title: "Electrical Panel Upgrade",
    description: "Looking for licensed electrician to upgrade 100A panel to 200A. Must pull permits and pass inspection.",
    client: { name: "Mike Johnson", rating: 4.9, jobs: 28 },
    budget: { min: 2000, max: 3500, type: "fixed" },
    location: "Oakland, CA",
    distance: 8,
    skills: ["Electrical", "Panel Upgrade"],
    postedAt: "5 hours ago",
    proposals: 8,
    matchScore: 88,
    category: "Electrical",
  },
];

const ALL_JOBS: Job[] = [
  ...RECOMMENDED_JOBS,
  {
    id: "5",
    title: "Ceiling Fan Installation",
    description: "Need electrician to install 3 ceiling fans in bedrooms. Wiring already in place.",
    client: { name: "Lisa Chen", rating: 4.6, jobs: 5 },
    budget: { min: 75, max: 150, type: "hourly" },
    location: "Palo Alto, CA",
    distance: 20,
    skills: ["Electrical", "Installation"],
    postedAt: "3 days ago",
    proposals: 9,
    category: "Electrical",
    isUrgent: false,
    matchScore: 70,
  },
];

const CATEGORIES = ["All Categories", "Plumbing", "Electrical", "HVAC", "Carpentry", "Painting"];
const JOB_TYPES = ["All Types", "On-site", "Remote"];
const DISTANCES = [5, 10, 15, 25, 50, 100];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recommended");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [category, setCategory] = useState("All Categories");
  const [jobType, setJobType] = useState("All Types");
  const [distance, setDistance] = useState(25);
  const [activePicker, setActivePicker] = useState<"category" | "jobType" | null>(null);

  const filteredJobs = useMemo(() => {
    let list = activeTab === "recommended" ? [...RECOMMENDED_JOBS] : [...ALL_JOBS];
    if (searchQuery) {
      list = list.filter((j) => j.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [searchQuery, activeTab]);

  // --- MODAL COMPONENTS ---

  const DetailsModal = () => (
    <Modal visible={!!selectedJob} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: height * 0.85 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Job Details</Text>
            <TouchableOpacity onPress={() => setSelectedJob(null)}>
              <X size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={[styles.jobTitle, { fontSize: 22 }]}>{selectedJob?.title}</Text>
              {selectedJob?.isUrgent && (
                <View style={styles.urgentBadge}>
                  <Zap size={12} color="#ea580c" fill="#ea580c" />
                  <Text style={styles.urgentText}>Urgent</Text>
                </View>
              )}
            </View>

            <View style={styles.detailsMetaRow}>
              <View style={styles.metaItem}>
                <MapPin size={16} color="#64748b" />
                <Text style={styles.metaText}>{selectedJob?.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={16} color="#64748b" />
                <Text style={styles.metaText}>Posted {selectedJob?.postedAt}</Text>
              </View>
            </View>

            <View style={styles.detailsPricingCard}>
              <View>
                <Text style={styles.detailsLabel}>Budget</Text>
                <Text style={styles.detailsValue}>${selectedJob?.budget.min} - ${selectedJob?.budget.max}</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View>
                <Text style={styles.detailsLabel}>Type</Text>
                <Text style={styles.detailsValue}>{selectedJob?.budget.type === 'fixed' ? 'Fixed Price' : 'Hourly'}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionFull}>{selectedJob?.description}</Text>

            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillWrap}>
              {selectedJob?.skills.map((skill) => (
                <View key={skill} style={styles.distChip}>
                  <Text style={styles.distText}>{skill}</Text>
                </View>
              ))}
            </View>

            <View style={styles.clientDetailsCard}>
              <Text style={styles.sectionTitle}>About Client</Text>
              <Text style={styles.clientName}>{selectedJob?.client.name}</Text>
              <View style={styles.detailsMetaRow}>
                <Star size={14} color="#eab308" fill="#eab308" />
                <Text style={styles.clientMetaText}>{selectedJob?.client.rating} Rating • {selectedJob?.client.jobs} jobs posted</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.submitFilter} onPress={() => { setSelectedJob(null); alert("Application Sent!"); }}>
            <Text style={styles.submitFilterText}>Submit Proposal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const PickerModal = ({ title, options, selected, onSelect, visible }: any) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContent}>
          <Text style={styles.pickerTitle}>{title}</Text>
          {options.map((opt: string) => (
            <TouchableOpacity key={opt} style={styles.pickerItem} onPress={() => onSelect(opt)}>
              <Text style={[styles.pickerItemText, selected === opt && styles.activePickerItemText]}>{opt}</Text>
              {selected === opt && <Check size={18} color="#2563eb" />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setActivePicker(null)} style={styles.pickerClose}>
            <Text style={styles.pickerCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.paddingBox}>
        <Text style={styles.pageTitle}>Browse Jobs</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterTrigger} onPress={() => setIsFilterOpen(true)}>
            <Filter size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          {["recommended", "all"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              style={[styles.tab, activeTab === t && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredJobs.map(job => (
          <View key={job.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                  {job.isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Zap size={10} color="#ea580c" fill="#ea580c" />
                      <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.clientMeta}>{job.client.name} • ⭐ {job.client.rating}</Text>
              </View>
              <View style={styles.matchBadge}><Text style={styles.matchText}>{job.matchScore || 80}% Match</Text></View>
            </View>
            <Text style={styles.description} numberOfLines={2}>{job.description}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <DollarSign size={14} color="#0f172a" />
                <Text style={styles.priceText}>${job.budget.min}-${job.budget.max}</Text>
              </View>
              <View style={styles.metaItem}>
                <MapPin size={14} color="#64748b" />
                <Text style={styles.metaText}>{job.location}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.proposals}>{job.proposals} proposals</Text>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setSelectedJob(job)}
              >
                <Text style={styles.applyBtnText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* MODALS */}
      <DetailsModal />

      <Modal visible={isFilterOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterOpen(false)}><X size={24} color="#0f172a" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setActivePicker("category")}>
                <Text style={styles.dropdownValue}>{category}</Text>
                <ChevronDown size={18} color="#64748b" />
              </TouchableOpacity>
              <View style={styles.spacer} />
              <Text style={styles.label}>Distance (Miles)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.distanceRow}>
                {DISTANCES.map(d => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDistance(d)}
                    style={[styles.distChip, distance === d && styles.activeDistChip]}
                  >
                    <Text style={[styles.distText, distance === d && styles.activeDistText]}>{d} mi</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.spacer} />
              <Text style={styles.label}>Job Type</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setActivePicker("jobType")}>
                <Text style={styles.dropdownValue}>{jobType}</Text>
                <ChevronDown size={18} color="#64748b" />
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.submitFilter} onPress={() => setIsFilterOpen(false)}>
              <Text style={styles.submitFilterText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
        <PickerModal
          title="Select Category"
          options={CATEGORIES}
          selected={category}
          visible={activePicker === "category"}
          onSelect={(val: string) => { setCategory(val); setActivePicker(null); }}
        />
        <PickerModal
          title="Select Job Type"
          options={JOB_TYPES}
          selected={jobType}
          visible={activePicker === "jobType"}
          onSelect={(val: string) => { setJobType(val); setActivePicker(null); }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  paddingBox: { padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#0f172a", marginBottom: 12 },
  searchRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 12, height: 44, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  filterTrigger: { width: 44, height: 44, backgroundColor: "#fff", borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  tabsContainer: { flexDirection: "row", backgroundColor: "#e2e8f0", padding: 4, borderRadius: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#fff" },
  tabText: { fontWeight: "600", color: "#64748b" },
  activeTabText: { color: "#0f172a" },
  listContainer: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: 'wrap' },
  jobTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a", maxWidth: width * 0.6 },
  urgentBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff7ed", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  urgentText: { color: "#ea580c", fontSize: 10, fontWeight: "bold" },
  matchBadge: { backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  matchText: { color: "#2563eb", fontSize: 11, fontWeight: "bold" },
  clientMeta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  description: { fontSize: 14, color: "#475569", lineHeight: 20, marginVertical: 10 },
  metaRow: { flexDirection: "row", gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#64748b" },
  priceText: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12 },
  proposals: { fontSize: 12, color: "#94a3b8" },
  applyBtn: { backgroundColor: "#0f172a", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  applyBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  label: { fontSize: 15, fontWeight: "bold", marginBottom: 10 },
  dropdown: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  dropdownValue: { color: "#0f172a" },
  spacer: { height: 24 },
  distanceRow: { gap: 10 },
  distChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0", marginRight: 8 },
  activeDistChip: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  distText: { color: "#64748b", fontWeight: "600", fontSize: 12 },
  activeDistText: { color: "#fff" },
  submitFilter: { backgroundColor: "#0f172a", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  submitFilterText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  pickerContent: { width: width * 0.8, backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  pickerTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  pickerItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  pickerItemText: { fontSize: 16, color: "#475569" },
  activePickerItemText: { color: "#2563eb", fontWeight: "bold" },
  pickerClose: { marginTop: 15, alignItems: "center" },
  pickerCloseText: { color: "#ef4444", fontWeight: "bold" },
  detailsMetaRow: { flexDirection: 'row', gap: 15, marginTop: 10, alignItems: 'center' },
  detailsPricingCard: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginVertical: 20, justifyContent: 'space-around', alignItems: 'center' },
  detailsLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  detailsValue: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  dividerVertical: { width: 1, height: 30, backgroundColor: '#e2e8f0' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 15, marginBottom: 10 },
  descriptionFull: { fontSize: 15, color: '#475569', lineHeight: 24 },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clientDetailsCard: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 20, backgroundColor: '#fff' },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  clientMetaText: { fontSize: 14, color: '#64748b', marginLeft: 5 }
});