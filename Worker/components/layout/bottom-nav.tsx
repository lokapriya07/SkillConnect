import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";

// Routes now match your file names exactly
type WorkerTabsRoutes = "index" | "search" | "jobs" | "profile";

type NavItem = {
  route: WorkerTabsRoutes;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

const navItems: NavItem[] = [
  { route: "index", label: "Home", icon: "home" },
  { route: "search", label: "Search", icon: "search" },
  { route: "jobs", label: "Jobs", icon: "briefcase" },
  { route: "profile", label: "Profile", icon: "user" },
];

export default function BottomNav() {
  const router = useRouter();
  const segments = useSegments();

  // Fix: Get the last segment and cast as string to compare safely
  const currentRoute = segments[segments.length - 1] as string;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {navItems.map((item) => {
          // Home is active if route is "index" or we are at the group root
          const isActive =
            currentRoute === item.route ||
            (item.route === "index" && currentRoute === "(worker-tabs)");

          return (
            <TouchableOpacity
              key={item.route}
              style={styles.tab}
              onPress={() => {
                // Navigate to the root for index, or the specific file for others
                const path = item.route === "index" ? "/(worker-tabs)" : `/(worker-tabs)/${item.route}`;
                router.push(path as any);
              }}
            >
              <Feather
                name={item.icon}
                size={22}
                color={isActive ? "#2563eb" : "#9ca3af"}
              />
              <Text style={[styles.label, { color: isActive ? "#2563eb" : "#9ca3af" }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    height: 60,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
});