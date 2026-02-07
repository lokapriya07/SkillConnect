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

interface Bid {
    _id: string;
    bidAmount: number;
    createdAt: string;
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

    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:5000';

    useEffect(() => {
        if (jobId) fetchBids();
    }, [jobId]);

    const fetchBids = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/bids`);
            if (!response.ok) throw new Error('Failed to fetch bids');
            const data = await response.json();
            setBids(data);
        } catch (e) {
            Alert.alert("Error", "Could not load bids.");
        } finally {
            setLoading(false);
        }
    };

    const renderBidItem = ({ item }: { item: Bid }) => {
        const hasProfilePic = !!item.workerId.profilePic;
        const initials = item.workerId.name.charAt(0).toUpperCase();

        return (
            <TouchableOpacity
                style={styles.card}
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
                        <View style={styles.onlineBadge} />
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
                        <Text style={styles.amount}>₹{item.bidAmount}</Text>
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
                    <View style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View Profile</Text>
                        <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Worker Proposals</Text>
                    <Text style={styles.headerSubtitle}>{bids.length} professionals applied</Text>
                </View>
                <TouchableOpacity onPress={fetchBids} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

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
                            <Ionicons name="people-outline" size={60} color="#DDD" />
                            <Text style={styles.emptyText}>Waiting for proposals...</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBFBFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
    headerSubtitle: { fontSize: 13, color: '#888' },
    backBtn: { padding: 8 },
    refreshBtn: { padding: 8, backgroundColor: '#F0F7F0', borderRadius: 10 },
    listContent: { padding: 16 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { position: 'relative' },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    initialsAvatar: {
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    onlineBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    workerMeta: { flex: 1, marginLeft: 15 },
    workerName: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
    expertiseText: { fontSize: 13, color: '#666', marginVertical: 2 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingText: { fontSize: 13, fontWeight: '700', marginLeft: 4, color: '#1A1A1A' },
    reviewCount: { fontSize: 12, color: '#999', marginLeft: 4 },
    priceSection: { alignItems: 'flex-end' },
    bidLabel: { fontSize: 10, fontWeight: 'bold', color: '#999', marginBottom: 2 },
    amount: { fontSize: 20, fontWeight: '800', color: Colors.primary },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F9F9F9',
    },
    skillsWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    skillTag: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginRight: 8,
    },
    skillTagText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
    moreSkills: { fontSize: 11, color: '#9CA3AF' },
    viewButton: { flexDirection: 'row', alignItems: 'center' },
    viewButtonText: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginRight: 4 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 10 }
});
