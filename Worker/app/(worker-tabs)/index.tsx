// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Platform,
//   Switch,
//   Modal,
//   Alert,
//   ActivityIndicator,
//   LayoutAnimation,
//   RefreshControl,
//   FlatList,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { ProgressBar } from "@/components/dashboard/progress-bar";
// import { useAppStore } from "@/lib/store";
// import LocationScreen from "@/components/screens/location-screen";
// import * as Location from 'expo-location';

// export default function DashboardScreen() {
//   const router = useRouter();
//   const [isAvailable, setIsAvailable] = useState(true);
//   const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
//   const [workerName, setWorkerName] = useState("Worker");
//   const [refreshing, setRefreshing] = useState(false);

//   // --- NEW STATE FOR MATCHED JOBS ---
//   const [matchedJobs, setMatchedJobs] = useState([]);
//   const [loadingJobs, setLoadingJobs] = useState(true);
//   const handleIgnore = (jobId: string) => {
//     // Smooth animation
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

//     // Remove job from state
//     setMatchedJobs(prevJobs =>
//       prevJobs.filter((job: any) => job._id !== jobId)
//     );
//   };

//   const { currentLocation } = useAppStore();
//   const [profileCompletion, setProfileCompletion] = useState(0);


//   // Inside DashboardScreen.tsx

//   // 1. Unified load function
//   const initializeDashboard = async () => {
//     try {
//       setLoadingJobs(true);

//       // Get stored data
//       const savedName = await AsyncStorage.getItem("workerName");
//       const workerId = await AsyncStorage.getItem("userId") || await AsyncStorage.getItem("workerId");

//       if (savedName) setWorkerName(savedName);

//       if (workerId) {
//         // Fetch profile to check completion
//         const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/work/profile/${workerId}`);
//         const result = await response.json();

//         if (result.success && result.data) {
//           setWorkerName(result.data.name || "Worker");
//           // Update the completion state from backend
//           setProfileCompletion(result.data.completionPercentage || 0);
//         } else {
//           // NEW WORKER CASE: Profile not found or no percentage returned
//           setProfileCompletion(0);
//         }

//         // Fetch the jobs feed
//         await fetchMatchedJobs(workerId);
//       }
//     } catch (error) {
//       console.error("Dashboard Load Error:", error);
//       setProfileCompletion(0); // Default to 0 on error so card shows
//     } finally {
//       setLoadingJobs(false);
//     }
//   };

//   // 2. Single useEffect
//   useEffect(() => {
//     initializeDashboard();
//   }, []);

//   // 3. Update onRefresh to use the same logic
//   const onRefresh = React.useCallback(async () => {
//     setRefreshing(true);
//     await initializeDashboard();
//     setRefreshing(false);
//   }, []);

//   // --- FETCH JOBS FROM BACKEND ---
//   // Inside DashboardScreen.tsX
  

//   const JobLocationText = ({ jobLocation }: { jobLocation: any }) => {
//     const [address, setAddress] = useState("Loading...");

//     useEffect(() => {
//       const getAddress = async () => {
//         try {
//           // 1. Request Permission (Required for iOS/Android)
//           const { status } = await Location.requestForegroundPermissionsAsync();
//           if (status !== 'granted') {
//             setAddress("Permission denied");
//             return;
//           }

//           // 2. Validate Coordinates
//           // Backend stores as [longitude, latitude]
//           const coords = jobLocation?.coordinates;
//           if (!coords || coords.length < 2) {
//             setAddress("Unknown Location");
//             return;
//           }

//           const lng = coords[0];
//           const lat = coords[1];

//           // 3. Reverse Geocode
//           const result = await Location.reverseGeocodeAsync({
//             latitude: lat,
//             longitude: lng,
//           });

//           if (result && result.length > 0) {
//             const { name, city, district, region } = result[0];
//             // Create a readable string
//             const displayAddress = name || district || city || region || "Nearby";
//             setAddress(displayAddress);
//           } else {
//             setAddress("Area not found");
//           }
//         } catch (error) {
//           console.error("Reverse Geocode Error:", error);
//           setAddress("Location Error");
//         }
//       };

//       getAddress();
//     }, [jobLocation]);

//     return <Text style={styles.jobLocation} numberOfLines={1}>{address}</Text>;
//   };

//   const fetchMatchedJobs = async (workerId: string) => {
//     try {
//       setLoadingJobs(true);
      
