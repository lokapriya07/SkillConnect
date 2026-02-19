import React from "react"
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
import { useVerification } from "@/context/VerificationContext"
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
  notificationCount,
}: Props) {
  const router = useRouter()
  const { verificationStatus } = useVerification()
  const [isNotiVisible, setIsNotiVisible] = React.useState(false)

  // Map context status to header status
  const currentStatus: VerificationStatus =
    verificationStatus === 'not_submitted' ? 'not_verified' :
      verificationStatus === 'pending' ? 'pending' :
        verificationStatus === 'assigned' ? 'pending' : // 'assigned' shows as 'pending' in header
          verificationStatus === 'verified' ? 'verified' : 'not_verified'

  const statusConfig = STATUS_CONFIG[currentStatus]
  // ... rest of your return code

  const [notifications, setNotifications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Fetch Notifications — uses user._id (matches worker.userId stored by the hire endpoint)
  const fetchNotifications = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);
      // IMPORTANT: notifications are stored with userId = worker.userId (the User _id),
      // NOT the workerProfileId. Always use _id here.
      const userId = user._id || user.id;

      if (!userId) return;

      const res = await fetch(`${API_URL}/api/notifications/${userId}`);
      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Error marking read", error);
    }
  };

  const markAllRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // In production, add a mark-all-read endpoint
    notifications.filter(n => !n.isRead).forEach(n => markAsRead(n._id));
  };

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
            onPress={() => { setIsNotiVisible(true); fetchNotifications(); }}
          >
            <Feather name="bell" size={20} color={unreadCount > 0 ? "#2563eb" : "#6b7280"} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
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
              {notifications.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#9ca3af' }}>No notifications</Text>
                </View>
              ) : (
                notifications.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    style={[styles.notiItem, { backgroundColor: item.isRead ? '#fff' : '#f0f9ff' }]}
                    onPress={() => markAsRead(item._id)}
                  >
                    {!item.isRead && <View style={styles.notiDot} />}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.notiTitle, { fontWeight: item.isRead ? '400' : '700' }]}>
                        {item.title}
                      </Text>
                      <Text style={styles.notiDesc}>{item.message}</Text>
                      <Text style={styles.notiTime}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity style={styles.viewAllBtn} onPress={markAllRead}>
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