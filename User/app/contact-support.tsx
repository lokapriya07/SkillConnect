import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const commonProblems = [
  {
    id: 1,
    title: "Booking Payment Failed",
    icon: "credit-card",
    steps: [
      "Check your internet connection",
      "Verify your payment method details",
      "Try using a different payment method",
      "Contact support if issue persists"
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+fix+payment+failed+error"
  },
  {
    id: 2,
    title: "Service Provider Not Responding",
    icon: "alert-circle",
    steps: [
      "Wait 5-10 minutes for response",
      "Call the service provider directly from app",
      "Check if you've provided location access",
      "Cancel and request a new professional"
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=service+provider+not+responding+how+to+cancel"
  },
  {
    id: 3,
    title: "How to Rate a Service",
    icon: "star",
    steps: [
      "Go to 'My Bookings'",
      "Select the completed booking",
      "Tap 'Leave Feedback'",
      "Rate stars and write your review",
      "Submit feedback"
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+rate+service+providers+app"
  },
  {
    id: 4,
    title: "Cancel a Booking",
    icon: "x-circle",
    steps: [
      "Go to 'My Bookings' section",
      "Select the booking you want to cancel",
      "Tap 'Cancel Booking'",
      "Select cancellation reason",
      "Confirm cancellation (refund processed in 3-5 days)"
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+cancel+service+booking+app+tutorial"
  },
  {
    id: 5,
    title: "Update Payment Method",
    icon: "credit-card",
    steps: [
      "Go to Settings",
      "Select 'Payment Methods'",
      "Tap 'Add New Payment Method'",
      "Enter your card or wallet details",
      "Save and set as default"
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=add+update+payment+method+mobile+app"
  },
  {
    id: 6,
    title: "Track Service Professional",
    icon: "map-pin",
    steps: [
      "Open your active booking",
      "Look for 'Live Location' button",
      "Tap to see real-time location",
      "Professional's location updates automatically",
      "Contact them if location seems off"
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+track+service+professional+live+location"
  }
];

const ContactSupport = () => {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  const handleEmail = () => Linking.openURL("mailto:support@yourapp.com");
  const handleCall = () => Linking.openURL("tel:+911234567890");

  const handleOpenYouTube = (youtubeUrl) => {
    Linking.openURL(youtubeUrl).catch((err) => console.error("Failed to open URL:", err));
  };

  const handleSolveNow = (problem) => {
    setSelectedProblem(problem);
    setShowSolutionModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Simple Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            Find quick solutions to common issues or contact our team.
          </Text>
        </View>

        {/* Quick Solutions Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Solutions</Text>
        </View>

        <View style={styles.problemGrid}>
          {commonProblems.map((problem) => (
            <TouchableOpacity
              key={problem.id}
              style={styles.problemCard}
              onPress={() => handleSolveNow(problem)}
            >
              <View style={styles.problemIconBox}>
                <Feather name={problem.icon} size={24} color="#3B82F6" />
              </View>
              <Text style={styles.problemTitle}>{problem.title}</Text>
              <View style={styles.solveBtn}>
                <Text style={styles.solveBtnText}>Solve Now</Text>
                <Feather name="chevron-right" size={14} color="#3B82F6" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Contact Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
        </View>

        {/* Action List */}
        <View style={styles.list}>
          
          <TouchableOpacity style={styles.listItem} onPress={handleEmail}>
            <View style={[styles.iconBox, { backgroundColor: '#EBF5FF' }]}>
              <Feather name="mail" size={22} color="#3B82F6" />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Email Us</Text>
              <Text style={styles.itemSub}>support@yourapp.com</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem} onPress={handleCall}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <Feather name="phone" size={22} color="#22C55E" />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Call Support</Text>
              <Text style={styles.itemSub}>Available 9 AM - 6 PM</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <View style={styles.listItem}>
            <View style={[styles.iconBox, { backgroundColor: '#F9FAFB' }]}>
              <Feather name="clock" size={22} color="#6B7280" />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Working Hours</Text>
              <Text style={styles.itemSub}>Monday to Saturday</Text>
            </View>
          </View>

        </View>

        {/* Information Box */}
        <View style={styles.infoBox}>
          <Feather name="info" size={18} color="#3B82F6" style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>
            Average response time is currently under 30 minutes.
          </Text>
        </View>

      </ScrollView>

      {/* Solution Modal */}
      <Modal
        visible={showSolutionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSolutionModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSolutionModal(false)}>
              <Feather name="x" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedProblem?.title}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Steps */}
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsTitle}>📋 Steps to Solve:</Text>
              {selectedProblem?.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* Watch Video Section */}
            <View style={styles.videoSection}>
              <Text style={styles.videoTitle}>🎥 Watch Tutorial</Text>
              <Text style={styles.videoSubtitle}>
                Learn more by watching related YouTube tutorials
              </Text>
              <TouchableOpacity
                style={styles.youtubeBtn}
                onPress={() => handleOpenYouTube(selectedProblem?.youtubeUrl)}
              >
                <Feather name="youtube" size={20} color="#FFF" />
                <Text style={styles.youtubeBtnText}>Watch on YouTube</Text>
              </TouchableOpacity>
            </View>

            {/* Still Need Help */}
            <View style={styles.stillNeedHelp}>
              <Text style={styles.stillNeedHelpText}>Still need help?</Text>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => {
                  setShowSolutionModal(false);
                  setTimeout(() => handleEmail(), 300);
                }}
              >
                <Text style={styles.contactBtnText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 22,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  problemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  problemCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  problemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  problemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 17,
  },
  solveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  solveBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  list: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    flex: 1,
    marginLeft: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemSub: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  stepsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    paddingTop: 6,
  },
  videoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  videoSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 19,
  },
  youtubeBtn: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  youtubeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stillNeedHelp: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 20,
  },
  stillNeedHelpText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 10,
  },
  contactBtn: {
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default ContactSupport;