//       // Fetch jobs feed
//       const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/worker-feed/${workerId}`);

//       if (response.ok) {
//         const data = await response.json();
        
//         // Also fetch worker's active bids to filter them out
//         try {
//           const bidsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bids/active/worker/${workerId}`);
//           const bidsData = await bidsResponse.json();
          
//           if (bidsData.success && bidsData.bids) {
//             // Get list of job IDs the worker has already bid on
//             const bidJobIds = new Set(
//               bidsData.bids
//                 .filter((bid: any) => bid.job && bid.job._id)
//                 .map((bid: any) => bid.job._id.toString())
//             );
            
//             // Filter out jobs the worker has already bid on
//             const filteredJobs = data.filter((job: any) => !bidJobIds.has(job._id.toString()));
//             setMatchedJobs(filteredJobs);
//           } else {
//             setMatchedJobs(data);
//           }
//         } catch (bidError) {
//           // If fetching bids fails, just show all jobs
//           console.error("Bid fetch error:", bidError);
//           setMatchedJobs(data);
//         }
//       }
//     } catch (error) {
//       console.error("Fetch error:", error);
//     } finally {
//       setLoadingJobs(false);
//     }
//   };

//   const handleLogout = async () => {
//     Alert.alert("Logout", "Are you sure you want to logout?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Logout",
//         style: "destructive",
//         onPress: async () => {
//           // Clear all user-specific data including verification status
//           await AsyncStorage.removeItem("workerName");
//           await AsyncStorage.removeItem("userId");
//           await AsyncStorage.removeItem('is_verified_worker');
//           await AsyncStorage.removeItem('verification_requested');
//           await AsyncStorage.removeItem("user");
//           router.replace("/auth/login");
//         },
//       },
//     ]);
//   };

//   return (
//     <ScrollView
//       contentContainerStyle={styles.container}
//       showsVerticalScrollIndicator={false}
//       // ADD THIS PROP HERE
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={onRefresh}
//           colors={["#3b82f6"]} // Android spinner color
//           tintColor="#3b82f6"   // iOS spinner color
//         />
//       }
//     >
    
//       {/* Real-Time Location Bar */}
//       <View style={styles.locationHeader}>
//         <View style={styles.locationRow}>
//           <Feather name="map-pin" size={16} color="#3b82f6" />
//           <Text style={styles.locationText} numberOfLines={1}>
//             {currentLocation?.address || "Set work location..."}
//           </Text>
//         </View>
//         <TouchableOpacity onPress={() => setIsLocationModalVisible(true)}>
//           <Text style={styles.changeText}>Change</Text>
//         </TouchableOpacity>
//       </View>

//       <Modal visible={isLocationModalVisible} animationType="slide" presentationStyle="pageSheet">
//         <LocationScreen onLocationSelected={() => setIsLocationModalVisible(false)} />
//       </Modal>

//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.rowBetween}>
//           <View>
//             <Text style={styles.title}>Welcome, {workerName}!</Text>
//             <Text style={styles.subtitle}>Tasks matching your skills appear below.</Text>
//           </View>
//           <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//             <Feather name="log-out" size={22} color="#ef4444" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Profile Completion */}
//       {profileCompletion < 100 && (
//         <View style={styles.profileCard}>
//           <View style={styles.rowBetween}>
//             <Text style={styles.cardTitle}>Profile Visibility</Text>
//             <Text style={styles.primaryText}>{profileCompletion}%</Text>
//           </View>
//           <ProgressBar value={profileCompletion} style={{ fillColor: "#3b82f6" }} />
//           <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/profile")}>
//             <Text style={styles.primaryButtonText}>Optimize Profile</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* New Job Requests - DYNAMIC SECTION */}
//       <Text style={styles.sectionHeading}>🔥 New Job Requests</Text>

