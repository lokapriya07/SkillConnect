import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// --- Types ---
interface Proposal {
  id: string;
  jobTitle: string;
  jobId: string;
  client: string;
  clientRating: number;
  proposedPrice: number;
  priceType: "fixed" | "hourly";
  submittedAt: string;
  status: "pending" | "accepted" | "rejected";
  expiresIn?: string;
  message: string;
}

// --- Mock Data ---
const initialProposals: Proposal[] = [
  {
    id: "1",
    jobTitle: "Kitchen Sink Installation",
    jobId: "1",
    client: "Sarah Wilson",
    clientRating: 4.8,
    proposedPrice: 200,
    priceType: "fixed",
    submittedAt: "2 hours ago",
    status: "pending",
    expiresIn: "5 days",
    message: "Hi Sarah, I have extensive experience with sink installations.",
  },
  {
    id: "2",
    jobTitle: "Electrical Panel Upgrade",
    jobId: "2",
    client: "Mike Johnson",
    clientRating: 4.9,
    proposedPrice: 2800,
    priceType: "fixed",
    submittedAt: "1 day ago",
    status: "accepted",
    message: "I'm a licensed electrician with 15 years of experience.",
  },
  {
    id: "3",
    jobTitle: "HVAC Maintenance",
    jobId: "3",
    client: "ABC Properties",
    clientRating: 4.7,
    proposedPrice: 150,
    priceType: "fixed",
    submittedAt: "3 days ago",
    status: "rejected",
    message: "I can provide comprehensive HVAC maintenance.",
  },
];

