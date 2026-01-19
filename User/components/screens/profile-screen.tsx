"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppStore } from "@/lib/store"
import { Colors } from "@/constants/Colors"
import { useRouter, Href } from "expo-router"

interface ProfileScreenProps {
    onLogout: () => void
}

const menuItems = [
    { id: "bookings", icon: "calendar-outline", title: "My Bookings", subtitle: "View all your bookings", route: "/bookings" as Href },
    { id: "addresses", icon: "location-outline", title: "Saved Addresses", subtitle: "Manage your addresses", route: "/manual-location" as Href },
    { id: "payment", icon: "card-outline", title: "Payment Methods", subtitle: "Manage payment options", route: "/checkout1" as Href },
    { id: "help", icon: "help-circle-outline", title: "Help & Support", subtitle: "Get help, contact us", route: "/help" as Href },
    { id: "about", icon: "information-circle-outline", title: "About", subtitle: "App version, terms, privacy", route: "/about" as Href },
]

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
    // We pull 'user' and 'isAuthenticated' from the global store.
    // When the store updates (from Edit Profile), this component re-renders automatically.
    const { user, isAuthenticated } = useAppStore()
    const router = useRouter()

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileImageContainer}>
                        {isAuthenticated && user ? (
                            <Image
                                source={{
                                    uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
                                }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.profilePlaceholder}>
                                <Ionicons name="person" size={40} color={Colors.textSecondary} />
                            </View>
                        )}
                        <TouchableOpacity style={styles.editButton}>
                            <Ionicons name="camera" size={16} color={Colors.white} />
                        </TouchableOpacity>
                    </View>

                    {/* DYNAMIC DATA: These fields now listen to the store */}
                    <Text style={styles.profileName}>
                        {isAuthenticated ? (user?.name || "John Doe") : "Guest User"}
                    </Text>
                    <Text style={styles.profilePhone}>
                        {user?.phone || "+1 (555) 123-4567"}
                    </Text>

                    <TouchableOpacity
                        style={styles.editProfileButton}
                        onPress={() => router.push("/edit-profile" as Href)}
                    >
                        <Ionicons name="create-outline" size={18} color={Colors.primary} />
                        <Text style={styles.editProfileText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Membership Card */}
                <View style={styles.membershipCard}>
                    <View style={styles.membershipLeft}>
                        <View style={styles.crownContainer}>
                            <Ionicons name="diamond" size={24} color="#FFB800" />
                        </View>
                        <View>
                            <Text style={styles.membershipTitle}>ServiceHub Plus</Text>
                            <Text style={styles.membershipSubtitle}>Get exclusive benefits</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={() => router.push('/service-upgrade' as any)}
                    >
                        <Text style={styles.upgradeText}>Upgrade</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Services</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>$1,240</Text>
                        <Text style={styles.statLabel}>Spent</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>150</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => router.push(item.route)}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.menuIcon}>
                                    <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <Ionicons name="log-out-outline" size={22} color={Colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.versionText}>Version 1.0.0</Text>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
    },
    profileCard: {
        backgroundColor: Colors.white,
        padding: 24,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    profileImageContainer: {
        position: "relative",
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: Colors.primary,
    },
    profilePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.background,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: Colors.border,
    },
    editButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: Colors.white,
    },
    profileName: {
        fontSize: 22,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 4,
    },
    profilePhone: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    editProfileButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    editProfileText: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.primary,
        marginLeft: 6,
    },
    membershipCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        margin: 16,
        padding: 16,
        backgroundColor: Colors.text,
        borderRadius: 16,
    },
    membershipLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    crownContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,184,0,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    membershipTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
    membershipSubtitle: {
        fontSize: 12,
        color: "rgba(255,255,255,0.7)",
    },
    upgradeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#FFB800",
        borderRadius: 20,
    },
    upgradeText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.text,
    },
    statsContainer: {
        flexDirection: "row",
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        marginTop: 10,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: Colors.border,
    },
    menuContainer: {
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: "500",
        color: Colors.text,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 16,
        padding: 16,
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginBottom: 16,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.error,
        marginLeft: 8,
    },
    versionText: {
        textAlign: "center",
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
})