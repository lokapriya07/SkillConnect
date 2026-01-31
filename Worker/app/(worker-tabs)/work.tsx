import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Linking
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { VideoView, useVideoPlayer } from "expo-video";
import * as Location from 'expo-location';
import { Colors } from "@/constants/Colors";

export default function WorkerJobDetails() {
    const { jobId } = useLocalSearchParams();
    const router = useRouter();

    // --- State Management ---
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState("");
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Location & Distance State
    const [fullAddress, setFullAddress] = useState("Loading address...");
    const [distance, setDistance] = useState<string | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(true);

    // --- Helpers ---
    const getFullUrl = (path: string) => {
        if (!path) return null;
        const normalizedPath = path.replace(/\\/g, '/');
        return `${process.env.EXPO_PUBLIC_API_URL}/${normalizedPath}`;
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of Earth in KM
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // --- Effects ---
    useEffect(() => {
        if (jobId) fetchJobDetails();
        return () => {
            if (sound) sound.unloadAsync();
        };
    }, [jobId]);

    // Handle Address and Distance once Job is loaded
    useEffect(() => {
        if (job?.location?.coordinates) {
            handleLocationData();
        }
    }, [job]);

    const fetchJobDetails = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/all-jobs`);
            const result = await response.json();
            const foundJob = result.jobs.find((j: any) => j._id === jobId);

            if (foundJob) {
                setJob(foundJob);
                if (foundJob.budget) setBidAmount(foundJob.budget.toString());
            } else {
                Alert.alert("Error", "Job not found.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not load job details.");
        } finally {
            setLoading(false);
        }
    };

    const handleLocationData = async () => {
        try {
            setLoadingLocation(true);
            const [lng, lat] = job.location.coordinates;

            // 1. Get Address (Reverse Geocode)
            const geoResult = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (geoResult.length > 0) {
                const res = geoResult[0];
                const addr = [res.name, res.street, res.district, res.city].filter(Boolean).join(", ");
                setFullAddress(addr || "Address found, details missing");
            }

            // 2. Get Distance
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const userLoc = await Location.getCurrentPositionAsync({});
                const dist = calculateDistance(userLoc.coords.latitude, userLoc.coords.longitude, lat, lng);
                setDistance(dist.toFixed(1));
            }
        } catch (error) {
            console.error("Location error:", error);
            setFullAddress("Location details unavailable");
        } finally {
            setLoadingLocation(false);
        }
    };

    // --- Actions ---
    const openInMaps = () => {
        const [lng, lat] = job.location.coordinates;
        const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
        const url = `${scheme}${lat},${lng}(Work Location)`;
        Linking.openURL(url);
    };

    const videoUri = useMemo(() => getFullUrl(job?.videoPath), [job?.videoPath]);
    const player = useVideoPlayer(videoUri, (p) => { p.loop = true; });

    const playAudio = async () => {
        const audioUrl = getFullUrl(job?.audioPath);
        if (!audioUrl) return;
        try {
            if (sound) {
                await sound.replayAsync();
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: true });
                setSound(newSound);
                setIsPlaying(true);
                newSound.setOnPlaybackStatusUpdate((s: any) => { if (s.didJustFinish) setIsPlaying(false); });
            }
        } catch (e) { Alert.alert("Error", "Could not play audio."); }
    };

    const submitBid = async () => {
        if (!bidAmount) return Alert.alert("Wait", "Please enter a bid amount.");

        try {
            const userData = await AsyncStorage.getItem("user");
            const user = userData ? JSON.parse(userData) : null;

            // Use the ID we stored during profile save
            const workerIdForBackend = user?.workerProfileId;

            if (!workerIdForBackend) {
                Alert.alert("Profile Incomplete", "Please update your profile first to get a Worker ID.");
                return;
            }

            // Ensure your EXPO_PUBLIC_API_URL does not end with a trailing slash
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/submit-bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: jobId,
                    workerId: workerIdForBackend, // FIXED: Matches the variable name above
                    bidAmount: Number(bidAmount),
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                Alert.alert("Success", "Your bid has been submitted!", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("Failed", result.error || "Could not submit bid.");
            }
        } catch (error) {
            console.error("Bid submission error:", error);
            // If you see this, check if your phone can "see" your laptop's IP address
            Alert.alert("Error", "Network error. Check your server connection and IP address.");
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingCenter}>
                <ActivityIndicator size="large" color={Colors.primary || "#007AFF"} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                {job?.imagePath && (
                    <Image source={{ uri: getFullUrl(job.imagePath) as string }} style={styles.mainImage} resizeMode="cover" />
                )}

                <View style={styles.content}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.title}>Job Details</Text>
                        {distance && (
                            <View style={styles.distanceBadge}>
                                <Text style={styles.distanceText}>{distance} km away</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.tagRow}>
                        {job?.skillsRequired?.map((skill: string) => (
                            <View key={skill} style={styles.skillBadge}><Text style={styles.skillText}>{skill}</Text></View>
                        ))}
                    </View>

                    <Text style={styles.description}>{job?.description}</Text>

                    {/* Location Card */}
                    <View style={styles.locationCard}>
                        <View style={styles.locationHeader}>
                            <Ionicons name="location" size={18} color="#ef4444" />
                            <Text style={styles.locationLabel}>Work Location</Text>
                        </View>
                        <Text style={styles.addressText}>{fullAddress}</Text>
                        <TouchableOpacity style={styles.mapBtn} onPress={openInMaps}>
                            <Ionicons name="map-outline" size={16} color="#3b82f6" />
                            <Text style={styles.mapBtnText}>Get Directions</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Media Section */}
                    <View style={styles.mediaRow}>
                        {job?.audioPath && (
                            <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
                                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
                                <Text style={styles.btnText}>Listen to Voice Note</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {job?.videoPath && (
                        <View style={styles.videoContainer}>
                            <Text style={styles.label}>Problem Video:</Text>
                            <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
                        </View>
                    )}

                    <View style={styles.divider} />

                    {/* Bidding Section */}
                    <Text style={styles.label}>User Budget: ₹{job?.budget}</Text>
                    <Text style={styles.label}>Your Bid Amount:</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.currency}>₹</Text>
                        <TextInput
                            style={styles.input}
                            value={bidAmount}
                            onChangeText={setBidAmount}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={submitBid}>
                        <Text style={styles.submitBtnText}>Submit Bid</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mainImage: { width: '100%', height: 250 },
    content: { padding: 20 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 22, fontWeight: 'bold' },
    distanceBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    distanceText: { color: '#166534', fontWeight: 'bold', fontSize: 12 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    skillBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    skillText: { color: '#1976D2', fontWeight: '600', textTransform: 'capitalize' },
    description: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 20 },

    // Location Card Styles
    locationCard: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
    locationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    locationLabel: { fontWeight: 'bold', color: '#1e293b' },
    addressText: { color: '#64748b', fontSize: 14, lineHeight: 20, marginBottom: 12 },
    mapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', padding: 10, borderRadius: 8, gap: 6 },
    mapBtnText: { color: '#3b82f6', fontWeight: 'bold' },

    mediaRow: { marginBottom: 20 },
    audioBtn: { backgroundColor: "#007AFF", flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, gap: 10 },
    btnText: { color: 'white', fontWeight: 'bold' },
    videoContainer: { marginBottom: 20 },
    video: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#000' },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15 },
    currency: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    input: { flex: 1, padding: 15, fontSize: 18, fontWeight: 'bold' },
    submitBtn: { backgroundColor: '#28A745', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 25 },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});