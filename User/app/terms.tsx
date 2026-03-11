import React from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity 
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const TermsOfService = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Fixed Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Legal Agreement</Text>
          <Text style={styles.headerSubtitle}>Updated 12 March 2026</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.mainTitle}>Terms of Service</Text>
        <Text style={styles.introText}>
          Please read these terms carefully before using our platform. Your privacy and trust are our top priorities.
        </Text>

        {/* Section: Acceptance */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Feather name="check-circle" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>1. Acceptance</Text>
          </View>
          <Text style={styles.cardContent}>
            By accessing this application, you acknowledge that you have read, understood, and agree to be bound by these terms.
          </Text>
        </View>

        {/* Section: Usage */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="user" size={20} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>2. User License</Text>
          </View>
          <Text style={styles.cardContent}>
            We grant you a personal, non-exclusive, non-transferable license to use the app for personal, non-commercial home service bookings.
          </Text>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Feather name="shield-off" size={14} color="#EF4444" />
            <Text style={styles.featureText}>No unauthorized data scraping</Text>
          </View>
        </View>

        {/* Section: Payments */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
              <MaterialCommunityIcons name="credit-card-outline" size={20} color="#F97316" />
            </View>
            <Text style={styles.cardTitle}>3. Billing & Fees</Text>
          </View>
          <Text style={styles.cardContent}>
            All transactions are handled via secure encrypted gateways. We do not store your full card details on our local servers.
          </Text>
          
        </View>

        {/* Section: Termination */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="alert-triangle" size={20} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>4. Termination</Text>
          </View>
          <Text style={styles.cardContent}>
            We reserve the right to suspend or terminate your account at our sole discretion for violations of these terms or fraudulent activities.
          </Text>
        </View>

        {/* Simple Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing to use the platform, you agree to these terms and our Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Clean slate background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  scrollContent: {
    padding: 24,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
  },
  introText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardContent: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 15,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 5,
  },
  inlineButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  footer: {
    marginTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  }
});

export default TermsOfService;