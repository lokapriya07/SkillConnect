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
});