import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const ContactSupport = () => {
  const handleEmail = () => Linking.openURL("mailto:support@yourapp.com");
  const handleCall = () => Linking.openURL("tel:+911234567890");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Simple Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Contact Support</Text>
          <Text style={styles.subtitle}>
            Have a question or need help with a task? Our team is here for you.
          </Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
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
  list: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    // Standard shadow
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
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
});

export default ContactSupport;