

import React, { useState, useEffect, useMemo } from "react";

import React, { useState, useEffect, useMemo, useCallback } from "react";

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
    Linking,
    Modal,
    FlatList,
    SafeAreaView
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

    // --- Chat States ---
    const [chatVisible, setChatVisible] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [userId, setUserId] = useState<string>('');

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

    // Generate conversation ID
    const getConversationId = useCallback(() => {
        if (!userData?.workerProfileId || !userId) return null;
        const ids = [userData.workerProfileId, userId].sort();
        return ids.join('_');
    }, [userData, userId]);

    // --- Effects ---
    useEffect(() => {
        if (jobId) fetchJobDetails();
        return () => {
            if (sound) sound.unloadAsync();
        };
    }, [jobId]);

    useEffect(() => {
        if (job?.location?.coordinates) {
            handleLocationData();
        }
    }, [job]);

    // Get user data on mount
    useEffect(() => {
        const getUserData = async () => {
            try {
                const userStr = await AsyncStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setUserData(user);
                }
            } catch (error) {
                console.error('Error getting user data:', error);
            }
        };
        getUserData();
    }, []);

    // Fetch messages from backend
    const fetchMessages = useCallback(async () => {
        const conversationId = getConversationId();
        if (!conversationId) return;

        setLoadingMessages(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chat/conversation/${conversationId}`);
            const result = await response.json();
            if (result.success) {
                setMessages(result.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    }, [getConversationId]);

    // Load messages when chat opens
    useEffect(() => {
        if (chatVisible && userId) {
            fetchMessages();
        }
    }, [chatVisible, userId, fetchMessages]);

    const fetchJobDetails = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/all-jobs`);
            const result = await response.json();
            const foundJob = result.jobs.find((j: any) => j._id === jobId);

            if (foundJob) {
                setJob(foundJob);
                if (foundJob.budget) setBidAmount(foundJob.budget.toString());
                // Set user ID for chat (the job poster)
                if (foundJob.userId) {
                    setUserId(foundJob.userId);
                }
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
            const geoResult = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (geoResult.length > 0) {
                const res = geoResult[0];
                const addr = [res.name, res.street, res.district, res.city].filter(Boolean).join(", ");
                setFullAddress(addr || "Address found, details missing");
            }
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

    // Send message to backend
    const handleSendMessage = async () => {
        if (messageText.trim().length === 0) return;
        if (!userData?.workerProfileId || !userId) {
            Alert.alert('Error', 'Please login to send messages');
            return;
        }

        const conversationId = getConversationId();
        if (!conversationId) return;

        const messageData = {
            conversationId,
            senderId: userData.workerProfileId,
            senderType: 'worker',
            receiverId: userId,
            receiverType: 'user',
            message: messageText.trim(),
            messageType: 'text'
        };

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chat/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });

            const result = await response.json();
            if (result.success) {
                // Add message to local state
                const newMessage = {
                    id: result.message._id || Date.now().toString(),
                    text: messageText.trim(),
                    sender: 'worker',
                    createdAt: new Date().toISOString()
                };
                setMessages(prev => [...prev, newMessage]);
                setMessageText('');
            } else {
                Alert.alert('Error', 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        }
    };

    // Mark messages as read
    const markMessagesAsRead = async () => {
        const conversationId = getConversationId();
        if (!conversationId || !userData?.workerProfileId) return;

        try {
            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chat/read/${conversationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.workerProfileId, userType: 'worker' })
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const submitBid = async () => {
        if (!bidAmount) return Alert.alert("Wait", "Please enter a bid amount.");
        try {
            const userStr = await AsyncStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : null;
            const workerIdForBackend = user?.workerProfileId;
            if (!workerIdForBackend) {
                Alert.alert("Profile Incomplete", "Please update your profile first to get a Worker ID.");
                return;
            }
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/submit-bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: jobId,
                    workerId: workerIdForBackend,
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
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
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

                        {/* Submit Bid and Chat Row */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity 
                                style={styles.secondaryBtn} 
                                onPress={() => {
                                    if (!userData?.workerProfileId) {
                                        Alert.alert('Login Required', 'Please login to chat with users');
                                        return;
                                    }
                                    setChatVisible(true);
                                    markMessagesAsRead();
                                }}
                            >
                                <Ionicons name="chatbubbles-outline" size={24} color={Colors.primary || "#007AFF"} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={submitBid}>
                                <Text style={styles.submitBtnText}>Submit Bid</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Chat Modal */}
            <Modal visible={chatVisible} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                    style={styles.chatContainer}
                >
                    <View style={styles.chatHeader}>
                        <TouchableOpacity onPress={() => setChatVisible(false)}>
                            <Ionicons name="chevron-down" size={32} color="#1A202C" />
                        </TouchableOpacity>
                        <Text style={styles.chatHeaderText}>Chat with User</Text>
                        <View style={{ width: 32 }} />
                    </View>

                    {loadingMessages ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={Colors.primary || "#007AFF"} />
                        </View>
                    ) : (
                        <FlatList
                            data={messages}
                            keyExtractor={(item) => item.id || item._id}
                            contentContainerStyle={styles.messageList}
                            inverted={false}
                            renderItem={({ item }) => (
                                <View style={[
                                    styles.msgBubble,
                                    item.sender === 'worker' || item.senderType === 'worker' ? styles.rightBubble : styles.leftBubble
                                ]}>
                                    <Text style={[
                                        styles.msgText,
                                        item.sender === 'worker' || item.senderType === 'worker' ? { color: '#fff' } : { color: '#1E293B' }
                                    ]}>
                                        {item.message || item.text}
                                    </Text>
                                    <Text style={[
                                        styles.timeText,
                                        item.sender === 'worker' || item.senderType === 'worker' ? { color: 'rgba(255,255,255,0.7)' } : { color: '#64748B' }
                                    ]}>
                                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </Text>
                                </View>
                            )}
                        />
                    )}

                    <SafeAreaView style={styles.chatInputArea}>
                        <TextInput
                            style={styles.chatTextInput}
                            placeholder="Type a message..."
                            value={messageText}
                            onChangeText={setMessageText}
                            onSubmitEditing={handleSendMessage}
                        />
                        <TouchableOpacity onPress={handleSendMessage} style={styles.sendIconBtn}>
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
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
    
    // Updated Layout for Buttons
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 25 },
    secondaryBtn: { width: 55, height: 55, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    submitBtn: { flex: 1, backgroundColor: '#28A745', height: 55, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Chat Styles
    chatContainer: { flex: 1, backgroundColor: '#fff' },
    chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
    chatHeaderText: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messageList: { padding: 15 },
    msgBubble: { padding: 12, borderRadius: 20, marginBottom: 10, maxWidth: '80%' },
    rightBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
    leftBubble: { alignSelf: 'flex-start', backgroundColor: '#E2E8F0', borderBottomLeftRadius: 4 },
    msgText: { fontSize: 16, lineHeight: 20 },
    timeText: { fontSize: 10, marginTop: 4 },
    chatInputArea: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#EDF2F7', alignItems: 'center', backgroundColor: '#fff' },
    chatTextInput: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 25, paddingHorizontal: 20, height: 45, marginRight: 10, fontSize: 16 },
    sendIconBtn: { backgroundColor: '#007AFF', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' }
});
