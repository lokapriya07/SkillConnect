// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Switch,
//   TouchableOpacity,
//   Image,
//   FlatList,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// const SETTINGS_ITEMS = [
//   { id: "1", title: "Edit Profile", icon: "create-outline", screen: "EditProfileScreen" },
//   { id: "2", title: "Change Password", icon: "key-outline", screen: "ChangePasswordScreen" },
//   { id: "3", title: "Notifications", icon: "notifications-outline", screen: "NotificationsScreen" },
//   { id: "4", title: "Privacy Policy", icon: "lock-closed-outline", screen: "PrivacyPolicyScreen" },
//   { id: "5", title: "Help & Support", icon: "help-circle-outline", screen: "HelpScreen" },
//   { id: "6", title: "About App", icon: "information-circle-outline", screen: "AboutScreen" },
// ];

// export default function Settings({ navigation }: any) {
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

//   const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
//   const toggleNotifications = () => setIsNotificationsEnabled((prev) => !prev);

//   const renderItem = ({ item }: any) => (
//     <TouchableOpacity
//       style={styles.optionContainer}
//       onPress={() => navigation.navigate(item.screen)}
//     >
//       <View style={styles.optionLeft}>
//         <Ionicons name={item.icon} size={24} color={isDarkMode ? "#fff" : "#555"} />
//         <Text style={[styles.optionText, { color: isDarkMode ? "#fff" : "#000" }]}>
//           {item.title}
//         </Text>
//       </View>
//       <Ionicons name="chevron-forward-outline" size={20} color={isDarkMode ? "#fff" : "#999"} />
//     </TouchableOpacity>
//   );

//   return (
//     <View style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#fff" }]}>
//       {/* User Info */}
//       <View style={styles.userInfo}>
//         <Image
//           source={{ uri: "https://i.pravatar.cc/100" }}
//           style={styles.avatar}
//         />
//         <View>
//           <Text style={[styles.userName, { color: isDarkMode ? "#fff" : "#000" }]}>
//             John Doe
//           </Text>
//           <Text style={[styles.userEmail, { color: isDarkMode ? "#ccc" : "#666" }]}>
//             john.doe@example.com
//           </Text>
//         </View>
//       </View>

//       {/* Settings List */}
//       <FlatList
//         data={SETTINGS_ITEMS}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: isDarkMode ? "#333" : "#ddd" }]} />}
//         contentContainerStyle={{ marginTop: 20 }}
//       />

//       {/* Toggles */}
//       <View style={styles.toggleWrapper}>
//         <View style={styles.toggleContainer}>
//           <Text style={[styles.toggleText, { color: isDarkMode ? "#fff" : "#000" }]}>
//             Dark Mode
//           </Text>
//           <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
//         </View>
//         <View style={styles.toggleContainer}>
//           <Text style={[styles.toggleText, { color: isDarkMode ? "#fff" : "#000" }]}>
//             Notifications
//           </Text>
//           <Switch value={isNotificationsEnabled} onValueChange={toggleNotifications} />
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   userInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 30,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//   },
//   avatar: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     marginRight: 15,
//   },
//   userName: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   userEmail: {
//     fontSize: 14,
//     marginTop: 4,
//   },
//   optionContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 15,
//   },
//   optionLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   optionText: {
//     fontSize: 16,
//     marginLeft: 15,
//   },
//   separator: {
//     height: 1,
//   },
//   toggleWrapper: {
//     marginTop: 30,
//     borderTopWidth: 1,
//     borderTopColor: "#ddd",
//     paddingTop: 20,
//   },
//   toggleContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 15,
//   },
//   toggleText: {
//     fontSize: 16,
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SectionList,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// Refined Data Structure with Icons
const SETTINGS_SECTIONS = [
  {
    title: "Preferences",
    data: [
      { id: "darkMode", title: "Dark Mode", type: "toggle", icon: "moon-outline", color: "#5856D6" },
      { id: "notifications", title: "Notifications", type: "toggle", icon: "notifications-outline", color: "#FF9500" },
      { id: "autoUpdate", title: "Auto Update", type: "toggle", icon: "sync-outline", color: "#32ADE6" },
    ],
  },
  {
    title: "Legal",
    data: [
      { id: "privacy", title: "Privacy Policy", type: "link", icon: "shield-checkmark-outline", color: "#34C759" },
      { id: "terms", title: "Terms of Service", type: "link", icon: "document-text-outline", color: "#AF52DE" },
    ],
  },
  {
    title: "Support",
    data: [{ id: "contact", title: "Contact Support", type: "link", icon: "mail-outline", color: "#007AFF" }],
  },
];

export default function Settings() {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoUpdate: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("appSettings");
        if (saved) setSettings(JSON.parse(saved));
      } catch (e) {
        console.log("Error loading settings", e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("appSettings", JSON.stringify(settings));
  }, [settings]);

  const handleToggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const theme = {
    background: settings.darkMode ? "#000000" : "#F2F2F7",
    card: settings.darkMode ? "#1C1C1E" : "#FFFFFF",
    text: settings.darkMode ? "#FFFFFF" : "#000000",
    subtext: settings.darkMode ? "#8E8E93" : "#8E8E93",
    separator: settings.darkMode ? "#38383A" : "#C6C6C8",
  };

  const renderItem = ({ item, index, section }: any) => {
    const isFirst = index === 0;
    const isLast = index === section.data.length - 1;

    return (
      <View style={[
        styles.itemWrapper, 
        { backgroundColor: theme.card },
        isFirst && styles.roundedTop,
        isLast && styles.roundedBottom
      ]}>
        <View style={styles.itemContainer}>
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={18} color="#FFF" />
          </View>
          
          <Text style={[styles.optionText, { color: theme.text }]}>{item.title}</Text>

          {item.type === "toggle" ? (
            <Switch
              trackColor={{ false: "#767577", true: "#34C759" }}
              thumbColor="#f4f3f4"
              value={settings[item.id as keyof typeof settings]}
              onValueChange={() => handleToggle(item.id)}
            />
          ) : (
            <TouchableOpacity 
                onPress={() => Alert.alert(item.title, `Navigating to ${item.title}...`)}
                hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
            </TouchableOpacity>
          )}
        </View>
        {!isLast && <View style={[styles.separator, { backgroundColor: theme.separator }]} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={settings.darkMode ? "light-content" : "dark-content"} />
      
      <SectionList
        sections={SETTINGS_SECTIONS}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: theme.subtext }]}>{title}</Text>
        )}
        ListHeaderComponent={() => (
          <Text style={[styles.header, { color: theme.text }]}>Settings</Text>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.subtext }]}>App Version 1.0.0</Text>
            <Text style={[styles.footerText, { color: theme.subtext }]}>Made with ❤️ in React Native</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { fontSize: 34, fontWeight: "800", marginVertical: 20, letterSpacing: 0.35 },
  sectionHeader: { 
    fontSize: 13, 
    textTransform: "uppercase", 
    marginBottom: 8, 
    marginTop: 24, 
    marginLeft: 10,
    fontWeight: "500" 
  },
  itemWrapper: { paddingHorizontal: 16 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionText: { flex: 1, fontSize: 17, letterSpacing: -0.4 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 45 },
  roundedTop: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  roundedBottom: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  footer: { marginTop: 40, alignItems: "center" },
  footerText: { fontSize: 13, marginBottom: 4 },
});