
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Modal,
    FlatList,
    Dimensions,
    StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get('window');

// Static portfolio images for the gallery
const PAST_WORK = [
    { id: '1', title: 'Plumbing Fix', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500' },
    { id: '2', title: 'Wiring Setup', url: 'https://images.unsplash.com/photo-1621905252507-b354bcadcabc?w=500' },
    { id: '3', title: 'Maintenance', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500' },
    { id: '4', title: 'Installation', url: 'https://images.unsplash.com/photo-1517646281694-220a674de24c?w=500' },
];

export default function WorkerDetailScreen() {
    const { workerId, name, skills, bidAmount } = useLocalSearchParams();
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    return (
        <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" />

            {/* --- TOP VISUAL SECTION --- */}
            <View style={styles.headerBanner}>
                <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#000" />
                </TouchableOpacity>

                <View style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400' }}
                        style={styles.profileImage}
                    />
                    <View style={styles.onlineBadge} />
                </View>
            </View>

            {/* --- WORKER DETAILS --- */}
            <View style={styles.mainCard}>
                <View style={styles.nameHeader}>
                    <View>
                        <Text style={styles.nameText}>{name || "Service Provider"}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-sharp" size={16} color={Colors.primary} />
                            <Text style={styles.locationText}>Gachibowli, Hyderabad • 1.8 km</Text>
                        </View>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={16} color="#FFC107" />
                        <Text style={styles.ratingText}>4.8</Text>
                    </View>
                </View>

                {/* Pricing & Experience Row */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>BID RATE</Text>
                        <Text style={styles.statValue}>₹{bidAmount}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>EXPERIENCE</Text>
                        <Text style={styles.statValue}>4+ Years</Text>
                    </View>
                </View>

                {/* Skills Chips */}
                <Text style={styles.sectionHeading}>Skills & Expertise</Text>
                <View style={styles.skillsWrapper}>
                    {(skills as string)?.split(',').map((skill, index) => (
                        <View key={index} style={styles.skillChip}>
                            <Text style={styles.skillChipText}>{skill.trim()}</Text>
                        </View>
                    ))}
                </View>

                {/* Past Work Gallery */}
                <Text style={styles.sectionHeading}>Previous Work Gallery</Text>
                <FlatList
                    horizontal
                    data={PAST_WORK}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    renderItem={({ item }) => (
                        <View style={styles.portfolioItem}>
                            <Image source={{ uri: item.url }} style={styles.portfolioImg} />
                            <View style={styles.portfolioOverlay}>
                                <Text style={styles.portfolioText}>{item.title}</Text>
                            </View>
                        </View>
                    )}
                />

                {/* Hire Button */}
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.primaryBtnText}>Hire {name}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* --- SUCCESS MODAL --- */}
            <Modal transparent visible={modalVisible} animationType="fade">
                <View style={styles.modalBg}>
                    <View style={styles.modalCard}>
                        <View style={styles.tickContainer}>
                            <Ionicons name="checkmark-sharp" size={60} color="#fff" />
                        </View>
                        <Text style={styles.modalTitle}>Booking Requested!</Text>
                        <Text style={styles.modalDesc}>
                            We've sent your request to {name}. You will be connected on chat shortly.
                        </Text>
                        <TouchableOpacity
                            style={styles.doneBtn}
                            onPress={() => {
                                setModalVisible(false);
                                router.replace('/(tabs)/home' as any); // Change this to your main screen route
                            }}
                        >
                            <Text style={styles.doneBtnText}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FA' },
    headerBanner: {
        height: 220,
        backgroundColor: Colors.primary || '#2D60FF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    backCircle: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 25,
        elevation: 5
    },
    profileImageContainer: { position: 'relative', marginTop: 60 },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 5,
        borderColor: '#fff'
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
        borderWidth: 3,
        borderColor: '#fff'
    },
    mainCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        marginTop: -30,
        padding: 25,
        minHeight: 600
    },
    nameHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    nameText: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    locationText: { color: '#64748B', marginLeft: 4, fontSize: 14 },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#FEF3C7'
    },
    ratingText: { marginLeft: 5, fontWeight: 'bold', color: '#92400E' },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 20,
        marginVertical: 25,
        alignItems: 'center'
    },
    statBox: { flex: 1, alignItems: 'center' },
    divider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
    statLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', letterSpacing: 1 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 4 },
    sectionHeading: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 15 },
    skillsWrapper: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 25 },
    skillChip: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        marginRight: 10,
        marginBottom: 10
    },
    skillChipText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
    portfolioItem: { marginRight: 15, width: 180, height: 120, borderRadius: 15, overflow: 'hidden' },
    portfolioImg: { width: '100%', height: '100%' },
    portfolioOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 5
    },
    portfolioText: { color: '#fff', fontSize: 11, textAlign: 'center' },
    primaryBtn: {
        backgroundColor: Colors.primary || '#2D60FF',
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 35,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 10 },

    // Success Modal Styles
    modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { width: '85%', backgroundColor: '#fff', borderRadius: 30, padding: 30, alignItems: 'center' },
    tickContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 10
    },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
    modalDesc: { textAlign: 'center', color: '#64748B', lineHeight: 22, marginBottom: 30 },
    doneBtn: { backgroundColor: '#1E293B', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15 },
    doneBtnText: { color: '#fff', fontWeight: 'bold' }
import React, { useState, useEffect } from 'react';
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
    Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get('window');

export default function WorkerDetailScreen() {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [readableAddress, setReadableAddress] = useState<string>('Loading location...');

    const params = useLocalSearchParams();
    const {
        name,
        skills,
        bidAmount,
        expertise,
        rating,
        location,
        profilePic
    } = params;

    // 1. Reverse Geocoding Logic for Coordinates
    useEffect(() => {
        async function getReadableLocation() {
            if (!location) {
                setReadableAddress('Location not provided');
                return;
            }

            try {
                const parsedLoc = JSON.parse(location as string);

                // Extracting from GeoJSON [lng, lat] or standard {lat, lng}
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
                            {/* FIXED: Replaced <div> with <View> */}
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
                        {/* FIXED: Replaced <div> with <View> */}
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
                <TouchableOpacity style={styles.secondaryBtn}>
                    <Ionicons name="chatbubbles-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)}>
                    <Text style={styles.primaryBtnText}>Hire {name}</Text>
                    <FontAwesome5 name="user-check" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

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
    mBtnText: { color: '#fff', fontWeight: 'bold' }

});