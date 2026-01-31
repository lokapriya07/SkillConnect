import React, { useEffect, useState } from "react";
import {
    View, Text, FlatList, Image, TouchableOpacity,
    StyleSheet, ActivityIndicator, Dimensions
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// 1. Define an Interface for your Bid data
interface Bid {
    _id: string;
    bidAmount: number | string;
    workerId: {
        _id: string;
        name: string;
        profilePic: string;
        expertise?: string;
        skills?: string[];
        rating?: string;
    };
}

export default function WorkerBidsScreen() {
    const { jobId } = useLocalSearchParams();
    const router = useRouter();

    // 2. Assign the type to your state
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);

    const getFullUrl = (path: string) => {
        if (!path) return 'https://via.placeholder.com/150';
        const normalizedPath = path.replace(/\\/g, '/');
        return `${process.env.EXPO_PUBLIC_API_URL}/${normalizedPath}`;
    };

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/${jobId}/bids`);
                const data = await response.json();
                setBids(data);
            } catch (error) {
                console.error("❌ Error fetching bids:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBids();
    }, [jobId]);

    // 3. Update the render function to use the Interface
    const renderBidItem = ({ item }: { item: Bid }) => {
        const worker = item.workerId;

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => router.push({
                    // Updated to match your specific filename typo: attarctive
                    pathname: "/worker-attarctive-profile" as any,
                    params: {
                        workerData: JSON.stringify(worker),
                        bidAmount: item.bidAmount,
                        distanceInKm: "2.4"
                    }
                })}
            >
                <View style={styles.imageContainer}>
                    <Image source={{ uri: getFullUrl(worker.profilePic) }} style={styles.avatar} />
                    <View style={styles.proBadge}>
                        <Text style={styles.proText}>PRO</Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.workerName}>{worker.name}</Text>
                    <Text style={styles.expertiseText} numberOfLines={1}>
                        {worker.expertise || worker.skills?.[0] || "Service Provider"}
                    </Text>

                    <View style={styles.metaRow}>
                        <View style={styles.ratingBox}>
                            <Ionicons name="star" size={12} color="#f59e0b" />
                            <Text style={styles.ratingText}>{worker.rating || "5.0"}</Text>
                        </View>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.distanceText}>2.4 km away</Text>
                    </View>
                </View>

                <View style={styles.bidSection}>
                    <Text style={styles.bidLabel}>BID RATE</Text>
                    <Text style={styles.bidValue}>₹{item.bidAmount}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loaderText}>Finding the best workers...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Ranked Pros</Text>
                    <Text style={styles.headerSubtitle}>{bids.length} workers interested</Text>
                </View>
            </View>

            <FlatList
                data={bids}
                // TypeScript error is solved here by defining the Bid interface above
                keyExtractor={(item) => item._id}
                renderItem={renderBidItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="account-search-outline" size={80} color="#e2e8f0" />
                        <Text style={styles.emptyText}>Matching you with local pros...</Text>
                        <Text style={styles.emptySubText}>Bids usually appear within a few minutes.</Text>
                    </View>
                }
            />
        </View>
    );
}

// ... styles remain the same ...

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 12, color: '#64748b', fontWeight: '500' },
    header: {
        paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
        backgroundColor: 'white', flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    backBtn: { marginRight: 15, padding: 8, borderRadius: 12, backgroundColor: '#f1f5f9' },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
    headerSubtitle: { fontSize: 13, color: '#64748b' },
    listContent: { padding: 20 },
    card: {
        backgroundColor: 'white', borderRadius: 20, padding: 15,
        flexDirection: 'row', alignItems: 'center', marginBottom: 15,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
    },
    imageContainer: { position: 'relative' },
    avatar: { width: 70, height: 70, borderRadius: 18, backgroundColor: '#f1f5f9' },
    proBadge: {
        position: 'absolute', bottom: -5, right: -5,
        backgroundColor: '#3b82f6', paddingHorizontal: 6,
        paddingVertical: 2, borderRadius: 6, borderWidth: 2, borderColor: 'white'
    },
    proText: { color: 'white', fontSize: 8, fontWeight: '900' },
    infoSection: { flex: 1, marginLeft: 15 },
    workerName: { fontSize: 17, fontWeight: 'bold', color: '#1e293b' },
    expertiseText: { fontSize: 13, color: '#64748b', marginVertical: 2 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingBox: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7',
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6
    },
    ratingText: { marginLeft: 4, fontSize: 12, fontWeight: '700', color: '#b45309' },
    dot: { marginHorizontal: 6, color: '#cbd5e1' },
    distanceText: { fontSize: 12, color: '#94a3b8' },
    bidSection: { alignItems: 'flex-end', borderLeftWidth: 1, borderLeftColor: '#f1f5f9', paddingLeft: 15 },
    bidLabel: { fontSize: 9, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
    bidValue: { fontSize: 20, fontWeight: '900', color: '#10b981', marginVertical: 2 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: '700', color: '#475569', marginTop: 20 },
    emptySubText: { fontSize: 14, color: '#94a3b8', marginTop: 8, textAlign: 'center' }
});