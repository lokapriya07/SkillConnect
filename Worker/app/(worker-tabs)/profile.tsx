import React, { useState,useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import * as Location from 'expo-location';
import {
  MapPin,
  X,
  Save,
  Star,
  User,
  Shield,
  Briefcase,
  ChevronDown,
  Search,
  Clock,
  Edit2,
  Globe,
  Navigation,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  LogOut,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");

const allSkills = [
  "Appliance Repair", "Beauty & Makeup", "Carpentry", "Cleaning",
  "Cooking/Maid", "Electrical", "Gardening", "Haircut & Styling",
  "HVAC", "Interior Design", "Landscaping", "Maid Service", "Moving Services",
  "Painting", "Pest Control", "Pet Grooming", "Plumbing",
  "Roofing", "Security Installation", "Tailoring", "Yoga Trainer"
].sort();

const allLanguages = [
  "Arabic", "Bengali", "Chinese", "Dutch", "English", "French", "German",
  "Greek", "Hindi", "Italian", "Japanese", "Korean", "Mandarin", "Portuguese",
  "Russian", "Spanish", "Telugu", "Turkish", "Vietnamese"
].sort();

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const reviewsData = [
  {
    id: 1,
    user: "Anjali Sharma",
    rating: 5,
    comment: "Very professional and fixed the issue quickly. Highly recommended!",
    date: "2 days ago",
    verified: true,
  },
  {
    id: 2,
    user: "Rahul Verma",
    rating: 4,
    comment: "Good work, arrived on time. Pricing was fair.",
    date: "1 week ago",
    verified: true,
  },
  {
    id: 3,
    user: "Sneha Patel",
    rating: 5,
    comment: "Excellent service. Clean work and explained everything clearly.",
    date: "3 weeks ago",
    verified: false,
  },
];



export default function ProfilePage({ navigation }: any) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // --- NEW VERIFICATION STATES ---
  
  const [aadhaarUploaded, setAadhaarUploaded] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  // Add these to your state declarations at the top of ProfilePage
  const [activePortfolioTab, setActivePortfolioTab] = useState('all'); // 'all', 'before-after', 'videos'
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "Plumbing",
    isBeforeAfter: false,
  });
  // Mock Data for Portfolio
  const portfolioImages = [
    { id: 1, uri: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400', category: 'Electrical' },
    { id: 2, uri: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', category: 'Plumbing' },
    { id: 3, uri: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400', category: 'HVAC' },
    { id: 4, uri: 'https://images.unsplash.com/photo-1595841055310-448761131ef3?w=400', category: 'Repair' },
    { id: 5, uri: 'https://images.unsplash.com/photo-1517646288029-bbad62349e10?w=400', category: 'Plumbing' },
    { id: 6, uri: 'https://images.unsplash.com/photo-1542013109-772985333f2c?w=400', category: 'Tools' },
  ];
  // Form State - Centralized
  const [profileData, setProfileData] = useState({
    name: "",
    title: "",
    bio: "",
    address: "",
    city: "",
    latitude: null as number | null,
    longitude: null as number | null,
    state: "",
    zip: "",
    radius: "25 miles",
    hourlyRate: "",
    minHours: "",
    startTime: "09:00",
    endTime: "18:00",
    isAvailable: true,
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([]);

  // 2. Fetch existing profile on mount (Fixed useEffect)
  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (!storedId) return;

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/work/profile/${storedId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setProfileData({
            name: result.data.name || "",
            title: result.data.title || "",
            bio: result.data.bio || "",
            address: result.data.address || "",
            city: result.data.city || "",
            latitude: result.data.location?.coordinates[1] || null,
            longitude: result.data.location?.coordinates[0] || null,
            state: result.data.state || "",
            zip: result.data.zip || "",
            radius: result.data.radius || "25 miles",
            hourlyRate: result.data.hourlyRate?.toString() || "",
            minHours: result.data.minHours?.toString() || "",
            startTime: result.data.startTime || "09:00",
            endTime: result.data.endTime || "18:00",
            isAvailable: result.data.isAvailable ?? true,
          });
          setSelectedSkills(result.data.skills || []);
          setSelectedLanguages(result.data.languages || []);
          setWorkingDays(result.data.workingDays || []);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };
    const loadVerificationStatus = async () => {
      try {
        const isVerified = await AsyncStorage.getItem('is_verified_worker');
        const hasRequested = await AsyncStorage.getItem('verification_requested');

        if (isVerified === 'true') {
          setVerificationStatus('verified');
        } else if (hasRequested === 'true') {
          setVerificationStatus('pending');
        } else {
          setVerificationStatus('not_submitted'); // Explicitly set for new workers
        }
      } catch (e) {
        setVerificationStatus('not_submitted');
      }
    };
    loadVerificationStatus();

    fetchExistingProfile();
  }, []);

  // UI States
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [langSearch, setLangSearch] = useState("");
  const [aadhaarLastFour, setAadhaarLastFour] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedCat, setSelectedCat] = useState("Plumber");

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // IMPORTANT: Clear verification flags on logout 
            // so the next user starts fresh
            await AsyncStorage.removeItem('is_verified_worker');
            await AsyncStorage.removeItem('verification_requested');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('user');

            router.replace("/auth/login");
          } catch (error) {
            console.error("Logout Error:", error);
          }
        }
      }
    ]);
  };
  
  const [verificationStatus, setVerificationStatus] = useState('not_submitted');
  const tabs = [
    { value: "profile", label: "Profile", icon: User },
    // Only include Verification if the status is NOT 'verified'
    ...(verificationStatus !== 'verified'
      ? [{ value: "verification", label: "Verification", icon: Shield }]
      : []),
    { value: "portfolio", label: "Portfolio", icon: Briefcase },
    { value: "reviews", label: "Reviews", icon: Star },
  ];
  const handleRequestVerification = async () => {
    if (consentChecked && experience && aadhaarLastFour.length === 4) {
      try {
        // 1. Update local UI state in ProfilePage
        setVerificationStatus('pending');

        // 2. Persist to storage so the Header can see the "Pending" status
        await AsyncStorage.setItem('verification_requested', 'true');

        Alert.alert("Request Sent", "A verification executive will be assigned soon.");
      } catch (error) {
        console.error("Storage Error:", error);
        Alert.alert("Error", "Could not save verification request.");
      }
    } else {
      Alert.alert("Missing Info", "Please fill all mandatory fields and give consent.");
    }
  };
  // 2. CALL THIS when the [Dev Only] Complete Verification button is clicked
  const handleCompleteVerification = async () => {
    try {
      setVerificationStatus('verified'); // Local UI update
      await AsyncStorage.setItem('is_verified_worker', 'true'); // Persistent Header update

      // Auto-switch to profile tab so the verification tab can disappear
      setActiveTab('profile');

      Alert.alert("Verified!", "You are now a trusted worker.");
    } catch (error) {
      console.error(error);
    }
  };
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const handleSave = async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');
      if (!storedId) {
        Alert.alert("Error", "User session not found. Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/work/profile/${storedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          skills: selectedSkills,
          languages: selectedLanguages,
          workingDays: workingDays,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // --- NEW LOGIC TO SAVE WORKER ID ---
        // The backend returns the worker object in result.data
        const workerProfileId = result.data._id;

        // Get current user object from storage to append the new ID
        const existingUserData = await AsyncStorage.getItem("user");
        let userObj = existingUserData ? JSON.parse(existingUserData) : {};

        // Update the object with the specific Worker Profile ID
        userObj.workerProfileId = workerProfileId;

        // Save it back so the Job Details page can use it for bidding
        await AsyncStorage.setItem("user", JSON.stringify(userObj));
        // -----------------------------------

        Alert.alert("Success", "Profile updated successfully!");
        setIsEditing(false);
      } else {
        Alert.alert("Update Failed", result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  const handleGetLocation = async () => {
    try {
      // 1. Request Permission
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied. Please enable it in settings."
        );
        return;
      }

      // 2. Get Current Position
      // 'accuracy' can be adjusted: Balanced is usually best for addresses
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // 3. Reverse Geocode (Convert lat/long to Address)
      let addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];

        // 4. Update the profile data state
        setProfileData({
          ...profileData,
          latitude: latitude, // Add these temporary keys
          longitude: longitude,
          address: `${addr.name || ''} ${addr.street || ''}`.trim() || "Current Location",
          city: addr.city || addr.district || "",
          state: addr.region || "", // region usually returns the State/Province
          zip: addr.postalCode || ""
        });

        Alert.alert("Success", "Location updated from GPS!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch location. Please check your GPS settings.");
    }
  };

  const TabButton = ({ value, label, icon: Icon }: any) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === value && styles.tabButtonActive]}
      onPress={() => setActiveTab(value)}
    >
      <Icon size={16} color={activeTab === value ? "#2563eb" : "#64748b"} />
      <Text style={[styles.tabText, activeTab === value && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  // --- VIEW MODE ---
  if (!isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.viewHeader}>
            <View style={styles.avatarCircleLarge}><Text style={styles.avatarInitials}>JD</Text></View>
            <Text style={styles.userName}>{profileData.name} {verificationStatus === 'verified' && <CheckCircle2 size={20} color="#22c55e" />}</Text>
            <Text style={styles.userSubTitle}>{profileData.title}</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editFloatingBtn}>
              <Edit2 size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionHeader}>About</Text>
            <Text style={styles.aboutText}>{profileData.bio}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Services & Rates</Text>
            <View style={styles.skillsRow}>
              {selectedSkills.map(s => (
                <View key={s} style={styles.viewSkillBadge}>
                  <Text style={styles.viewSkillText}>{s}</Text>
                </View>

              ))}
            </View>
            <Text style={styles.viewDetailText}>Hourly Rate: ${profileData.hourlyRate}</Text>
            <Text style={styles.viewDetailText}>Min Hours: {profileData.minHours}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Location & Availability</Text>
            <Text style={styles.viewDetailText}>{profileData.address}, {profileData.city}</Text>
            <Text style={styles.viewDetailText}>Days: {workingDays.join(", ")}</Text>
            <Text style={styles.viewDetailText}>Time: {profileData.startTime} - {profileData.endTime}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={18} color="#ef4444" />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- EDIT MODE ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">

          <View style={styles.headerSection}>
            <View style={styles.avatarCircle}><Text style={styles.avatarInitials}>JD</Text></View>
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{profileData.name}</Text>
              <Text style={styles.userSubTitle}>Profile Editing Mode</Text>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              {/* Map through the dynamic tabs array */}
              {tabs.map((tab) => (
                <TabButton
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={tab.icon}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.tabContent}>

            {/* PROFILE TAB CONTENT */}
            {activeTab === "profile" && (
              <>
                {/* 1. Basic Info */}
                <View style={styles.card}>
                  <Text style={styles.sectionHeader}>Basic Information</Text>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>Display Name</Text>
                    <TextInput style={styles.input} value={profileData.name} onChangeText={(t) => setProfileData({ ...profileData, name: t })} />
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>Professional Title</Text>
                    <TextInput style={styles.input} value={profileData.title} onChangeText={(t) => setProfileData({ ...profileData, title: t })} />
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput style={[styles.input, styles.textArea]} multiline value={profileData.bio} onChangeText={(t) => setProfileData({ ...profileData, bio: t })} />
                  </View>
                </View>

                {/* 2. Location */}
                <View style={styles.card}>
                  <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
                    <Text style={styles.sectionHeader}>Location</Text>
                    <TouchableOpacity onPress={handleGetLocation} style={styles.gpsBtn}>
                      <Navigation size={14} color="#2563eb" />
                      <Text style={styles.gpsBtnText}>Use GPS</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>Address</Text>
                    <View style={styles.inputIconRow}>
                      <MapPin size={18} color="#94a3b8" style={styles.innerIcon} />
                      <TextInput style={[styles.input, { paddingLeft: 40 }]} value={profileData.address} onChangeText={(t) => setProfileData({ ...profileData, address: t })} />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.inputWrap, { flex: 1, marginRight: 8 }]}><Text style={styles.label}>City</Text><TextInput style={styles.input} value={profileData.city} onChangeText={(t) => setProfileData({ ...profileData, city: t })} /></View>
                    <View style={[styles.inputWrap, { flex: 1 }]}><Text style={styles.label}>State</Text><TextInput style={styles.input} value={profileData.state} onChangeText={(t) => setProfileData({ ...profileData, state: t })} /></View>
                  </View>
                </View>

                {/* 3. Skills */}
                <View style={[styles.card, { zIndex: 3000 }]}>
                  <Text style={styles.sectionHeader}>Skills & Services</Text>
                  <View style={styles.skillsRow}>
                    {selectedSkills.map(skill => (
                      <View key={skill} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                        <TouchableOpacity onPress={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}><X size={14} color="#2563eb" /></TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <View style={styles.searchBox}>
                    <Search size={18} color="#94a3b8" />
                    <TextInput style={styles.searchInput} placeholder="Search skills..." value={skillSearch} onChangeText={t => { setSkillSearch(t); setShowSkillDropdown(true) }} />
                    <TouchableOpacity onPress={() => setShowSkillDropdown(!showSkillDropdown)}><ChevronDown size={20} color="#64748b" /></TouchableOpacity>
                  </View>
                  {showSkillDropdown && (
                    <View style={styles.dropdownListContainer}>
                      <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="always">
                        {allSkills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkills.includes(s)).map(s => (
                          <TouchableOpacity key={s} style={styles.dropdownItem} onPress={() => { setSelectedSkills([...selectedSkills, s]); setShowSkillDropdown(false); setSkillSearch("") }}><Text>{s}</Text></TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* 4. Rates */}
                <View style={styles.card}>
                  <Text style={styles.sectionHeader}>Rates</Text>
                  <View style={styles.row}>
                    <View style={[styles.inputWrap, { flex: 1.5, marginRight: 12 }]}>
                      <Text style={styles.label}>Hourly Rate ($)</Text>
                      <TextInput style={styles.input} value={profileData.hourlyRate} keyboardType="numeric" onChangeText={(t) => setProfileData({ ...profileData, hourlyRate: t })} />
                    </View>
                    <View style={[styles.inputWrap, { flex: 1 }]}>
                      <Text style={styles.label}>Min Hours</Text>
                      <TextInput style={styles.input} value={profileData.minHours} keyboardType="numeric" onChangeText={(t) => setProfileData({ ...profileData, minHours: t })} />
                    </View>
                  </View>
                </View>

                {/* 5. Availability */}
                <View style={styles.card}>
                  <Text style={styles.sectionHeader}>Availability</Text>
                  <View
                    style={[
                      styles.availStatusBox,
                      profileData.isAvailable
                        ? styles.availBoxAvailable
                        : styles.availBoxBusy,
                    ]}
                  >
                    <View style={styles.row}>
                      <View
                        style={[
                          styles.statusDot,
                          profileData.isAvailable
                            ? styles.dotAvailable
                            : styles.dotBusy,
                        ]}
                      />
                      <Text
                        style={[
                          styles.availText,
                          profileData.isAvailable
                            ? styles.textAvailable
                            : styles.textBusy,
                        ]}
                      >
                        {profileData.isAvailable ? "Available" : "Busy"}
                      </Text>
                    </View>

                    <Switch
                      value={profileData.isAvailable}
                      onValueChange={(v) =>
                        setProfileData({ ...profileData, isAvailable: v })
                      }
                      trackColor={{
                        true: "#22c55e",
                        false: "#ef4444",
                      }}
                      thumbColor="#fff"
                    />
                  </View>

                  <Text style={styles.label}>Working Days</Text>
                  <View style={styles.daysRow}>
                    {days.map(day => (
                      <TouchableOpacity key={day} style={[styles.dayBox, workingDays.includes(day) && styles.dayBoxActive]} onPress={() => workingDays.includes(day) ? setWorkingDays(workingDays.filter(d => d !== day)) : setWorkingDays([...workingDays, day])}>
                        <Text style={[styles.dayText, workingDays.includes(day) && styles.dayTextActive]}>{day}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.row}>
                    <View style={[styles.inputWrap, { flex: 1, marginRight: 12 }]}><Text style={styles.label}><Clock size={12} /> Start</Text>
                      <View style={styles.timeInputContainer}><TextInput style={styles.timeInput} value={profileData.startTime} onChangeText={(t) => setProfileData({ ...profileData, startTime: t })} /><Clock size={16} color="#64748b" /></View>
                    </View>
                    <View style={[styles.inputWrap, { flex: 1 }]}><Text style={styles.label}><Clock size={12} /> End</Text>
                      <View style={styles.timeInputContainer}><TextInput style={styles.timeInput} value={profileData.endTime} onChangeText={(t) => setProfileData({ ...profileData, endTime: t })} /><Clock size={16} color="#64748b" /></View>
                    </View>
                  </View>
                </View>

                {/* 6. Languages */}
                <View style={[styles.card, { zIndex: 1000 }]}>
                  <Text style={styles.sectionHeader}>Languages Known</Text>
                  <View style={styles.skillsRow}>
                    {selectedLanguages.map(lang => (
                      <View key={lang} style={[styles.skillBadge, { backgroundColor: '#f0fdf4', borderColor: '#bcf0da' }]}>
                        <Text style={[styles.skillText, { color: '#16a34a' }]}>{lang}</Text>
                        <TouchableOpacity onPress={() => setSelectedLanguages(selectedLanguages.filter(l => l !== lang))}><X size={14} color="#16a34a" /></TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <View style={styles.searchBox}>
                    <Globe size={18} color="#94a3b8" />
                    <TextInput style={styles.searchInput} placeholder="Search A-Z..." value={langSearch} onChangeText={t => { setLangSearch(t); setShowLangDropdown(true) }} />
                    <TouchableOpacity onPress={() => setShowLangDropdown(!showLangDropdown)}><ChevronDown size={20} color="#64748b" /></TouchableOpacity>
                  </View>
                  {showLangDropdown && (
                    <View style={styles.dropdownListContainer}>
                      <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="always">
                        {allLanguages.filter(l => l.toLowerCase().includes(langSearch.toLowerCase()) && !selectedLanguages.includes(l)).map(l => (
                          <TouchableOpacity key={l} style={styles.dropdownItem} onPress={() => { setSelectedLanguages([...selectedLanguages, l]); setShowLangDropdown(false); setLangSearch("") }}><Text>{l}</Text></TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Save size={18} color="#FFF" /><Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </>
            )}
            
            {activeTab === "verification" && verificationStatus !== 'verified' && (
              <View>
                <Text style={[styles.sectionHeader, { fontSize: 20, marginBottom: 20 }]}>Verification & Trust</Text>

                {/* Status Card */}
                <View style={[styles.card, styles.statusCard,
                verificationStatus === 'not_submitted' && { borderColor: '#fde047' },
                (verificationStatus === 'pending' || verificationStatus === 'assigned') && { borderColor: '#fb923c' },
                verificationStatus === 'verified' && { borderColor: '#22c55e', backgroundColor: '#f0fdf4' }
                ]}>
                  <View style={styles.row}>
                    {verificationStatus === 'not_submitted' && <AlertCircle color="#eab308" size={24} />}
                    {(verificationStatus === 'pending' || verificationStatus === 'assigned') && <Clock color="#f97316" size={24} />}
                    {verificationStatus === 'verified' && <CheckCircle2 color="#16a34a" size={24} />}

                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.statusText,
                      verificationStatus === 'not_submitted' && { color: '#854d0e' },
                      (verificationStatus === 'pending' || verificationStatus === 'assigned') && { color: '#9a3412' },
                      verificationStatus === 'verified' && { color: '#166534' }
                      ]}>
                        Status: {
                          verificationStatus === 'not_submitted' ? 'Pending Action' :
                            verificationStatus === 'pending' ? 'Verification Requested' :
                              verificationStatus === 'assigned' ? 'Executive Assigned' : 'Verified'
                        }
                      </Text>
                      <Text style={styles.statusSubtext}>
                        {verificationStatus === 'verified' ? 'You are a trusted worker.' : 'Complete verification to get more job requests and higher pay.'}
                      </Text>
                    </View>
                  </View>
                </View>
                

                {/* STATE 1: NOT SUBMITTED (FORM ENTRY) */}
                {verificationStatus === 'not_submitted' && (
                  <>
                    <View style={styles.card}>
                      <Text style={styles.sectionHeader}>🔢 Aadhaar Verification</Text>

                      <View style={styles.inputWrap}>
                        <Text style={styles.label}>Aadhaar (Last 4 digits only)</Text>
                        <TextInput
                          style={[styles.input, { letterSpacing: 5, fontSize: 18, fontWeight: 'bold' }]}
                          placeholder="• • • •"
                          keyboardType="numeric"
                          maxLength={4}
                          value={aadhaarLastFour}
                          onChangeText={setAadhaarLastFour}
                        />
                        <Text style={styles.helperText}>
                          For verification only. Do not enter full Aadhaar number.
                        </Text>
                      </View>

                      <TouchableOpacity>
                        <Text style={{ color: '#2563eb', fontSize: 13, fontWeight: '600' }}>OR choose alternate ID</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.consentRow}
                        onPress={() => setConsentChecked(!consentChecked)}
                      >
                        <View style={[styles.checkbox, consentChecked && styles.checkboxActive]}>
                          {consentChecked && <CheckCircle2 size={14} color="#FFF" />}
                        </View>
                        <Text style={styles.consentText}>I agree to identity verification for safety & trust.</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                      <Text style={styles.sectionHeader}>🛠 Your Skills (Required)</Text>

                      <View style={styles.inputWrap}>
                        <Text style={styles.label}>Skill Category <Text style={{ color: 'red' }}>*</Text></Text>
                        <View style={[styles.input, { backgroundColor: '#f8fafc' }]}>
                          <Text>{selectedCat}</Text>
                        </View>
                      </View>

                      <View style={styles.inputWrap}>
                        <Text style={styles.label}>Experience (years) <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. 5"
                          keyboardType="numeric"
                          value={experience}
                          onChangeText={setExperience}
                        />
                      </View>

                      <Text style={styles.badgeHint}>“This helps us verify your work quality.”</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.saveBtn,
                        (!consentChecked || !experience || aadhaarLastFour.length < 4) && { opacity: 0.5 }
                      ]}
                      onPress={handleRequestVerification} // Use the new function below
                    >
                      <Shield size={18} color="#FFF" />
                      <Text style={styles.saveBtnText}>Request Verification</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* STATE 2: VERIFICATION REQUESTED (PENDING) */}
                {verificationStatus === 'pending' && (
                  <View>
                    <View style={styles.card}>
                      <Text style={styles.timelineTitle}>⏳ Verification in Progress</Text>
                      <Text style={styles.aboutText}>Our verification executive will visit your location to confirm:</Text>
                      <View style={{ marginTop: 10 }}>
                        <Text style={styles.viewDetailText}>• Aadhaar identity ({aadhaarLastFour})</Text>
                        <Text style={styles.viewDetailText}>• {selectedCat} Skills & previous work</Text>
                      </View>

                      <View style={styles.timelineContainer}>
                        <View style={styles.timelineItem}>
                          <CheckCircle2 size={20} color="#22c55e" />
                          <Text style={styles.timelineTextActive}>Verification Requested</Text>
                        </View>
                        <View style={styles.timelineLine} />
                        <View style={styles.timelineItem}>
                          <Clock size={20} color="#94a3b8" />
                          <Text style={styles.timelineText}>Field verification scheduled</Text>
                        </View>
                        <View style={styles.timelineLine} />
                        <View style={styles.timelineItem}>
                          <View style={styles.dot} />
                          <Text style={styles.timelineText}>Certified as Verified Worker</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.card}>
                      <Text style={styles.sectionHeader}>📍 Field Verification</Text>
                      <Text style={styles.viewDetailText}>Location: {profileData.address}, {profileData.city}</Text>
                      <Text style={[styles.viewDetailText, { color: '#f97316', fontWeight: 'bold' }]}>Status: Yet to be scheduled</Text>
                      <Text style={styles.disabledNote}>“Please keep your Aadhaar original and work tools ready.”</Text>
                    </View>

                    <View style={styles.lockInfo}>
                      <Shield size={14} color="#64748b" />
                      <Text style={styles.lockText}>You cannot edit details while verification is in progress.</Text>
                    </View>

                    {/* Dev Toggles */}
                    <TouchableOpacity onPress={() => setVerificationStatus('assigned')} style={{ marginTop: 25 }}>
                      <Text style={{ color: '#2563eb', textAlign: 'center', fontSize: 12 }}>[Dev Mode: Next Step]</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STATE 3: FIELD VERIFICATION DAY (ASSIGNED) */}
                {verificationStatus === 'assigned' && (
                  <View>
                    <View style={styles.card}>
                      <Text style={styles.sectionHeader}>👤 Verification Officer</Text>
                      <View style={styles.row}>
                        <View style={styles.officerAvatar}><Text style={styles.avatarInitials}>RK</Text></View>
                        <View style={{ marginLeft: 12 }}>
                          <Text style={styles.officerName}>Rahul Kumar</Text>
                          <Text style={styles.officerId}>ID: SKL-0921</Text>
                          <Text style={styles.visitTime}>Visit Time: Today, 2:00 – 4:00 PM</Text>
                        </View>
                      </View>
                      <View style={styles.securityNote}>
                        <AlertCircle size={14} color="#b91c1c" />
                        <Text style={styles.securityNoteText}>Our executive will NEVER ask for money.</Text>
                      </View>
                    </View>

                    <View style={styles.card}>
                      <Text style={styles.sectionHeader}>What Officer Will Check</Text>
                      <View style={styles.checkItem}><CheckCircle2 size={16} color="#94a3b8" /><Text style={styles.checkText}>Aadhaar matches person</Text></View>
                      <View style={styles.checkItem}><CheckCircle2 size={16} color="#94a3b8" /><Text style={styles.checkText}>Skill tools present</Text></View>
                      <View style={styles.checkItem}><CheckCircle2 size={16} color="#94a3b8" /><Text style={styles.checkText}>Work explanation / demo</Text></View>
                    </View>

                    <TouchableOpacity
                      onPress={handleCompleteVerification} // Use the full function here
                      style={styles.saveBtn}
                    >
                      <Text style={styles.saveBtnText}>[Dev Only] Complete Verification</Text>
                    </TouchableOpacity>
                  
                  </View>
                )}

                {/* STATE 4: SUCCESSFUL VERIFICATION */}
                {verificationStatus === 'verified' && (
                  <View>
                    <View style={styles.card}>
                      <View style={{ alignItems: 'center', padding: 10 }}>
                        <View style={styles.verifiedBadgeLarge}>
                          <Shield size={40} color="#FFF" />
                        </View>
                        <Text style={[styles.userName, { marginTop: 10 }]}>Verified Worker</Text>
                        <View style={[styles.row, { marginTop: 5 }]}>
                          <CheckCircle2 size={16} color="#16a34a" />
                          <Text style={{ color: '#16a34a', fontWeight: 'bold', marginLeft: 5 }}>Trusted & Safe</Text>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.card, { backgroundColor: '#f8fafc', borderStyle: 'dashed' }]}>
                      <Text style={styles.sectionHeader}>🏅 Trust Certification</Text>
                      <Text style={styles.aboutText}>
                        Your identity and skills have been verified in person. You are marked as a non-spam, non-fraud trusted worker.
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
            {activeTab === "reviews" && (
              <View>
                {/* --- RATING SUMMARY --- */}
                <View style={styles.card}>
                  <Text style={styles.sectionHeader}>Customer Reviews</Text>

                  <View style={styles.ratingSummary}>
                    <Text style={styles.ratingBig}>4.8</Text>
                    <View>
                      <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={16}
                            color="#facc15"
                            fill="#facc15"
                          />
                        ))}
                      </View>
                      <Text style={styles.reviewCount}>Based on 126 jobs</Text>
                    </View>
                  </View>
                </View>

                {/* --- REVIEWS LIST --- */}
                {reviewsData.map((review) => (
                  <View key={review.id} style={styles.card}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.avatarInitials}>
                          {review.user.charAt(0)}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewUser}>{review.user}</Text>
                        <View style={styles.starRow}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={12}
                              color={i <= review.rating ? "#facc15" : "#e5e7eb"}
                              fill={i <= review.rating ? "#facc15" : "transparent"}
                            />
                          ))}
                        </View>
                      </View>

                      {review.verified && (
                        <View style={styles.verifiedBadge}>
                          <CheckCircle2 size={12} color="#16a34a" />
                          <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                ))}
              </View>
            )}


            {activeTab === "portfolio" && (
              <View style={{ paddingBottom: 60 }}>
                {/* --- PORTFOLIO HEADER --- */}
                <View style={styles.portfolioHeader}>
                  <View>
                    <Text style={styles.sectionHeader}>Project Showcase</Text>
                    <Text style={styles.portfolioSubtitle}>Visual proof of your expertise</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addWorkBtn}
                    onPress={() => setShowUploadModal(true)}
                  >
                    <Camera size={18} color="#FFF" />
                    <Text style={styles.addWorkBtnText}>Post Work</Text>
                  </TouchableOpacity>
                </View>

                {/* --- UPLOAD MODAL (OVERLAY) --- */}
                {showUploadModal && (
                  <View style={styles.modalOverlay}>
                    <View style={styles.uploadCard}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>New Project</Text>
                        <TouchableOpacity onPress={() => setShowUploadModal(false)}><X size={24} color="#64748b" /></TouchableOpacity>
                      </View>

                      <ScrollView style={{ maxHeight: 400 }}>
                        {/* Image Pickers */}
                        <View style={styles.row}>
                          <TouchableOpacity style={styles.imagePlaceholderLarge}>
                            <Upload size={24} color="#94a3b8" />
                            <Text style={styles.uploadLabel}>Main Image</Text>
                          </TouchableOpacity>
                          {newProject.isBeforeAfter && (
                            <TouchableOpacity style={[styles.imagePlaceholderLarge, { backgroundColor: '#fef2f2' }]}>
                              <Upload size={24} color="#ef4444" />
                              <Text style={[styles.uploadLabel, { color: '#ef4444' }]}>Before Photo</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <View style={[styles.row, { marginTop: 15, justifyContent: 'space-between' }]}>
                          <Text style={styles.label}>Is this a Before/After project?</Text>
                          <Switch
                            value={newProject.isBeforeAfter}
                            onValueChange={(v) => setNewProject({ ...newProject, isBeforeAfter: v })}
                          />
                        </View>

                        <Text style={styles.label}>Project Title</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Kitchen Sink Leak Fixed"
                          onChangeText={(t) => setNewProject({ ...newProject, title: t })}
                        />

                        <Text style={[styles.label, { marginTop: 12 }]}>Short Description</Text>
                        <TextInput
                          style={[styles.input, styles.textArea]}
                          multiline
                          placeholder="Explain what you did..."
                          onChangeText={(t) => setNewProject({ ...newProject, description: t })}
                        />
                      </ScrollView>

                      <TouchableOpacity
                        style={[styles.saveBtn, { marginTop: 20 }]}
                        onPress={() => {
                          Alert.alert("Success", "Project added to your public portfolio!");
                          setShowUploadModal(false);
                        }}
                      >
                        <CheckCircle2 size={18} color="#FFF" />
                        <Text style={styles.saveBtnText}>Publish to Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* --- DYNAMIC PORTFOLIO LIST --- */}
                {/* Featured Before/After Card */}
                <View style={styles.card}>
                  <View style={styles.verifiedTag}>
                    <CheckCircle2 size={12} color="#16a34a" />
                    <Text style={styles.verifiedTagText}>VERIFIED JOB</Text>
                  </View>
                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 4 }}>
                      <Image source={{ uri: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400' }} style={styles.portfolioMainImg} />
                      <View style={styles.afterLabel}><Text style={styles.afterLabelText}>BEFORE</Text></View>
                    </View>
                    <View style={{ flex: 1, marginLeft: 4 }}>
                      <Image source={{ uri: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=400' }} style={styles.portfolioMainImg} />
                      <View style={[styles.afterLabel, { backgroundColor: '#22c55e' }]}><Text style={styles.afterLabelText}>AFTER</Text></View>
                    </View>
                  </View>
                  <Text style={[styles.projectTitle, { marginTop: 12 }]}>Luxury Bathroom Restoration</Text>
                  <Text style={styles.aboutText}>Complete plumbing overhaul and tile polishing for a residential villa.</Text>
                </View>

                {/* Instagram Grid Style for other works */}
                <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Recent Works</Text>
                <View style={styles.instaGrid}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <TouchableOpacity key={i} style={styles.gridItem}>
                      <Image source={{ uri: `https://picsum.photos/200/200?random=${i}` }} style={styles.gridImage} />
                      <View style={styles.gridStats}>
                        <Star size={10} color="#FFF" fill="#FFF" />
                        <Text style={styles.gridStatsText}>4.9</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { paddingVertical: 20 },
  viewHeader: { padding: 30, backgroundColor: '#FFF', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  avatarCircleLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  editFloatingBtn: { position: 'absolute', top: 20, right: 20, padding: 8, backgroundColor: '#eff6ff', borderRadius: 20 },
  headerSection: { padding: 16, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontSize: 20, fontWeight: 'bold', color: '#2563eb' },
  headerInfo: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', flexDirection: 'row', alignItems: 'center' },
  userSubTitle: { color: '#64748b', fontSize: 14 },
  tabContainer: { backgroundColor: '#FFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tabsScroll: { paddingHorizontal: 16 },
  tabButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 25, marginRight: 10, backgroundColor: '#f1f5f9' },
  tabButtonActive: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  tabText: { marginLeft: 8, fontSize: 13, color: '#64748b', fontWeight: '600' },
  tabTextActive: { color: '#2563eb' },
  tabContent: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  skillBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#dbeafe' },
  skillText: { fontSize: 13, color: '#2563eb', fontWeight: '600', marginRight: 6 },
  viewSkillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4, // Adjusted back down since View won't clip now
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 8,
    marginBottom: 8,
  },
  viewSkillText: {
    fontSize: 14,
    color: '#475569',
    includeFontPadding: false,
  },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, height: 45, backgroundColor: '#f8fafc' },
  searchInput: { flex: 1, fontSize: 14, marginLeft: 8 },
  dropdownListContainer: { marginTop: 5, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, backgroundColor: '#FFF', height: 150, elevation: 5 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  saveBtn: { backgroundColor: '#2563eb', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, gap: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  inputWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, color: '#1e293b', justifyContent: 'center' },
  textArea: { height: 80, textAlignVertical: 'top' },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', padding: 6, borderRadius: 8 },
  gpsBtnText: { color: '#2563eb', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  innerIcon: { position: 'absolute', left: 12, top: 12, zIndex: 1 },
  inputIconRow: { position: 'relative' },
  availStatusBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 12 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  availText: { fontWeight: '600', color: '#1e293b' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  dayBox: { flex: 1, height: 36, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', minWidth: 40 },
  dayBoxActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  dayText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  dayTextActive: { color: '#FFF' },
  timeInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 10, height: 40 },
  timeInput: { flex: 1, fontSize: 14, color: '#1e293b' },
  viewDetailText: { fontSize: 14, color: '#475569', marginBottom: 4 },
  aboutText: { fontSize: 14, color: '#475569', lineHeight: 20 },

  // --- VERIFICATION SPECIFIC STYLES ---
  statusCard: { borderLeftWidth: 6 },
  statusText: { fontSize: 15, fontWeight: 'bold' },
  statusSubtext: { fontSize: 12, color: '#64748b', marginTop: 2 },
  uploadBox: { flex: 1, height: 80, backgroundColor: '#f1f5f9', borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
  uploadText: { fontSize: 11, color: '#64748b', marginTop: 4 },
  consentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  consentText: { fontSize: 13, color: '#475569' },
  maskContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 8, borderRadius: 6, marginTop: 12 },
  maskText: { fontSize: 12, color: '#166534', marginLeft: 6 },
  badgeHint: { fontSize: 12, fontStyle: 'italic', color: '#64748b', marginTop: 8 },
  timelineTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  timelineContainer: { marginTop: 20, paddingLeft: 10 },
  timelineItem: { flexDirection: 'row', alignItems: 'center' },
  timelineTextActive: { marginLeft: 12, color: '#1e293b', fontWeight: 'bold' },
  timelineText: { marginLeft: 12, color: '#94a3b8' },
  timelineLine: { width: 2, height: 20, backgroundColor: '#e2e8f0', marginLeft: 9 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e2e8f0', marginLeft: 5 },
  disabledNote: { fontSize: 12, color: '#94a3b8', marginTop: 10 },
  lockInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  lockText: { fontSize: 12, color: '#64748b', marginLeft: 6 },
  officerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center' },
  officerName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  officerId: { fontSize: 12, color: '#64748b' },
  visitTime: { fontSize: 13, color: '#f97316', fontWeight: '600' },
  securityNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 8, borderRadius: 8, marginTop: 15 },
  securityNoteText: { fontSize: 11, color: '#b91c1c', marginLeft: 6, fontWeight: '600' },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkText: { marginLeft: 10, color: '#475569', fontSize: 14 },
  verifiedBadgeLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center' },
  helperText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 6,
  },

  instaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  gridItem: {
    width: (width - 40) / 3, // Perfect 3-column split
    aspectRatio: 1, padding: 4
  },
  gridImage: { flex: 1, borderRadius: 8 },
  gridOverlay: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 4, borderRadius: 4
  },
  gridCategory: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  // --- NEW PORTFOLIO & MODAL STYLES ---
  portfolioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  portfolioSubtitle: { fontSize: 12, color: '#64748b', marginTop: -8, marginBottom: 10 },
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 9999, justifyContent: 'center', padding: 20
  },
  uploadCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  imagePlaceholderLarge: { flex: 1, height: 120, backgroundColor: '#f1f5f9', borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
  uploadLabel: { fontSize: 12, color: '#64748b', fontWeight: 'bold', marginTop: 8 },
  verifiedTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4',
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, marginBottom: 10
  },
  verifiedTagText: { fontSize: 10, fontWeight: 'bold', color: '#16a34a', marginLeft: 4 },
  portfolioMainImg: { height: 150, borderRadius: 12, backgroundColor: '#e2e8f0' },
  afterLabel: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  afterLabelText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  projectTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  // instaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  // gridItem: { width: (width - 40) / 3, aspectRatio: 1, padding: 4 },
  // gridImage: { flex: 1, borderRadius: 12 },
  gridStats: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  gridStatsText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', marginLeft: 3 },
  addWorkBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, elevation: 4 },
  addWorkBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
  // --- REVIEWS STYLES ---
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  ratingBig: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  reviewCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },

  starRow: {
    flexDirection: 'row',
    gap: 2,
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  reviewUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  reviewComment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 6,
  },

  reviewDate: {
    fontSize: 11,
    color: '#94a3b8',
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  verifiedText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // Availability Dynamic Styles
  availBoxAvailable: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },

  availBoxBusy: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  dotAvailable: {
    backgroundColor: "#22c55e",
  },

  dotBusy: {
    backgroundColor: "#ef4444",
  },

  textAvailable: {
    color: "#166534",
  },

  textBusy: {
    color: "#991b1b",
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fff',
    gap: 8,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

// import React, { useState, useEffect } from "react";
// import {
//   StyleSheet,
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Switch,
//   Dimensions,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import {
//   MapPin,
//   X,
//   Save,
//   Star,
//   User,
//   Shield,
//   Briefcase,
//   ChevronDown,
//   Search,
//   Clock,
//   Edit2,
//   Globe,
//   Navigation,
//   Upload,
//   CheckCircle2,
//   AlertCircle,
//   FileText,
//   Camera,
//   LogOut,
// } from "lucide-react-native";
// import { useRouter } from "expo-router";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width } = Dimensions.get("window");

// const allSkills = [
//   "Appliance Repair", "Beauty & Makeup", "Carpentry", "Cleaning",
//   "Cooking/Maid", "Electrical", "Gardening", "Haircut & Styling",
//   "HVAC", "Interior Design", "Landscaping", "Maid Service", "Moving Services",
//   "Painting", "Pest Control", "Pet Grooming", "Plumbing",
//   "Roofing", "Security Installation", "Tailoring", "Yoga Trainer"
// ].sort();

// const allLanguages = [
//   "Arabic", "Bengali", "Chinese", "Dutch", "English", "French", "German",
//   "Greek", "Hindi", "Italian", "Japanese", "Korean", "Mandarin", "Portuguese",
//   "Russian", "Spanish", "Telugu", "Turkish", "Vietnamese"
// ].sort();

// const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const reviewsData = [
//   { id: 1, user: "Anjali Sharma", rating: 5, comment: "Very professional and fixed the issue quickly. Highly recommended!", date: "2 days ago", verified: true },
//   { id: 2, user: "Rahul Verma", rating: 4, comment: "Good work, arrived on time. Pricing was fair.", date: "1 week ago", verified: true },
//   { id: 3, user: "Sneha Patel", rating: 5, comment: "Excellent service. Clean work and explained everything clearly.", date: "3 weeks ago", verified: false },
// ];

// export default function ProfilePage() {
//   const router = useRouter();
//   const [isEditing, setIsEditing] = useState(true);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [loading, setLoading] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);

//   // --- FORM STATE ---
//   const [profileData, setProfileData] = useState({
//     name: "",
//     title: "",
//     bio: "",
//     address: "",
//     city: "",
//     state: "",
//     zip: "",
//     hourlyRate: "0",
//     minHours: "0",
//     startTime: "08:00",
//     endTime: "18:00",
//     isAvailable: true,
//   });

//   const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
//   const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
//   const [workingDays, setWorkingDays] = useState<string[]>([]);
  
//   // --- VERIFICATION STATES ---
//   const [verificationStatus, setVerificationStatus] = useState('not_submitted');
//   const [aadhaarLastFour, setAadhaarLastFour] = useState("");
//   const [experience, setExperience] = useState("");
//   const [consentChecked, setConsentChecked] = useState(false);
//   const [selectedCat, setSelectedCat] = useState("Plumber");

//   // --- PORTFOLIO UI STATES ---
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [newProject, setNewProject] = useState({ title: "", description: "", category: "Plumbing", isBeforeAfter: false });

//   // --- UI STATES ---
//   const [showSkillDropdown, setShowSkillDropdown] = useState(false);
//   const [skillSearch, setSkillSearch] = useState("");

//   useEffect(() => {
//     const getSession = async () => {
//       try {
//         const storedId = await AsyncStorage.getItem('userId');
//         const storedName = await AsyncStorage.getItem('workerName');
//         if (storedId) {
//           setUserId(storedId);
//           if (storedName) setProfileData(prev => ({ ...prev, name: storedName }));
//         } else {
//           Alert.alert("Session Error", "Could not find your user ID. Please log in again.");
//           router.replace("/auth/login");
//         }
//       } catch (e) { console.error(e); }
//     };
//     getSession();
//   }, []);

//   const handleSave = async (customStatus: string | null = null) => {
//     if (!userId) { Alert.alert("Error", "User session not found."); return; }
//     setLoading(true);
//     try {
//       const API_URL = process.env.EXPO_PUBLIC_API_URL;
//       const payload = {
//         ...profileData,
//         hourlyRate: Number(profileData.hourlyRate),
//         minHours: Number(profileData.minHours),
//         skills: selectedSkills,
//         languages: selectedLanguages,
//         workingDays: workingDays,
//         verificationStatus: customStatus || verificationStatus,
//         experience: Number(experience),
//         aadhaarLastFour: aadhaarLastFour,
//       };
//       const response = await fetch(`${API_URL}/api/work/profile/${userId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const result = await response.json();
//       if (result.success) {
//         if (!customStatus) {
//             setIsEditing(false);
//             Alert.alert("Success", "Worker profile updated!");
//         }
//       } else { Alert.alert("Database Error", result.message); }
//     } catch (error) { Alert.alert("Connection Error", "Check backend connection."); }
//     finally { setLoading(false); }
//   };

//   const handleRequestVerification = async () => {
//     if (consentChecked && experience && aadhaarLastFour.length === 4) {
//       setVerificationStatus('pending');
//       await handleSave('pending');
//     } else { Alert.alert("Missing Info", "Fill all mandatory fields."); }
//   };

//   const handleLogout = async () => {
//     Alert.alert("Logout", "Are you sure?", [
//       { text: "Cancel" },
//       { text: "Logout", style: "destructive", onPress: async () => { await AsyncStorage.clear(); router.replace("/auth/login"); } }
//     ]);
//   };

//   const handleGetLocation = () => {
//     setProfileData({ ...profileData, address: "456 GPS Avenue", city: "San Francisco", state: "CA", zip: "94105" });
//   };

//   const TabButton = ({ value, label, icon: Icon }: any) => (
//     <TouchableOpacity style={[styles.tabButton, activeTab === value && styles.tabButtonActive]} onPress={() => setActiveTab(value)}>
//       <Icon size={16} color={activeTab === value ? "#2563eb" : "#64748b"} />
//       <Text style={[styles.tabText, activeTab === value && styles.tabTextActive]}>{label}</Text>
//     </TouchableOpacity>
//   );

//   if (!isEditing) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           <View style={styles.viewHeader}>
//             <View style={styles.avatarCircleLarge}><Text style={styles.avatarInitials}>{profileData.name.substring(0,2).toUpperCase() || "JD"}</Text></View>
//             <Text style={styles.userName}>{profileData.name} {verificationStatus === 'verified' && <CheckCircle2 size={20} color="#22c55e" />}</Text>
//             <Text style={styles.userSubTitle}>{profileData.title || "Professional"}</Text>
//             <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editFloatingBtn}><Edit2 size={20} color="#2563eb" /></TouchableOpacity>
//           </View>
//           <View style={styles.card}><Text style={styles.sectionHeader}>About</Text><Text style={styles.aboutText}>{profileData.bio || "No bio added."}</Text></View>
//           <View style={styles.card}>
//             <Text style={styles.sectionHeader}>Services & Rates</Text>
//             <View style={styles.skillsRow}>{selectedSkills.map(s => (<View key={s} style={styles.viewSkillBadge}><Text style={styles.viewSkillText}>{s}</Text></View>))}</View>
//             <Text style={styles.viewDetailText}>Hourly Rate: ${profileData.hourlyRate} | Min Hours: {profileData.minHours}</Text>
//           </View>
//           <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}><LogOut size={18} color="#ef4444" /><Text style={styles.logoutBtnText}>Logout</Text></TouchableOpacity>
//         </ScrollView>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
//           <View style={styles.headerSection}>
//             <View style={styles.avatarCircle}><Text style={styles.avatarInitials}>{profileData.name.substring(0,2).toUpperCase() || "JD"}</Text></View>
//             <View style={styles.headerInfo}><Text style={styles.userName}>{profileData.name || "Worker Name"}</Text><Text style={styles.userSubTitle}>Profile Editing Mode</Text></View>
//           </View>

//           <View style={styles.tabContainer}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
//               <TabButton value="profile" label="Profile" icon={User} />
//               <TabButton value="verification" label="Verification" icon={Shield} />
//               <TabButton value="portfolio" label="Portfolio" icon={Briefcase} />
//               <TabButton value="reviews" label="Reviews" icon={Star} />
//             </ScrollView>
//           </View>

//           <View style={styles.tabContent}>
//             {/* PROFILE TAB */}
//             {activeTab === "profile" && (
//               <>
//                 <View style={styles.card}>
//                   <Text style={styles.sectionHeader}>Basic Information</Text>
//                   <View style={styles.inputWrap}><Text style={styles.label}>Display Name</Text><TextInput style={styles.input} value={profileData.name} onChangeText={(t) => setProfileData({ ...profileData, name: t })} /></View>
//                   <View style={styles.inputWrap}><Text style={styles.label}>Bio</Text><TextInput style={[styles.input, styles.textArea]} multiline value={profileData.bio} onChangeText={(t) => setProfileData({ ...profileData, bio: t })} /></View>
//                 </View>

//                 <View style={styles.card}>
//                   <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 12 }]}><Text style={styles.sectionHeader}>Location</Text><TouchableOpacity onPress={handleGetLocation} style={styles.gpsBtn}><Navigation size={14} color="#2563eb" /><Text style={styles.gpsBtnText}>Use GPS</Text></TouchableOpacity></View>
//                   <TextInput style={styles.input} value={profileData.address} placeholder="Address" onChangeText={(t) => setProfileData({ ...profileData, address: t })} />
//                 </View>

//                 <View style={styles.card}>
//                   <Text style={styles.sectionHeader}>Rates & Availability</Text>
//                   <View style={styles.row}>
//                     <View style={{ flex: 1, marginRight: 8 }}><Text style={styles.label}>$/hr</Text><TextInput style={styles.input} keyboardType="numeric" value={profileData.hourlyRate} onChangeText={(t) => setProfileData({ ...profileData, hourlyRate: t })} /></View>
//                     <View style={{ flex: 1 }}><Text style={styles.label}>Min Hours</Text><TextInput style={styles.input} keyboardType="numeric" value={profileData.minHours} onChangeText={(t) => setProfileData({ ...profileData, minHours: t })} /></View>
//                   </View>
//                   <View style={[styles.availStatusBox, { marginTop: 15 }]}><Text style={styles.availText}>{profileData.isAvailable ? "Available" : "Busy"}</Text><Switch value={profileData.isAvailable} onValueChange={(v) => setProfileData({ ...profileData, isAvailable: v })} /></View>
//                 </View>

//                 <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave()} disabled={loading}>{loading ? <ActivityIndicator color="#FFF" /> : <><Save size={18} color="#FFF" /><Text style={styles.saveBtnText}>Save Profile to DB</Text></>}</TouchableOpacity>
//               </>
//             )}

//             {/* VERIFICATION TAB */}
//             {activeTab === "verification" && (
//               <View>
//                 <View style={[styles.card, styles.statusCard, 
//                     verificationStatus === 'verified' ? { borderColor: '#22c55e', backgroundColor: '#f0fdf4' } : 
//                     verificationStatus === 'pending' ? { borderColor: '#fb923c' } : { borderColor: '#fde047' }]}>
//                   <View style={styles.row}>
//                     {verificationStatus === 'verified' ? <CheckCircle2 color="#16a34a" size={24} /> : <AlertCircle color="#eab308" size={24} />}
//                     <View style={{ marginLeft: 12 }}><Text style={styles.statusText}>Status: {verificationStatus.replace('_', ' ').toUpperCase()}</Text><Text style={styles.statusSubtext}>{verificationStatus === 'verified' ? 'Trusted Worker' : 'Action Required'}</Text></View>
//                   </View>
//                 </View>

//                 {verificationStatus === 'not_submitted' && (
//                   <>
//                     <View style={styles.card}>
//                         <Text style={styles.sectionHeader}>🔢 Aadhaar Verification</Text>
//                         <TextInput style={[styles.input, { letterSpacing: 5, fontSize: 18, fontWeight: 'bold' }]} placeholder="• • • •" maxLength={4} keyboardType="numeric" value={aadhaarLastFour} onChangeText={setAadhaarLastFour} />
//                         <TouchableOpacity style={styles.consentRow} onPress={() => setConsentChecked(!consentChecked)}>
//                           <View style={[styles.checkbox, consentChecked && styles.checkboxActive]}>{consentChecked && <CheckCircle2 size={14} color="#FFF" />}</View>
//                           <Text style={styles.consentText}>I agree to identity verification.</Text>
//                         </TouchableOpacity>
//                     </View>
//                     <View style={styles.card}>
//                         <Text style={styles.sectionHeader}>🛠 Experience (Required)</Text>
//                         <TextInput style={styles.input} placeholder="e.g. 5" keyboardType="numeric" value={experience} onChangeText={setExperience} />
//                     </View>
//                     <TouchableOpacity style={[styles.saveBtn, { opacity: (consentChecked && experience && aadhaarLastFour.length === 4) ? 1 : 0.5 }]} onPress={handleRequestVerification} disabled={loading}>
//                         <Shield size={18} color="#FFF" /><Text style={styles.saveBtnText}>Request Verification</Text>
//                     </TouchableOpacity>
//                   </>
//                 )}
//                 {verificationStatus === 'pending' && (
//                     <View style={styles.card}><Text style={styles.timelineTitle}>⏳ Visit Scheduled</Text><Text style={styles.aboutText}>Officer will visit to verify Aadhaar and tools.</Text></View>
//                 )}
//               </View>
//             )}

//             {/* PORTFOLIO TAB */}
//             {activeTab === "portfolio" && (
//                 <View>
//                     <View style={styles.portfolioHeader}>
//                         <View><Text style={styles.sectionHeader}>Project Showcase</Text></View>
//                         <TouchableOpacity style={styles.addWorkBtn} onPress={() => setShowUploadModal(true)}><Camera size={18} color="#FFF" /><Text style={styles.addWorkBtnText}>Post Work</Text></TouchableOpacity>
//                     </View>
//                     <View style={styles.card}>
//                         <Image source={{ uri: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=400' }} style={styles.portfolioMainImg} />
//                         <Text style={[styles.projectTitle, {marginTop: 10}]}>Luxury Bathroom Restoration</Text>
//                     </View>
//                 </View>
//             )}

//             {/* REVIEWS TAB */}
//             {activeTab === "reviews" && (
//                 <View>{reviewsData.map(r => (
//                   <View key={r.id} style={styles.card}>
//                     <View style={styles.reviewHeader}>
//                         <View style={styles.reviewAvatar}><Text style={styles.avatarInitials}>{r.user.charAt(0)}</Text></View>
//                         <View style={{flex:1}}><Text style={styles.reviewUser}>{r.user}</Text><View style={styles.starRow}>{[1,2,3,4,5].map(i=>(<Star key={i} size={12} color={i<=r.rating?"#facc15":"#e5e7eb"} fill={i<=r.rating?"#facc15":"transparent"}/>))}</View></View>
//                     </View>
//                     <Text style={styles.reviewComment}>{r.comment}</Text>
//                   </View>
//                 ))}</View>
//             )}
//           </View>
//         </ScrollView>

//         {/* PORTFOLIO MODAL */}
//         {showUploadModal && (
//             <View style={styles.modalOverlay}>
//                 <View style={styles.uploadCard}>
//                     <View style={styles.modalHeader}><Text style={styles.modalTitle}>New Project</Text><TouchableOpacity onPress={()=>setShowUploadModal(false)}><X size={24} color="#64748b" /></TouchableOpacity></View>
//                     <TextInput style={styles.input} placeholder="Project Title" onChangeText={(t)=>setNewProject({...newProject, title:t})} />
//                     <TouchableOpacity style={styles.saveBtn} onPress={()=>{Alert.alert("Success","Published"); setShowUploadModal(false)}}><Text style={styles.saveBtnText}>Publish</Text></TouchableOpacity>
//                 </View>
//             </View>
//         )}
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   scrollContent: { paddingVertical: 20 },
//   viewHeader: { padding: 30, backgroundColor: '#FFF', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
//   avatarCircleLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
//   editFloatingBtn: { position: 'absolute', top: 20, right: 20, padding: 8, backgroundColor: '#eff6ff', borderRadius: 20 },
//   headerSection: { padding: 16, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center' },
//   avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center' },
//   avatarInitials: { fontSize: 20, fontWeight: 'bold', color: '#2563eb' },
//   headerInfo: { marginLeft: 16, flex: 1 },
//   userName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
//   userSubTitle: { color: '#64748b', fontSize: 14 },
//   tabContainer: { backgroundColor: '#FFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
//   tabsScroll: { paddingHorizontal: 16 },
//   tabButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 25, marginRight: 10, backgroundColor: '#f1f5f9' },
//   tabButtonActive: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
//   tabText: { marginLeft: 8, fontSize: 13, color: '#64748b', fontWeight: '600' },
//   tabTextActive: { color: '#2563eb' },
//   tabContent: { padding: 16 },
//   card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
//   sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
//   skillsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
//   viewSkillBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 8, marginBottom: 8 },
//   viewSkillText: { fontSize: 14, color: '#475569' },
//   saveBtn: { backgroundColor: '#2563eb', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, gap: 10 },
//   saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
//   row: { flexDirection: 'row', alignItems: 'center' },
//   inputWrap: { marginBottom: 16 },
//   label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
//   input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, color: '#1e293b' },
//   textArea: { height: 80, textAlignVertical: 'top' },
//   gpsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', padding: 6, borderRadius: 8 },
//   gpsBtnText: { color: '#2563eb', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
//   availStatusBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 10, borderRadius: 10 },
//   availText: { fontWeight: '600', color: '#1e293b' },
//   aboutText: { fontSize: 14, color: '#475569', lineHeight: 20 },
//   statusCard: { borderLeftWidth: 6, padding: 15 },
//   statusText: { fontSize: 15, fontWeight: 'bold' },
//   statusSubtext: { fontSize: 12, color: '#64748b' },
//   consentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
//   checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
//   checkboxActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
//   consentText: { fontSize: 13, color: '#475569' },
//   timelineTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
//   portfolioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
//   portfolioMainImg: { height: 180, width: '100%', borderRadius: 12 },
//   projectTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
//   addWorkBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
//   addWorkBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
//   modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', zIndex: 9999, justifyContent: 'center', padding: 20 },
//   uploadCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20 },
//   modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
//   modalTitle: { fontSize: 20, fontWeight: 'bold' },
//   reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
//   reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
//   reviewUser: { fontSize: 14, fontWeight: 'bold' },
//   reviewComment: { fontSize: 14, color: '#475569' },
//   starRow: { flexDirection: 'row', gap: 2 },
//   logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2' },
//   logoutBtnText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
//   viewDetailText: { fontSize: 14, color: '#475569', marginBottom: 4 },
// });