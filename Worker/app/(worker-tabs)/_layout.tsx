import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";

export default function WorkerTabsLayout() {
  return (
    <View style={styles.container}>
      {/* 1. Global Header */}
      <Header />

      {/* 2. Main Content Area */}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" }, // Hide default system tabs
          }}
        >
          {/* name="index" matches index.tsx (Home) */}
          <Tabs.Screen name="index" options={{ title: "Home" }} />
          {/* name="earnings" matches earnings.tsx */}
          <Tabs.Screen name="search" options={{ title: "Search" }} />
           <Tabs.Screen name="jobs" options={{ title: "Jobs" }} />
          {/* name="profile" matches profile.tsx */}
          <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </Tabs>
      </View>

      {/* 3. Custom Bottom Navigation */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});