export default function ProposalsScreen() {
  const router = useRouter();
  const [proposals, setProposals] = useState(initialProposals);
  const [activeTab, setActiveTab] = useState<"pending" | "accepted" | "rejected">("pending");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const filteredProposals = proposals.filter((p) => p.status === activeTab);

  const handleWithdraw = () => {
    if (selectedProposal) {
      setProposals(proposals.filter((p) => p.id !== selectedProposal.id));
      setIsModalVisible(false);
      setSelectedProposal(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return { bg: "#FEF3C7", text: "#92400E", icon: "clock" as const };
      case "accepted": return { bg: "#DCFCE7", text: "#166534", icon: "check-circle" as const };
      case "rejected": return { bg: "#FEE2E2", text: "#991B1B", icon: "x-circle" as const };
      default: return { bg: "#F3F4F6", text: "#374151", icon: "info" as const };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Proposals & Offers</Text>
          <Text style={styles.subtitle}>Manage your submissions and client offers</Text>
        </View>

        {/* Direct Offers Section (Simplified) */}
        <View style={styles.offerCard}>
          <View style={styles.rowBetween}>
            <View>
              <View style={styles.row}>
                <Text style={styles.offerTitle}>Emergency Pipe Repair</Text>
                <View style={styles.urgentBadge}><Text style={styles.urgentText}>Urgent</Text></View>
              </View>
              <Text style={styles.mutedText}>From: Lisa Chen</Text>
            </View>
            <Text style={styles.priceText}>$300</Text>
          </View>
          <View style={styles.offerActions}>
            <TouchableOpacity style={styles.declineBtn}><Text style={styles.declineText}>Decline</Text></TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn}><Text style={styles.acceptText}>Accept Offer</Text></TouchableOpacity>
          </View>
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabBar}>
          {(["pending", "accepted", "rejected"] as const).map((tab) => (
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

        {/* Proposals List */}
        {filteredProposals.length > 0 ? (
          filteredProposals.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                  <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                    <Feather name={statusStyle.icon} size={12} color={statusStyle.text} />
                    <Text style={[styles.badgeText, { color: statusStyle.text }]}> {item.status}</Text>
                  </View>
                </View>

                <Text style={styles.mutedText}>Client: {item.client}</Text>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Feather name="dollar-sign" size={14} color="#2563eb" />
                    <Text style={styles.detailText}>${item.proposedPrice} / {item.priceType}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Feather name="clock" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{item.submittedAt}</Text>
                  </View>
                </View>

                <Text style={styles.messagePreview} numberOfLines={2}>"{item.message}"</Text>

                <View style={styles.cardFooter}>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => router.push(`/job/${item.jobId}`)}>
                    <Feather name="external-link" size={14} color="#2563eb" />
                    <Text style={styles.viewBtnText}> View Job</Text>
                  </TouchableOpacity>

                  {item.status === "pending" && (
                    <TouchableOpacity 
                      style={styles.withdrawBtn} 
                      onPress={() => { setSelectedProposal(item); setIsModalVisible(true); }}
                    >
                      <Feather name="trash-2" size={14} color="#ef4444" />
                      <Text style={styles.withdrawText}> Withdraw</Text>
                    </TouchableOpacity>
                  )}

                  {item.status === "accepted" && (
                    <TouchableOpacity style={styles.startBtn} onPress={() => router.push("/message")}>
                      <Text style={styles.startBtnText}>Message Client</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Feather name="folder" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No {activeTab} proposals found.</Text>
          </View>
        )}
      </ScrollView>

      {/* Withdraw Confirmation Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Withdraw Proposal?</Text>
            <Text style={styles.modalSub}>
              Are you sure you want to withdraw for "{selectedProposal?.jobTitle}"? This cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDelete} onPress={handleWithdraw}>
                <Text style={{ color: "#fff" }}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 16, gap: 20 },
  header: { marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  offerCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  offerTitle: { fontSize: 16, fontWeight: "600", color: "#1e3a8a" },
  urgentBadge: { backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  urgentText: { fontSize: 10, color: "#92400E", fontWeight: "bold" },
  priceText: { fontSize: 18, fontWeight: "bold", color: "#2563eb" },
  offerActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  declineBtn: { flex: 1, padding: 10, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: "#d1d5db" },
  acceptBtn: { flex: 1, padding: 10, alignItems: "center", backgroundColor: "#2563eb", borderRadius: 8 },
  acceptText: { color: "#fff", fontWeight: "600" },
  declineText: { color: "#4b5563", fontWeight: "600" },
  tabBar: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 8, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  activeTab: { backgroundColor: "#fff", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  activeTabText: { color: "#111827", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }),
  },
  jobTitle: { fontSize: 16, fontWeight: "700", color: "#1f2937", flex: 1 },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "bold", textTransform: "capitalize" },
  mutedText: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  detailsRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 13, color: "#374151" },
  messagePreview: { fontSize: 13, color: "#6b7280", fontStyle: "italic", marginTop: 12 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f1f5f9", marginTop: 12, paddingTop: 12 },
  viewBtn: { flexDirection: "row", alignItems: "center" },
  viewBtnText: { color: "#2563eb", fontSize: 14, fontWeight: "600" },
  withdrawBtn: { flexDirection: "row", alignItems: "center" },
  withdrawText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
  startBtn: { backgroundColor: "#2563eb", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  startBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  emptyState: { padding: 40, alignItems: "center", opacity: 0.5 },
  emptyText: { marginTop: 12, color: "#6b7280" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalSub: { color: "#6b7280", marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 12 },
  modalCancel: { flex: 1, padding: 12, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: "#d1d5db" },
  modalDelete: { flex: 1, padding: 12, alignItems: "center", borderRadius: 8, backgroundColor: "#ef4444" },
});


// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   Platform,
//   Dimensions,
// } from "react-native";
// import { Feather } from "@expo/vector-icons";
// // Import Lucide icons to match the JobsPage style
// import { MapPin, Clock, Star, X, Zap, DollarSign } from "lucide-react-native";
// import { useRouter } from "expo-router";

// const { height, width } = Dimensions.get("window");

// // --- Types ---
// interface Proposal {
//   id: string;
//   jobTitle: string;
//   jobId: string;
//   client: string;
//   clientRating: number;
//   proposedPrice: number;
//   priceType: "fixed" | "hourly";
//   submittedAt: string;
//   status: "pending" | "accepted" | "rejected";
//   expiresIn?: string;
//   message: string;
//   // Fields for Detail View (Mocking what would come from a Job fetch)
//   description: string;
//   location: string;
//   skills: string[];
//   isUrgent?: boolean;
//   budgetRange: { min: number; max: number };
// }

// // --- Mock Data ---
// const initialProposals: Proposal[] = [
//   {
//     id: "1",
//     jobTitle: "Kitchen Sink Installation",
//     jobId: "1",
//     client: "Sarah Wilson",
//     clientRating: 4.8,
//     proposedPrice: 200,
//     priceType: "fixed",
//     submittedAt: "2 hours ago",
//     status: "pending",
//     message: "Hi Sarah, I have extensive experience with sink installations.",
//     description: "Need a professional plumber to install a new kitchen sink with garbage disposal. Must have experience with modern fixtures.",
//     location: "San Francisco, CA",
//     skills: ["Plumbing", "Installation"],
//     isUrgent: true,
//     budgetRange: { min: 150, max: 250 }
//   },
//   {
//     id: "2",
//     jobTitle: "Electrical Panel Upgrade",
//     jobId: "2",
//     client: "Mike Johnson",
//     clientRating: 4.9,
//     proposedPrice: 2800,
//     priceType: "fixed",
//     submittedAt: "1 day ago",
//     status: "accepted",
//     message: "I'm a licensed electrician with 15 years of experience.",
//     description: "Looking for licensed electrician to upgrade 100A panel to 200A. Must pull permits.",
//     location: "Oakland, CA",
//     skills: ["Electrical", "Panel Upgrade"],
//     budgetRange: { min: 2000, max: 3500 }
//   }
// ];

// export default function ProposalsScreen() {
//   const router = useRouter();
//   const [proposals, setProposals] = useState(initialProposals);
//   const [activeTab, setActiveTab] = useState<"pending" | "accepted" | "rejected">("pending");
  
//   // MODAL STATES
//   const [selectedJob, setSelectedJob] = useState<Proposal | null>(null);
//   const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
//   const [proposalToWithdraw, setProposalToWithdraw] = useState<Proposal | null>(null);

//   const filteredProposals = proposals.filter((p) => p.status === activeTab);

//   const handleWithdraw = () => {
//     if (proposalToWithdraw) {
//       setProposals(proposals.filter((p) => p.id !== proposalToWithdraw.id));
//       setIsWithdrawModalVisible(false);
//       setProposalToWithdraw(null);
//     }
//   };

//   const getStatusStyle = (status: string) => {
//     switch (status) {
//       case "pending": return { bg: "#FEF3C7", text: "#92400E", icon: "clock" as const };
//       case "accepted": return { bg: "#DCFCE7", text: "#166534", icon: "check-circle" as const };
//       case "rejected": return { bg: "#FEE2E2", text: "#991B1B", icon: "x-circle" as const };
//       default: return { bg: "#F3F4F6", text: "#374151", icon: "info" as const };
//     }
//   };

//   // --- PORTED COMPONENT: DetailsModal ---
//   const DetailsModal = () => (
//     <Modal visible={!!selectedJob} animationType="slide" transparent>
//       <View style={styles.detailsModalOverlay}>
//         <View style={[styles.detailsModalContent, { height: height * 0.85 }]}>
//           <View style={styles.detailsModalHeader}>
//             <Text style={styles.detailsModalTitle}>Job Details</Text>
//             <TouchableOpacity onPress={() => setSelectedJob(null)}>
//               <X size={24} color="#0f172a" />
//             </TouchableOpacity>
//           </View>
          
//           <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
//             <View style={styles.detailsTitleRow}>
//               <Text style={[styles.detailsJobTitle, { fontSize: 22 }]}>{selectedJob?.jobTitle}</Text>
//               {selectedJob?.isUrgent && (
//                 <View style={styles.urgentBadgeDetail}>
//                   <Zap size={12} color="#ea580c" fill="#ea580c" />
//                   <Text style={styles.urgentTextDetail}>Urgent</Text>
//                 </View>
//               )}
//             </View>

//             <View style={styles.detailsMetaRow}>
//               <View style={styles.detailsMetaItem}>
//                 <MapPin size={16} color="#64748b" />
//                 <Text style={styles.detailsMetaText}>{selectedJob?.location}</Text>
//               </View>
//               <View style={styles.detailsMetaItem}>
//                 <Clock size={16} color="#64748b" />
//                 <Text style={styles.detailsMetaText}>Submitted {selectedJob?.submittedAt}</Text>
//               </View>
//             </View>

//             <View style={styles.detailsPricingCard}>
//               <View>
//                 <Text style={styles.detailsLabel}>Job Budget</Text>
//                 <Text style={styles.detailsValue}>${selectedJob?.budgetRange.min} - ${selectedJob?.budgetRange.max}</Text>
//               </View>
//               <View style={styles.detailsDividerVertical} />
//               <View>
//                 <Text style={styles.detailsLabel}>Your Bid</Text>
//                 <Text style={[styles.detailsValue, {color: '#2563eb'}]}>${selectedJob?.proposedPrice}</Text>
//               </View>
//             </View>

//             <Text style={styles.detailsSectionTitle}>Job Description</Text>
//             <Text style={styles.detailsDescriptionFull}>{selectedJob?.description}</Text>

//             <Text style={styles.detailsSectionTitle}>Your Proposal Message</Text>
//             <View style={styles.messageBox}>
//                 <Text style={styles.detailsDescriptionFull}>{selectedJob?.message}</Text>
//             </View>

//             <View style={styles.detailsClientCard}>
//               <Text style={styles.detailsSectionTitle}>About Client</Text>
//               <Text style={styles.detailsClientName}>{selectedJob?.client}</Text>
//               <View style={styles.detailsMetaRow}>
//                  <Star size={14} color="#eab308" fill="#eab308" />
//                  <Text style={styles.detailsClientMetaText}>{selectedJob?.clientRating} Rating</Text>
//               </View>
//             </View>
//           </ScrollView>

//           <TouchableOpacity 
//             style={styles.detailsSubmitBtn} 
//             onPress={() => {
//                 setSelectedJob(null);
//                 router.push("/message");
//             }}>
//             <Text style={styles.detailsSubmitBtnText}>Message Client</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.title}>Proposals & Offers</Text>
//           <Text style={styles.subtitle}>Manage your submissions and client offers</Text>
//         </View>

//         {/* Custom Tabs */}
//         <View style={styles.tabBar}>
//           {(["pending", "accepted", "rejected"] as const).map((tab) => (
//             <TouchableOpacity
//               key={tab}
//               style={[styles.tab, activeTab === tab && styles.activeTab]}
//               onPress={() => setActiveTab(tab)}
//             >
//               <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
//                 {tab.charAt(0).toUpperCase() + tab.slice(1)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Proposals List */}
//         {filteredProposals.length > 0 ? (
//           filteredProposals.map((item) => {
//             const statusStyle = getStatusStyle(item.status);
//             return (
//               <View key={item.id} style={styles.card}>
//                 <View style={styles.rowBetween}>
//                   <Text style={styles.jobTitle}>{item.jobTitle}</Text>
//                   <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
//                     <Feather name={statusStyle.icon} size={12} color={statusStyle.text} />
//                     <Text style={[styles.badgeText, { color: statusStyle.text }]}> {item.status}</Text>
//                   </View>
//                 </View>

//                 <Text style={styles.mutedText}>Client: {item.client}</Text>

//                 <View style={styles.detailsRow}>
//                   <View style={styles.detailItem}>
//                     <Feather name="dollar-sign" size={14} color="#2563eb" />
//                     <Text style={styles.detailText}>${item.proposedPrice} / {item.priceType}</Text>
//                   </View>
//                 </View>

//                 <View style={styles.cardFooter}>
//                   {/* UPDATE: This now triggers the ported Modal instead of a router push */}
//                   <TouchableOpacity style={styles.viewBtn} onPress={() => setSelectedJob(item)}>
//                     <Feather name="external-link" size={14} color="#2563eb" />
//                     <Text style={styles.viewBtnText}> View Job</Text>
//                   </TouchableOpacity>

//                   {item.status === "pending" && (
//                     <TouchableOpacity 
//                       style={styles.withdrawBtn} 
//                       onPress={() => { setProposalToWithdraw(item); setIsWithdrawModalVisible(true); }}
//                     >
//                       <Feather name="trash-2" size={14} color="#ef4444" />
//                       <Text style={styles.withdrawText}> Withdraw</Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               </View>
//             );
//           })
//         ) : (
//           <View style={styles.emptyState}>
//             <Feather name="folder" size={48} color="#9ca3af" />
//             <Text style={styles.emptyText}>No {activeTab} proposals found.</Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* RENDER THE PORTED DETAILS MODAL */}
//       <DetailsModal />

//       {/* Withdraw Confirmation Modal */}
//       <Modal visible={isWithdrawModalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Withdraw Proposal?</Text>
//             <Text style={styles.modalSub}>
//               Are you sure you want to withdraw for "{proposalToWithdraw?.jobTitle}"? This cannot be undone.
//             </Text>
//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.modalCancel} onPress={() => setIsWithdrawModalVisible(false)}>
//                 <Text>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalDelete} onPress={handleWithdraw}>
//                 <Text style={{ color: "#fff" }}>Withdraw</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   // --- BASE SCREEN STYLES ---
//   container: { flex: 1, backgroundColor: "#fff" },
//   scrollContent: { padding: 16, gap: 20 },
//   header: { marginBottom: 4 },
//   title: { fontSize: 24, fontWeight: "bold", color: "#111827" },
//   subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
//   rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   tabBar: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 8, padding: 4 },
//   tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
//   activeTab: { backgroundColor: "#fff", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2 },
//   tabText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
//   activeTabText: { color: "#111827", fontWeight: "bold" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#f1f5f9",
//     ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }),
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#1f2937", flex: 1 },
//   badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
//   badgeText: { fontSize: 11, fontWeight: "bold", textTransform: "capitalize" },
//   mutedText: { fontSize: 13, color: "#6b7280", marginTop: 2 },
//   detailsRow: { flexDirection: "row", gap: 16, marginTop: 12 },
//   detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
//   detailText: { fontSize: 13, color: "#374151" },
//   cardFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f1f5f9", marginTop: 12, paddingTop: 12 },
//   viewBtn: { flexDirection: "row", alignItems: "center" },
//   viewBtnText: { color: "#2563eb", fontSize: 14, fontWeight: "600" },
//   withdrawBtn: { flexDirection: "row", alignItems: "center" },
//   withdrawText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
//   emptyState: { padding: 40, alignItems: "center", opacity: 0.5 },
//   emptyText: { marginTop: 12, color: "#6b7280" },

//   // --- WITHDRAW MODAL STYLES ---
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
//   modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
//   modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
//   modalSub: { color: "#6b7280", marginBottom: 20 },
//   modalActions: { flexDirection: "row", gap: 12 },
//   modalCancel: { flex: 1, padding: 12, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: "#d1d5db" },
//   modalDelete: { flex: 1, padding: 12, alignItems: "center", borderRadius: 8, backgroundColor: "#ef4444" },

//   // --- PORTED DETAILS MODAL STYLES (from search.tsx) ---
//   detailsModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
//   detailsModalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
//   detailsModalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: 'center' },
//   detailsModalTitle: { fontSize: 20, fontWeight: "bold" },
//   detailsTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: 'wrap' },
//   detailsJobTitle: { fontWeight: "bold", color: "#0f172a", maxWidth: width * 0.7 },
//   urgentBadgeDetail: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff7ed", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
//   urgentTextDetail: { color: "#ea580c", fontSize: 10, fontWeight: "bold" },
//   detailsMetaRow: { flexDirection: 'row', gap: 15, marginTop: 10, alignItems: 'center' },
//   detailsMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   detailsMetaText: { fontSize: 12, color: "#64748b" },
//   detailsPricingCard: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginVertical: 20, justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
//   detailsLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
//   detailsValue: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
//   detailsDividerVertical: { width: 1, height: 30, backgroundColor: '#e2e8f0' },
//   detailsSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 15, marginBottom: 10 },
//   detailsDescriptionFull: { fontSize: 15, color: '#475569', lineHeight: 24 },
//   detailsClientCard: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 20, backgroundColor: '#fff' },
//   detailsClientName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
//   detailsClientMetaText: { fontSize: 14, color: '#64748b', marginLeft: 5 },
//   detailsSubmitBtn: { backgroundColor: "#0f172a", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
//   detailsSubmitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   messageBox: { padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#2563eb' }
// });

