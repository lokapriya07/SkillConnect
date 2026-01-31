import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";

interface Bid {
    _id: string;
    bidAmount: number;
    workerId: {
        _id: string;
        name: string;
        skills: string[];
        // Add profilePic if your backend provides it, otherwise use a placeholder
        profilePic?: string;
    };
}

export default function WorkerBidsScreen() {
    const { jobId } = useLocalSearchParams();
    const router = useRouter();
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBids();
    }, [jobId]);

    const fetchBids = async () => {
        try {
            // Replace with your actual IP/Domain from the screenshot
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/${jobId}/bids`);
            const data = await response.json();
            setBids(data);
        } catch (error) {
            console.error("Error fetching bids:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderWorkerItem = ({ item }: { item: Bid }) => (
        <TouchableOpacity
            style={styles.workerCard}
            onPress={() => router.push(`/worker-profile/${item.workerId._id}` as any)}
        >
            <Image
                source={{ uri: item.workerId.profilePic || 'https://via.placeholder.com/100' }}
                style={styles.avatar}
            />

            <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{item.workerId.name}</Text>
                <Text style={styles.workerSkills}>{item.workerId.skills.join(', ')}</Text>
            </View>

            <View style={styles.bidContainer}>
                <Text style={styles.bidLabel}>Bid Amount</Text>
                <Text style={styles.bidValue}>₹{item.bidAmount}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} color={Colors.primary} />;

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Ranked Bids</Text>
            <FlatList
                data={bids}
                keyExtractor={(item) => item._id}
                renderItem={renderWorkerItem}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={<Text style={styles.emptyText}>No bids received yet.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', padding: 20, paddingTop: 60 },
    workerCard: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30, // Makes it a circle
        backgroundColor: '#eee',
    },
    workerInfo: { flex: 1, marginLeft: 15 },
    workerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    workerSkills: { fontSize: 13, color: '#666', marginTop: 4 },
    bidContainer: { alignItems: 'flex-end', marginRight: 10 },
    bidLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase' },
    bidValue: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});