//       {loadingJobs ? (
//         <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 20 }} />
//       ) : matchedJobs.length > 0 ? (
//         matchedJobs.map((job: any) => (
//           <View key={job._id} style={styles.jobCard}>
//             <View style={styles.rowBetween}>
//               <View style={{ flex: 1 }}>
//                 <View style={styles.jobInfoRow}>
//                   <Feather name="map-pin" size={14} color="#6b7280" />
//                   {/* Ensure you pass the whole location object */}
//                   <JobLocationText jobLocation={job.location} />
//                 </View>
//                 <View style={styles.jobInfoRow}>
//                   <Feather name="briefcase" size={14} color="#6b7280" />
//                   <Text style={styles.jobTitle} numberOfLines={2}>{job.description}</Text>
//                 </View>
//                 <View style={styles.tagRow}>
//                   {job.skillsRequired?.map((skill: string) => (
//                     <View key={skill} style={styles.skillBadge}>
//                       <Text style={styles.skillBadgeText}>{skill}</Text>
//                     </View>
//                   ))}
//                 </View>
//               </View>
//               <Text style={styles.priceText}>₹{job.budget}</Text>
//             </View>
//             <View style={styles.buttonGroup}>
//               <TouchableOpacity
//                 style={styles.secondaryButton}
//                 onPress={() => handleIgnore(job._id)}
//               >
//                 <Text style={styles.secondaryButtonText}>Ignore</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.acceptButton}
//                 onPress={() => router.push({
//                   pathname: "/work" as any, // Path to the new details screen
//                   params: { jobId: job._id }       // Passing the unique Job ID
//                 })}
//               >
//                 <Text style={styles.acceptText}>View & Bid</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))
//       ) : (
//             // Inside your jobs.length === 0 condition in the Frontend
//             <View style={styles.whiteCard}>
//               <Text style={styles.mutedText}>No jobs matching your specific skills nearby.</Text>
//               <TouchableOpacity onPress={() => router.push("/profile")}>
//                 <Text style={{ color: '#3b82f6', marginTop: 10 }}>Add more skills to your profile →</Text>
//               </TouchableOpacity>
//             </View>
//       )}

//       {/* <View style={styles.ongoingContainer}>
//         <Text style={styles.sectionTitle}>🔧 Ongoing Job</Text>
//         <View style={styles.activeJobInner}>
//           <View style={styles.rowBetween}>
//             <View>
//               <Text style={styles.customerName}>Rajesh Kumar</Text>
//               <Text style={styles.mutedText}>Plot 45, Gachibowli</Text>
//             </View>
//             <TouchableOpacity style={styles.mapButton}>
//               <Text style={styles.mapButtonText}>Map</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.buttonGroup}>
//             <TouchableOpacity style={styles.callButton}>
//               <Feather name="phone" size={16} color="#111827" />
//               <Text style={{ color: "#111827", fontWeight: "600" }}>Call</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.chatButton}>
//               <Feather name="message-circle" size={16} color="#111827" />
//               <Text style={{ color: "#111827", fontWeight: "600" }}>Chat</Text>
//             </TouchableOpacity>
//           </View>
//           <TouchableOpacity style={styles.completeButton}>
//             <Text style={styles.whiteBtnText}>Mark as Completed</Text>
//           </TouchableOpacity>
//         </View>
//       </View> */}

//       {/* Performance */}
//       <View style={styles.whiteCard}>
//         <Text style={styles.sectionTitle}>📊 Your Performance</Text>
//         <View style={styles.perfRow}>
//           <View style={styles.perfItem}>
//             <Feather name="star" size={18} color="#fbbf24" />
//             <Text style={styles.perfLabel}>Rating</Text>
//             <Text style={styles.perfValue}>4.7</Text>
//           </View>
//           <View style={styles.perfItem}>
//             <Feather name="briefcase" size={18} color="#6b7280" />
//             <Text style={styles.perfLabel}>Completed</Text>
//             <Text style={styles.perfValue}>42</Text>
//           </View>
//           <View style={styles.perfItem}>
//             <Feather name="clock" size={18} color="#10b981" />
//             <Text style={styles.perfLabel}>On-time</Text>
//             <Text style={styles.perfValue}>96%</Text>
//           </View>
//         </View>
//         <ProgressBar value={85} style={{ fillColor: "#10b981" }} />
//         <Text style={styles.perfHint}>Complete 8 more jobs to reach ⭐ 4.8</Text>
//       </View>

//       {/* Earnings */}
//       <View style={styles.whiteCard}>
//         <Text style={styles.sectionTitle}>💰 Earnings</Text>
//         <View style={styles.earningsGrid}>
//           <View style={styles.earningBox}>
//             <Text style={styles.mutedText}>Today</Text>
//             <Text style={styles.earningAmount}>₹900</Text>
//           </View>
//           <View style={styles.earningBox}>
//             <Text style={styles.mutedText}>This Week</Text>
//             <Text style={styles.earningAmount}>₹5,400</Text>
//           </View>
//         </View>

