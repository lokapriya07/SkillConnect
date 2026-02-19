import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";
import { useAppStore } from '@/lib/store';

interface Bid {
    _id: string;
    standaloneBidId?: string; // Added by backend: the standalone Bid collection _id used for hiring
    bidAmount: number;
    createdAt: string;
    status: string;
    workerId: {
        _id: string;
        name: string;
        skills: string[];
        profilePic?: string;
        expertise?: string;
        rating?: number;
    };
}

export default function WorkerBidsScreen() {
    const { jobId } = useLocalSearchParams();
    const router = useRouter();
    const darkMode = useAppStore((state) => state.darkMode);

    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [jobStatus, setJobStatus] = useState<string | null>(null);

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

    useEffect(() => {
        if (jobId) fetchBids();
    }, [jobId]);

    const fetchBids = async () => {
        try {
            setLoading(true);
            // Fetch bids
            const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/bids`);
            if (!response.ok) throw new Error('Failed to fetch bids');
            const data = await response.json();

            // Also check job status to see if already hired
            const jobResponse = await fetch(`${API_BASE_URL}/api/jobs/get-job/${jobId}`);
            if (jobResponse.ok) {
                const jobData = await jobResponse.json();
                setJobStatus(jobData.job?.status);
            }

            setBids(data);
        } catch (e) {
            Alert.alert("Error", "Could not load bids.");
        } finally {
            setLoading(false);
        }
    };

    const isJobHired = jobStatus === 'hired' || jobStatus === 'booked';

    const renderBidItem = ({ item }: { item: Bid }) => {
        const hasProfilePic = !!item.workerId.profilePic;
        const initials = item.workerId.name.charAt(0).toUpperCase();
        const isHired = item.status === 'hired';
        const isClosed = item.status === 'closed';

        return (
            <TouchableOpacity
                style={[styles.card, (isHired || isClosed) && styles.cardInactive]}
                activeOpacity={0.8}
                onPress={() => router.push({
                    pathname: `/worker-profile/${item.workerId._id}` as any,
                    params: {
                        name: item.workerId.name,
                        profilePic: item.workerId.profilePic,
                        expertise: item.workerId.expertise,
                        rating: item.workerId.rating?.toString(),
                        bidAmount: item.bidAmount.toString(),
                        skills: item.workerId.skills.join(','),
                        location: (item.workerId as any).location ? JSON.stringify((item.workerId as any).location) : '',
                        jobId: jobId?.toString() || '',
                        bidId: item.standaloneBidId || item._id?.toString() || ''
                    }
                })}
            >
                <View style={styles.cardHeader}>
                    {/* Profile Picture Section */}
                    <View style={styles.avatarContainer}>
                        {hasProfilePic ? (
                            <Image
                                source={{ uri: item.workerId.profilePic }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.initialsAvatar]}>
                                <Text style={styles.initialsText}>{initials}</Text>
                            </View>
                        )}
                        {isHired && <View style={styles.hiredBadge} />}
                    </View>

                    <View style={styles.workerMeta}>
                        <Text style={styles.workerName} numberOfLines={1}>
                            {item.workerId.name}
                        </Text>
                        <Text style={styles.expertiseText}>
                            {item.workerId.expertise || item.workerId.skills?.[0] || 'Professional'}
                        </Text>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#FFB800" />
                            <Text style={styles.ratingText}>
                                {item.workerId.rating ? item.workerId.rating.toFixed(1) : '5.0'}
                            </Text>
                            <Text style={styles.reviewCount}>(12 reviews)</Text>
                        </View>
                    </View>

                    <View style={styles.priceSection}>
                        <Text style={styles.bidLabel}>PROPOSAL</Text>
                        <Text style={styles.amount}>Rs.{item.bidAmount}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.skillsWrapper}>
                        {item.workerId.skills?.slice(0, 2).map((skill, index) => (
                            <View key={index} style={styles.skillTag}>
                                <Text style={styles.skillTagText}>{skill}</Text>
                            </View>
                        ))}
                        {item.workerId.skills.length > 2 && (
                            <Text style={styles.moreSkills}>+{item.workerId.skills.length - 2} more</Text>
                        )}
                    </View>

                    {/* Hire Button or Status Display */}
                    {isHired ? (
                        <View style={styles.hiredTag}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <Text style={styles.hiredTagText}>Hired</Text>
                        </View>
                    ) : isClosed || isJobHired ? (
                        <View style={styles.closedTag}>
                            <Text style={styles.closedTagText}>Already Hired</Text>
                        </View>
                    ) : (
                        <View style={styles.viewProfileTag}>
                            <Text style={styles.viewProfileTagText}>Tap to View & Hire</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const styles = getStyles(darkMode);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={darkMode ? Colors.textDark : "#1A1A1A"} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Worker Proposals</Text>
                    <Text style={styles.headerSubtitle}>{bids.length} professionals applied</Text>
                </View>
                <TouchableOpacity onPress={fetchBids} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {isJobHired && (
                <View style={styles.jobHiredBanner}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.jobHiredText}>A worker has been hired for this job</Text>
                </View>
            )}

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={bids}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderBidItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={60} color={darkMode ? Colors.gray[600] : "#DDD"} />
                            <Text style={styles.emptyText}>Waiting for proposals...</Text>
                        </View>
                    }
                />
            )}

        </SafeAreaView>
    );
}

const getStyles = (darkMode: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: darkMode ? Colors.backgroundDark : '#FBFBFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: darkMode ? Colors.surfaceDark : '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: darkMode ? Colors.borderDark : '#F0F0F0',
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: darkMode ? Colors.textDark : '#1A1A1A' },
    headerSubtitle: { fontSize: 13, color: darkMode ? Colors.textSecondaryDark : '#888' },
    backBtn: { padding: 8 },
    refreshBtn: { padding: 8, backgroundColor: darkMode ? '#1E3A5F' : '#F0F7F0', borderRadius: 10 },
    jobHiredBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 10,
        gap: 8,
    },
    jobHiredText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: { padding: 16 },
    card: {
        backgroundColor: darkMode ? Colors.surfaceDark : '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardInactive: {
        opacity: 0.7,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { position: 'relative' },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: darkMode ? Colors.gray[700] : '#F0F0F0',
    },
    initialsAvatar: {
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    hiredBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: darkMode ? Colors.surfaceDark : '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    workerMeta: { flex: 1, marginLeft: 15 },
    workerName: { fontSize: 17, fontWeight: '700', color: darkMode ? Colors.textDark : '#1A1A1A' },
    expertiseText: { fontSize: 13, color: darkMode ? Colors.textSecondaryDark : '#666', marginVertical: 2 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingText: { fontSize: 13, fontWeight: '700', marginLeft: 4, color: darkMode ? Colors.textDark : '#1A1A1A' },
    reviewCount: { fontSize: 12, color: darkMode ? '#888' : '#999', marginLeft: 4 },
    priceSection: { alignItems: 'flex-end' },
    bidLabel: { fontSize: 10, fontWeight: 'bold', color: darkMode ? Colors.textSecondaryDark : '#999', marginBottom: 2 },
    amount: { fontSize: 20, fontWeight: '800', color: Colors.primary },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: darkMode ? Colors.borderDark : '#F9F9F9',
    },
    skillsWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    skillTag: {
        backgroundColor: darkMode ? '#1E3A5F' : '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginRight: 8,
    },
    skillTagText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
    moreSkills: { fontSize: 11, color: darkMode ? Colors.textSecondaryDark : '#9CA3AF' },
    hiredTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    hiredTagText: {
        color: '#2E7D32',
        fontSize: 12,
        fontWeight: '600',
    },
    closedTag: {
        backgroundColor: darkMode ? Colors.gray[700] : '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    closedTagText: {
        color: darkMode ? Colors.textSecondaryDark : '#999',
        fontSize: 12,
        fontWeight: '600',
    },
    hireButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    hireButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
    },
    viewProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: darkMode ? '#1E3A5F' : '#E3F2FD',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    viewProfileText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    viewProfileTag: {
        backgroundColor: darkMode ? '#1E3A5F' : '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    viewProfileTagText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: darkMode ? Colors.textSecondaryDark : '#999', marginTop: 10 },
});
