import React, { useState,useCallback ,useEffect} from "react"
import { useFocusEffect } from "expo-router";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Pressable, 
  Platform 
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"


// --- Types & Configuration ---
type VerificationStatus = "pending" | "verified" | "warning" | "not_verified"

type Props = {
  notificationCount?: number
  status?: VerificationStatus
}



const STATUS_CONFIG = {
  not_verified: { label: "Unverified", bg: "#F3F4F6", text: "#6B7280", icon: "user-x" as const },
  pending: { label: "Pending", bg: "#FEF3C7", text: "#92400E", icon: "clock" as const },
  verified: { label: "Verified", bg: "#DCFCE7", text: "#166534", icon: "check-circle" as const },
  warning: { label: "Warning", bg: "#FEE2E2", text: "#991B1B", icon: "alert-triangle" as const },
} as const

export default function Header({
  notificationCount = 3,
  status: initialStatus = "not_verified", // Correctly defaults to Unverified
}: Props) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<VerificationStatus>(initialStatus)
  const [isNotiVisible, setIsNotiVisible] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // 1. Fetch raw values from storage
        const isVerifiedRaw = await AsyncStorage.getItem('is_verified_worker');
        const hasRequestedRaw = await AsyncStorage.getItem('verification_requested');

        // 2. DEBUG LOGS: Check your terminal/console
        console.log("--- HEADER DEBUG ---");
        console.log("Raw Verified Value:", isVerifiedRaw);      // Should be null for new workers
        console.log("Raw Requested Value:", hasRequestedRaw);    // Should be null for new workers
        console.log("--------------------");

        // 3. Strict Logic
        if (isVerifiedRaw === 'true') {
          setCurrentStatus('verified');
        } else if (hasRequestedRaw === 'true') {
          setCurrentStatus('pending');
        } else {
          // This is where new workers should land
          setCurrentStatus('not_verified');
        }
      } catch (error) {
        console.error("Storage Error:", error);
        setCurrentStatus('not_verified');
      }
    };

    checkStatus();
  }, []);

  const statusConfig = STATUS_CONFIG[currentStatus];
  // ... rest of your return code

  // Mock Notification Data
  const notifications = [
    { id: 1, title: "New job invitation", desc: 'Client invited you to "Plumbing Repair"', time: "2m ago" },
    { id: 2, title: "Proposal accepted", desc: 'Your bid for "AC Installation" was accepted', time: "1h ago" },
    { id: 3, title: "New message", desc: "Sarah sent you a message about the project", time: "3h ago" },
  ]

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        {/* LEFT: Logo Section */}
        <View style={styles.left}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>W</Text>
          </View>
          <Text style={styles.title}>WorkerHub</Text>
        </View>

        {/* RIGHT: Status, Wallet, and Bell */}
        <View style={styles.right}>
          {/* Status Badge uses currentStatus now */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Feather name={statusConfig.icon} size={12} color={statusConfig.text} style={styles.statusIcon} />
            <Text style={[styles.statusText, { color: statusConfig.text }]}>
              {statusConfig.label}
            </Text>
          </View>

          {/* 2. Wallet Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/(worker-tabs)/earnings")}
          >
            <Feather name="credit-card" size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* 3. Notification Bell with Badge */}
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setIsNotiVisible(true)}
          >
            <Feather name="bell" size={20} color="#6b7280" />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Notification Dropdown Modal --- */}
      <Modal
        visible={isNotiVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsNotiVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsNotiVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setIsNotiVisible(false)}>
                <Feather name="x" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView bounces={false} style={styles.notiList}>
              {notifications.map((item) => (
                <TouchableOpacity key={item.id} style={styles.notiItem}>
                  <View style={styles.notiDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notiTitle}>{item.title}</Text>
                    <Text style={styles.notiDesc}>{item.desc}</Text>
                    <Text style={styles.notiTime}>{item.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

// --- Styles ---
const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800",
  },

  /* Modal & Dropdown Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: Platform.OS === "ios" ? 100 : 60, // Position relative to header height
    paddingRight: 16,
  },
  dropdownContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dropdownTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111827",
  },
  notiList: {
    maxHeight: 350,
  },
  notiItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  notiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginTop: 5,
    marginRight: 12,
  },
  notiTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  notiDesc: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  notiTime: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 6,
  },
  viewAllBtn: {
    padding: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
  },
})