//         <TouchableOpacity style={styles.primaryActionButton}>
//           <Text style={styles.primaryActionText}>View Earnings Details</Text>
//           <Feather name="chevron-right" size={18} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Portfolio */}
//       <View style={styles.whiteCard}>
//         <TouchableOpacity style={styles.primaryActionButton}>
//           <Feather name="camera" size={18} color="#fff" />
//           <Text style={styles.primaryActionText}>Add Work Photos</Text>
//         </TouchableOpacity>
//       </View>

//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, gap: 20, backgroundColor: "#f3f4f6", paddingBottom: 60 },
//   header: { marginBottom: 4 },
//   title: { fontSize: 22, fontWeight: "700", color: "#111827" },
//   subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
//   locationHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },
//   locationRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
//   locationText: { fontSize: 14, fontWeight: "600", color: "#374151" },
//   changeText: { fontSize: 12, color: "#3b82f6", fontWeight: "700", marginLeft: 10 },
//   logoutBtn: { padding: 8, backgroundColor: "#fee2e2", borderRadius: 10 },
//   profileCard: { backgroundColor: "#eff6ff", borderRadius: 16, padding: 16, gap: 12 },
//   cardTitle: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
//   primaryText: { color: "#3b82f6", fontWeight: "700" },
//   mutedText: { fontSize: 13, color: "#6b7280" },
//   primaryButton: { backgroundColor: "#3b82f6", padding: 12, borderRadius: 10, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 4 },
//   primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
//   rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   statusCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
//   sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
//   statusIndicator: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
//   dot: { width: 8, height: 8, borderRadius: 4 },
//   statusText: { fontSize: 15, fontWeight: "600" },
//   sectionHeading: { fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 8 },
//   jobCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }) },
//   jobInfoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
//   jobLocation: { fontWeight: "700", fontSize: 15, color: "#1f2937" },
//   jobTitle: { fontSize: 14, color: "#4b5563" },
//   urgencyText: { fontSize: 13, color: "#d97706", fontWeight: "600" },
//   priceText: { fontSize: 22, fontWeight: "800", color: "#111827" },
//   buttonGroup: { flexDirection: "row", gap: 10, marginTop: 12 },
//   acceptButton: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#3b82f6", alignItems: "center" },
//   acceptText: { fontWeight: "600", color: "#fff" },
//   ongoingContainer: { backgroundColor: "#ecf2ff", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#dbeafe" },
//   activeJobInner: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginTop: 12 },
//   customerName: { fontSize: 16, fontWeight: "700", color: "#111827" },
//   mapButton: { backgroundColor: "#3b82f6", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
//   mapButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
//   callButton: { flex: 1, backgroundColor: "#e5e7eb", flexDirection: "row", gap: 8, padding: 10, borderRadius: 8, justifyContent: "center", alignItems: "center" },
//   chatButton: { flex: 1, backgroundColor: "#e5e7eb", flexDirection: "row", gap: 8, padding: 10, borderRadius: 8, justifyContent: "center", alignItems: "center" },
//   completeButton: { backgroundColor: "#3b82f6", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
//   whiteBtnText: { color: "#fff", fontWeight: "600" },
//   whiteCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }, android: { elevation: 2 } }) },
//   perfRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 16 },
//   perfItem: { alignItems: "center", gap: 4 },
//   perfLabel: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
//   perfValue: { fontSize: 18, fontWeight: "700", color: "#111827" },
//   perfHint: { fontSize: 12, color: "#6b7280", textAlign: "center", marginTop: 8, fontStyle: "italic" },
//   earningsGrid: { flexDirection: "row", gap: 12, marginVertical: 16 },
//   earningBox: { flex: 1, backgroundColor: "#f9fafb", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#f3f4f6" },
//   earningAmount: { fontSize: 20, fontWeight: "800", color: "#111827", marginTop: 4 },
//   mutedSmall: { fontSize: 12, color: "#9ca3af", fontWeight: "400" },
//   primaryActionButton: {
//     backgroundColor: "#3b82f6",
//     padding: 14,
//     borderRadius: 12,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//   },
//   primaryActionText: { color: "#fff", fontWeight: "700" },
//   secondaryButton: {
//     flex: 1,
//     backgroundColor: "#7386ae",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//   },
//   secondaryButtonText: { color: "#111827", fontWeight: "600" },
//   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
//   skillBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#dbeafe' },
//   skillBadgeText: { fontSize: 10, color: '#3b82f6', fontWeight: '700', textTransform: 'capitalize' },
// });


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { useAppStore } from "@/lib/store";
import LocationScreen from "@/components/screens/location-screen";
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [workerName, setWorkerName] = useState("Worker");
  const [refreshing, setRefreshing] = useState(false);

  // --- NEW STATE FOR MATCHED JOBS ---
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  
  const handleIgnore = (jobId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMatchedJobs(prevJobs =>
      prevJobs.filter((job: any) => job._id !== jobId)
    );
  };

  const { currentLocation } = useAppStore();
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Inside DashboardScreen.tsx

  // 1. Unified load function
  const initializeDashboard = async () => {
    try {
      setLoadingJobs(true);

      // Get stored data
      const savedName = await AsyncStorage.getItem("workerName");
      const workerId = await AsyncStorage.getItem("userId") || await AsyncStorage.getItem("workerId");

      if (savedName) setWorkerName(savedName);

      if (workerId) {
        // Fetch profile to check completion
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/work/profile/${workerId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setWorkerName(result.data.name || "Worker");
          // Update the completion state from backend
          setProfileCompletion(result.data.completionPercentage || 0);
        } else {
          // NEW WORKER CASE: Profile not found or no percentage returned
          setProfileCompletion(0);
        }

        // Fetch the jobs feed
        await fetchMatchedJobs(workerId);
      }
    } catch (error) {
      console.error("Dashboard Load Error:", error);
      setProfileCompletion(0); // Default to 0 on error so card shows
    } finally {
      setLoadingJobs(false);
    }
  };

  // 2. Single useEffect
  useEffect(() => {
    initializeDashboard();
  }, []);

  // 3. Update onRefresh to use the same logic
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
  }, []);

  // --- FETCH JOBS FROM BACKEND ---
  // Inside DashboardScreen.tsX
  

  const JobLocationText = ({ jobLocation }: { jobLocation: any }) => {
    const [address, setAddress] = useState("Loading...");

    useEffect(() => {
      const getAddress = async () => {
        try {
          // 1. Request Permission (Required for iOS/Android)
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setAddress("Permission denied");
            return;
          }

          // 2. Validate Coordinates
          // Backend stores as [longitude, latitude]
          const coords = jobLocation?.coordinates;
          if (!coords || coords.length < 2) {
            setAddress("Unknown Location");
            return;
          }

          const lng = coords[0];
          const lat = coords[1];

          // 3. Reverse Geocode
          const result = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lng,
          });

          if (result && result.length > 0) {
            const { name, city, district, region } = result[0];
            // Create a readable string
            const displayAddress = name || district || city || region || "Nearby";
            setAddress(displayAddress);
          } else {
            setAddress("Area not found");
          }
        } catch (error) {
          console.error("Reverse Geocode Error:", error);
          setAddress("Location Error");
        }
      };

      getAddress();
    }, [jobLocation]);

    return <Text style={styles.jobLocation} numberOfLines={1}>{address}</Text>;
  };

  const fetchMatchedJobs = async (workerId: string) => {
    try {
      setLoadingJobs(true);
      
      // Fetch jobs feed
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/worker-feed/${workerId}`);

      if (response.ok) {
        const data = await response.json();
        
        // Also fetch worker's active bids to filter them out
        try {
          const bidsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/bids/active/worker/${workerId}`);
          const bidsData = await bidsResponse.json();
          
          if (bidsData.success && bidsData.bids) {
            // Get list of job IDs the worker has already bid on
            const bidJobIds = new Set(
              bidsData.bids
                .filter((bid: any) => bid.job && bid.job._id)
                .map((bid: any) => bid.job._id.toString())
            );
            
            // Filter out jobs the worker has already bid on
            const filteredJobs = data.filter((job: any) => !bidJobIds.has(job._id.toString()));
            setMatchedJobs(filteredJobs);
          } else {
            setMatchedJobs(data);
          }
        } catch (bidError) {
          // If fetching bids fails, just show all jobs
          console.error("Bid fetch error:", bidError);
          setMatchedJobs(data);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // Clear all user-specific data including verification status
          await AsyncStorage.removeItem("workerName");
          await AsyncStorage.removeItem("userId");
          await AsyncStorage.removeItem('is_verified_worker');
          await AsyncStorage.removeItem('verification_requested');
          await AsyncStorage.removeItem("user");
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#6366f1"]}
          tintColor="#6366f1"
        />
      }
    >
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.premiumHeader}
      >
        {/* Real-Time Location Bar */}
        <View style={styles.locationHeader}>
          <View style={styles.locationRow}>
            <View style={styles.locationIconContainer}>
              <Feather name="map-pin" size={14} color="#6366f1" />
            </View>
            <Text style={styles.locationText} numberOfLines={1}>
              {currentLocation?.address || "Set work location..."}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsLocationModalVisible(true)}
            style={styles.changeButton}
          >
            <Text style={styles.changeText}>Change</Text>
            <Feather name="chevron-right" size={14} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.welcomeName}>{workerName}</Text>
            <Text style={styles.welcomeSubtitle}>Ready for work? New jobs await!</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Feather name="log-out" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Availability Toggle */}
        <View style={styles.availabilityContainer}>
          <View style={styles.availabilityLeft}>
            <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#10b981' : '#ef4444' }]} />
            <Text style={styles.availabilityText}>
              {isAvailable ? 'Available for work' : 'Not available'}
            </Text>
          </View>
          
        </View>
      </LinearGradient>

      <Modal visible={isLocationModalVisible} animationType="slide" presentationStyle="pageSheet">
        <LocationScreen onLocationSelected={() => setIsLocationModalVisible(false)} />
      </Modal>

      {/* Profile Completion Card - Premium Version */}
      {profileCompletion < 100 && (
        <View style={styles.profileCard}>
          <View style={styles.profileCardHeader}>
            <View style={styles.profileTitleContainer}>
              <View style={styles.profileIconContainer}>
                <Feather name="user-check" size={16} color="#6366f1" />
              </View>
              <Text >Profile Strength</Text>
            </View>
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>{profileCompletion}%</Text>
            </View>
          </View>
          <ProgressBar value={profileCompletion} style={{ fillColor: "#6366f1", height: 8, borderRadius: 4 }} />
          <Text style={styles.profileHint}>
            {profileCompletion < 50 ? 'Complete your profile to get more jobs' : 'Almost there! Add more details'}
          </Text>
          <TouchableOpacity 
            style={styles.optimizeButton} 
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <Text style={styles.optimizeButtonText}>Optimize Profile</Text>
            <Feather name="arrow-right" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* New Job Requests - Premium Section */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIconContainer}>
            <FontAwesome5 name="fire" size={16} color="#6366f1" />
          </View>
          <Text style={styles.sectionHeading}>New Job Requests</Text>
        </View>
        {matchedJobs.length > 0 && (
          <Text style={styles.sectionCount}>{matchedJobs.length} available</Text>
        )}
      </View>

      {loadingJobs ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Finding best matches for you...</Text>
        </View>
      ) : matchedJobs.length > 0 ? (
        matchedJobs.map((job: any, index: number) => (
          <View key={job._id} style={[styles.jobCard, index === 0 && styles.firstJobCard]}>
            <LinearGradient
              colors={['#ffffff', '#fafafa']}
              style={styles.jobCardGradient}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobTypeContainer}>
                  <View style={styles.jobTypeDot} />
                  <Text style={styles.jobTypeText}>New Match</Text>
                </View>
                <Text style={styles.priceText}>₹{job.budget}</Text>
              </View>

              <View style={styles.jobDetails}>
                <View style={styles.jobInfoRow}>
                  <View style={styles.jobInfoIcon}>
                    <Feather name="map-pin" size={12} color="#6366f1" />
                  </View>
                  <JobLocationText jobLocation={job.location} />
                </View>
                
                <View style={styles.jobInfoRow}>
                  <View style={styles.jobInfoIcon}>
                    <Feather name="briefcase" size={12} color="#6366f1" />
                  </View>
                  <Text style={styles.jobTitle} numberOfLines={2}>{job.description}</Text>
                </View>
              </View>

              <View style={styles.tagRow}>
                {job.skillsRequired?.slice(0, 3).map((skill: string) => (
                  <View key={skill} style={styles.skillBadge}>
                    <Text style={styles.skillBadgeText}>{skill}</Text>
                  </View>
                ))}
                {job.skillsRequired?.length > 3 && (
                  <View style={styles.skillBadge}>
                    <Text style={styles.skillBadgeText}>+{job.skillsRequired.length - 3}</Text>
                  </View>
                )}
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => handleIgnore(job._id)}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={16} color="#64748b" />
                  <Text style={styles.secondaryButtonText}>Ignore</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => router.push({
                    pathname: "/work" as any,
                    params: { jobId: job._id }
                  })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.acceptText}>View & Bid</Text>
                  <Feather name="chevron-right" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        ))
      ) : (
        <View style={styles.emptyStateCard}>
          <View style={styles.emptyStateIconContainer}>
            <Feather name="search" size={32} color="#94a3b8" />
          </View>
          <Text style={styles.emptyStateTitle}>No matching jobs found</Text>
          <Text style={styles.emptyStateText}>
            We couldn't find jobs matching your skills. Update your profile to get better matches.
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.emptyStateButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Performance & Earnings Section - Premium Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#fbbf24', '#f59e0b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}
          >
            <View style={styles.statIconContainer}>
              <Feather name="star" size={20} color="#ffffff" />
            </View>
            <Text style={styles.statValue}>4.7</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#6366f1', '#4f46e5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}
          >
            <View style={styles.statIconContainer}>
              <Feather name="briefcase" size={20} color="#ffffff" />
            </View>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradient}
          >
            <View style={styles.statIconContainer}>
              <Feather name="clock" size={20} color="#ffffff" />
            </View>
            <Text style={styles.statValue}>96%</Text>
            <Text style={styles.statLabel}>On-time</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Earnings Card */}
      <View style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <View style={styles.earningsTitleContainer}>
            <View style={styles.earningsIconContainer}>
              <Feather name="dollar-sign" size={16} color="#6366f1" />
            </View>
            <Text style={styles.earningsTitle}>Earnings Overview</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.earningsGrid}>
          <View style={styles.earningBox}>
            <Text style={styles.earningLabel}>Today</Text>
            <Text style={styles.earningAmount}>₹900</Text>
            <Text style={styles.earningTrend}>+12%</Text>
          </View>
          <View style={styles.earningBox}>
            <Text style={styles.earningLabel}>This Week</Text>
            <Text style={styles.earningAmount}>₹5,400</Text>
            <Text style={styles.earningTrend}>+8%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>View Detailed Earnings</Text>
          <Feather name="arrow-right" size={16} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Portfolio Card */}
      <TouchableOpacity style={styles.portfolioCard} activeOpacity={0.7}>
        <LinearGradient
          colors={['#f8fafc', '#f1f5f9']}
          style={styles.portfolioGradient}
        >
          <View style={styles.portfolioContent}>
            <View style={styles.portfolioIconContainer}>
              <Feather name="camera" size={24} color="#6366f1" />
            </View>
            <View style={styles.portfolioTextContainer}>
              <Text style={styles.portfolioTitle}>Showcase Your Work</Text>
              <Text style={styles.portfolioSubtitle}>Add photos to get more clients</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94a3b8" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingBottom: 60, 
    backgroundColor: "#f8fafc",
  },
  premiumHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
  },
  locationRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    flex: 1 
  },
  locationIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(99,102,241,0.2)",
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#ffffff",
    opacity: 0.9,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  changeText: { 
    fontSize: 12, 
    color: "#ffffff", 
    fontWeight: "600",
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
  },
  logoutBtn: { 
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(239,68,68,0.1)",
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: -20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  profileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  profileHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 16,
  },
  optimizeButton: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  optimizeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionCount: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  jobCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  firstJobCard: {
    marginTop: 4,
  },
  jobCardGradient: {
    borderRadius: 24,
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  jobTypeText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  jobDetails: {
    gap: 8,
    marginBottom: 12,
  },
  jobInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobInfoIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  jobTitle: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  skillBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  skillBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    flex: 1.5,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  emptyStateCard: {
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyStateButton: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  emptyStateButtonText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  earningsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  earningsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  seeAllText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  earningBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  earningLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  earningAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  earningTrend: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },
  portfolioCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  portfolioGradient: {
    padding: 20,
  },
  portfolioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  portfolioIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioTextContainer: {
    flex: 1,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  portfolioSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
}); 