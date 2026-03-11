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

const PrivacyPolicy = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Privacy Center</Text>
          <Text style={styles.headerSubtitle}>v2.1 • Updated March 2026</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.mainTitle}>Privacy Policy</Text>
        <Text style={styles.introText}>
          We value your trust. This policy outlines how we handle your personal data to provide a seamless service experience.
        </Text>

        {/* Section: Data Collection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF' }]}>
              <Feather name="database" size={20} color="#0EA5E9" />
            </View>
            <Text style={styles.cardTitle}>1. Data Collection</Text>
          </View>
          <Text style={styles.cardContent}>
            To facilitate our home services, we collect the following information:
          </Text>
          
          <View style={styles.dataGrid}>
            <View style={styles.dataTag}><Text style={styles.tagText}>Full Name</Text></View>
            <View style={styles.dataTag}><Text style={styles.tagText}>Email</Text></View>
            <View style={styles.dataTag}><Text style={styles.tagText}>Phone</Text></View>
            <View style={styles.dataTag}><Text style={styles.tagText}>Location</Text></View>
          </View>
        </View>

        {/* Section: Usage */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#F5F3FF' }]}>
              <Feather name="eye" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.cardTitle}>2. Usage Purpose</Text>
          </View>
          <Text style={styles.cardContent}>
            Your data allows us to process bookings, verify service professionals, and provide location-based availability.
          </Text>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Feather name="shield" size={14} color="#10B981" />
            <Text style={styles.infoText}>We never sell your data to third parties.</Text>
          </View>
        </View>

        {/* Section: Security */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <MaterialCommunityIcons name="lock-check-outline" size={22} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>3. Data Protection</Text>
          </View>
          <Text style={styles.cardContent}>
            All sensitive information, including payment details, is encrypted using industry-standard SSL technology and stored in secure environments.
          </Text>
        </View>

        {/* Section: Contact */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF1F2' }]}>
              <Feather name="mail" size={20} color="#E11D48" />
            </View>
            <Text style={styles.cardTitle}>4. Contact Us</Text>
          </View>
          <Text style={styles.cardContent}>
            For any data-related queries or to request account deletion, contact our privacy officer at:
          </Text>
          <Text style={styles.emailText}>privacy@yourapp.com</Text>
        </View>

        <View style={styles.footer}>
          <Feather name="info" size={16} color="#94A3B8" />
          <Text style={styles.footerText}>
            Your continued use of our app confirms your agreement to these practices.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 15,
  },
  dataTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  emailText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  footerText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
  }
});

export default PrivacyPolicy;