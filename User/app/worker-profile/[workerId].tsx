import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Modal,
    Dimensions,
    StatusBar,
    Platform,
    TextInput,
    KeyboardAvoidingView,
    FlatList,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/lib/store';
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get('window');

export default function WorkerDetailScreen() {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    
    // Chat States
    const [chatVisible, setChatVisible] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [workerId, setWorkerId] = useState<string>('');

    const [readableAddress, setReadableAddress] = useState<string>('Loading location...');

    const params = useLocalSearchParams();
    const {
        name,
        skills,
        bidAmount,
        expertise,
        rating,
        location,
        profilePic,
        workerProfileId
    } = params;

    // Get user data from store on mount
    useEffect(() => {
        const unsubscribe = useAppStore.subscribe((state) => {
            if (state.user) {
                setUserData(state.user);
            }
        });
        
        // Also check initial state
        const userState = useAppStore.getState();
        if (userState.user) {
            setUserData(userState.user);
        }
        
        // Set worker ID from params
        if (workerProfileId) {
            setWorkerId(workerProfileId as string);
        } else if (params.workerId) {
            setWorkerId(params.workerId as string);
        }
        
        return () => unsubscribe();
    }, [workerProfileId, params.workerId]);

    // Generate conversation ID
    const getConversationId = useCallback(() => {
        if (!userData?._id && !userData?.id || !workerId) return null;
        const currentUserId = userData._id || userData.id;
        const ids = [currentUserId, workerId].sort();
        return ids.join('_');
    }, [userData, workerId]);

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
            // Fallback to empty array on error
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    }, [getConversationId]);

    // Load messages when chat opens
    useEffect(() => {
        if (chatVisible && workerId) {
            fetchMessages();
        }
    }, [chatVisible, workerId, fetchMessages]);

    // 1. Reverse Geocoding Logic for Coordinates
    useEffect(() => {
        async function getReadableLocation() {
            if (!location) {
                setReadableAddress('Location not provided');
                return;
            }

            try {
                const parsedLoc = JSON.parse(location as string);
                const lat = parsedLoc.latitude || (parsedLoc.coordinates && parsedLoc.coordinates[1]);
                const lng = parsedLoc.longitude || (parsedLoc.coordinates && parsedLoc.coordinates[0]);

                if (lat && lng) {
                    const reverse = await Location.reverseGeocodeAsync({
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lng)
                    });

                    if (reverse.length > 0) {
                        const { city, name: street, district } = reverse[0];
                        setReadableAddress(`${street || district || ''}, ${city || ''}`);
                    }
                } else {
                    setReadableAddress('Location coordinates missing');
                }
            } catch (error) {
                setReadableAddress('Location shared on hire');
            }
        }

        getReadableLocation();
    }, [location]);

    // 2. Skill Parsing
    const skillArray = typeof skills === 'string' ? skills.split(',') : ['Service Provider'];

    const getExpertiseBanner = (exp: any) => {
        const type = String(exp || '').toLowerCase();
        if (type.includes('plumb')) return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800';
        if (type.includes('elect')) return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800';
        if (type.includes('clean')) return 'https://images.unsplash.com/photo-1581578731522-745d05db9ad0?w=800';
        return 'https://images.unsplash.com/photo-1517646281694-220a674de24c?w=800';
    };

    // Send message to backend
    const handleSendMessage = async () => {
        if (messageText.trim().length === 0) return;
        const currentUserId = userData?._id || userData?.id;
        if (!currentUserId || !workerId) {
            Alert.alert('Error', 'Please login to send messages');
            return;
        }

        const conversationId = getConversationId();
        if (!conversationId) return;

        const messageData = {
            conversationId,
            senderId: currentUserId,
            senderType: 'user',
            receiverId: workerId,
            receiverType: 'worker',
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
                    sender: 'user',
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
        const currentUserId = userData?._id || userData?.id;
        if (!conversationId || !currentUserId) return;

        try {
            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chat/read/${conversationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId, userType: 'user' })
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent />

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {/* Visual Header Section */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: getExpertiseBanner(expertise) }}
                        style={styles.banner}
                    />
                    <View style={styles.gradientOverlay} />

                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>

                    <View style={styles.profileSection}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: (profilePic as string) || `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff` }}
                                style={styles.avatar}
                            />
                            <View style={styles.verifiedBadge}>
                                <MaterialCommunityIcons name="check-decagram" size={20} color="#00D1FF" />
                            </View>
                        </View>
                        <Text style={styles.nameText}>{name || 'Professional'}</Text>
                        <Text style={styles.expertiseText}>{expertise || 'Verified Provider'}</Text>
                    </View>
                </View>

                {/* Main Content Body */}
                <View style={styles.content}>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>BID RATE</Text>
                            <Text style={styles.statValue}>₹{bidAmount}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>RATING</Text>
                            <View style={styles.ratingRow}>
                                <Text style={styles.statValue}>{rating || '4.5'}</Text>
                                <Ionicons name="star" size={16} color="#FFC107" />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Service Location</Text>
                        <View style={styles.infoBox}>
                            <Ionicons name="location-sharp" size={20} color={Colors.primary} />
                            <Text style={styles.infoText}>{readableAddress}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Expertise & Skills</Text>
                        <View style={styles.chipContainer}>
                            {skillArray.map((skill, index) => (
                                <View key={index} style={styles.chip}>
                                    <Text style={styles.chipText}>{skill.trim()}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Schedule</Text>
                        <View style={styles.availGrid}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <View key={i} style={[styles.dayCircle, i < 5 ? styles.dayOn : styles.dayOff]}>
                                    <Text style={styles.dayText}>{day}</Text>
                                </View>
                            ))}
                            <Text style={styles.availStatus}>• Usually active now</Text>
                        </View>
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={styles.secondaryBtn} 
                    onPress={() => {
                        const currentUserId = userData?._id || userData?.id;
                        if (!currentUserId) {
                            Alert.alert('Login Required', 'Please login to chat with workers');
                            return;
                        }
                        setChatVisible(true);
                        markMessagesAsRead();
                    }}
                >
                    <Ionicons name="chatbubbles-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)}>
                    <Text style={styles.primaryBtnText}>Hire {name}</Text>
                    <FontAwesome5 name="user-check" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Chat Modal Window */}
            <Modal visible={chatVisible} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={{ flex: 1, backgroundColor: '#F8FAFC' }}
                >
                    <View style={styles.chatHeader}>
                        <TouchableOpacity onPress={() => setChatVisible(false)}>
                            <Ionicons name="chevron-down" size={28} color="#1E293B" />
                        </TouchableOpacity>
                        <Text style={styles.chatTitle}>Chat with {name}</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    {loadingMessages ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={messages}
                            keyExtractor={(item) => item.id || item._id}
                            contentContainerStyle={{ padding: 20 }}
                            inverted={false}
                            renderItem={({ item }) => (
                                <View style={[
                                    styles.msgBubble,
                                    item.sender === 'user' || item.senderType === 'user' ? styles.userBubble : styles.workerBubble
                                ]}>
                                    <Text style={[
                                        styles.msgText,
                                        item.sender === 'user' || item.senderType === 'user' ? { color: '#fff' } : { color: '#1E293B' }
                                    ]}>
                                        {item.message || item.text}
                                    </Text>
                                    <Text style={styles.timeText}>
                                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </Text>
                                </View>
                            )}
                        />
                    )}

                    <View style={styles.chatInputContainer}>
                        <TextInput
                            style={styles.chatInput}
                            placeholder="Message..."
                            value={messageText}
                            onChangeText={setMessageText}
                            onSubmitEditing={handleSendMessage}
                        />
                        <TouchableOpacity style={styles.sendIconBtn} onPress={handleSendMessage}>
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Hiring Modal */}
            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalBg}>
                    <View style={styles.modalCard}>
                        <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={50} color="#fff" />
                        </View>
                        <Text style={styles.mTitle}>Request Sent!</Text>
                        <Text style={styles.mDesc}>We've notified {name}. You can start chatting once they accept the job.</Text>
                        <TouchableOpacity style={styles.mBtn} onPress={() => { setModalVisible(false); router.back(); }}>
                            <Text style={styles.mBtnText}>Understood</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { height: 320, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
    banner: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    gradientOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: '#fff', padding: 10, borderRadius: 20, zIndex: 10 },
    profileSection: { alignItems: 'center' },
    imageContainer: { position: 'relative', marginBottom: 10 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff' },
    verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 10, padding: 2 },
    nameText: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
    expertiseText: { fontSize: 16, color: '#E2E8F0', marginTop: 4 },
    content: { backgroundColor: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -30, padding: 25 },
    statsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
    statCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    statLabel: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold', marginBottom: 5 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 15, borderRadius: 15 },
    infoText: { marginLeft: 10, color: '#475569', fontWeight: '500', flex: 1 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { backgroundColor: '#EEF2FF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    chipText: { color: '#4F46E5', fontWeight: '600', fontSize: 13 },
    availGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
    dayCircle: { width: 35, height: 35, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    dayOn: { backgroundColor: Colors.primary },
    dayOff: { backgroundColor: '#E2E8F0' },
    dayText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    availStatus: { color: '#10B981', fontSize: 13, fontWeight: '600', marginLeft: 5 },
    bottomBar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 20, flexDirection: 'row', borderTopWidth: 1, borderColor: '#F1F5F9', paddingBottom: Platform.OS === 'ios' ? 35 : 20 },
    secondaryBtn: { width: 60, height: 60, borderRadius: 15, borderColor: '#E2E8F0', borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    primaryBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { width: '85%', backgroundColor: '#fff', borderRadius: 30, padding: 30, alignItems: 'center' },
    checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    mTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
    mDesc: { textAlign: 'center', color: '#64748B', marginTop: 10, marginBottom: 25, lineHeight: 20 },
    mBtn: { backgroundColor: '#1E293B', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15 },
    mBtnText: { color: '#fff', fontWeight: 'bold' },

    // Chat Specific Styles
    chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff' },
    chatTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    msgBubble: { padding: 12, borderRadius: 20, marginBottom: 10, maxWidth: '80%' },
    userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
    workerBubble: { alignSelf: 'flex-start', backgroundColor: '#E2E8F0', borderBottomLeftRadius: 4 },
    msgText: { fontSize: 15, lineHeight: 20 },
    timeText: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, alignSelf: 'flex-end' },
    chatInputContainer: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#fff', alignItems: 'center' },
    chatInput: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 25, paddingHorizontal: 20, height: 45, marginRight: 10 },
    sendIconBtn: { backgroundColor: Colors.primary, width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' }
});
