<<<<<<< HEAD

// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { Colors } from '@/constants/Colors';

// // Fix: Define the shape of your data
// interface Bid {
//     _id: string;
//     bidAmount: number;
//     workerId: {
//         _id: string;
//         name: string;
//         profilePic: string;
//         expertise: string;
//         rating: number;
//     };
// }

// export default function WorkerBidsScreen() {
//     const { jobId } = useLocalSearchParams();
//     const router = useRouter();
//     const [bids, setBids] = useState<Bid[]>([]); // TypeScript fix here
//     const [loading, setLoading] = useState(true);


//     useEffect(() => {
//         fetchBids();
//     }, [jobId]);

//     const fetchBids = async () => {
//         try {
//             const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/${jobId}/bids`);
//             const data = await response.json();
//             setBids(data);
//         } catch (e) {
//             console.error(e);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => router.back()}>
//                     <Ionicons name="arrow-back" size={24} color="black" />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Ranked Workers</Text>
//                 <View style={{ width: 24 }} />
//             </View>

//             {loading ? <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} /> : (
//                 <FlatList
//                     data={bids}
//                     keyExtractor={(item) => item._id} // Error gone!
//                     contentContainerStyle={{ padding: 16 }}
//                     renderItem={({ item }) => (
//                         <TouchableOpacity
//                             style={styles.card}
//                             onPress={() => router.push({
//                                 pathname: `/worker-profile/${item.workerId._id}` as any,
//                                 params: {
//                                     bidAmount: item.bidAmount,
//                                     name: item.workerId.name,
//                                     pic: item.workerId.profilePic,
//                                     expertise: item.workerId.expertise
//                                 }
//                             })}
//                         >
//                             <Image source={{ uri: item.workerId.profilePic }} style={styles.pic} />
//                             <View style={styles.info}>
//                                 <Text style={styles.name}>{item.workerId.name}</Text>
//                                 <Text style={styles.expertise}>{item.workerId.expertise}</Text>
//                                 <View style={styles.ratingBox}>
//                                     <Ionicons name="star" size={12} color="#FFD700" />
//                                     <Text style={styles.ratingText}>{item.workerId.rating || '4.9'}</Text>
//                                 </View>
//                             </View>
//                             <View style={styles.bidBadge}>
//                                 <Text style={styles.bidLabel}>BID RATE</Text>
//                                 <Text style={styles.bidValue}>₹{item.bidAmount}</Text>
//                             </View>
//                         </TouchableOpacity>
//                     )}
//                 />
//             )}
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#fdfdfd' },
//     header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff' },
//     headerTitle: { fontSize: 20, fontWeight: 'bold' },
//     card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 15, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
//     pic: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#f0f0f0' },
//     info: { flex: 1, marginLeft: 15 },
//     name: { fontSize: 17, fontWeight: 'bold', color: '#333' },
//     expertise: { fontSize: 13, color: '#777', marginVertical: 2 },
//     ratingBox: { flexDirection: 'row', alignItems: 'center' },
//     ratingText: { fontSize: 12, marginLeft: 4, color: '#666', fontWeight: '600' },
//     bidBadge: { alignItems: 'flex-end' },
//     bidLabel: { fontSize: 9, color: '#999', letterSpacing: 1 },
//     bidValue: { fontSize: 20, fontWeight: '900', color: '#2E7D32' }
// });
import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    Image, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    Alert 

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


// Interface defining the structure of the bid with populated worker data


interface Bid {
    _id: string;
    bidAmount: number;
    createdAt: string;
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

    // Using your specific IP address for the connection
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:5000';

    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (jobId) {
            fetchBids();
        }
    }, [jobId]);

    const fetchBids = async () => {
        try {

            setLoading(true);
            // Calling the GET /api/jobs/:jobId/bids route from your backend
            const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/bids`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch bids');
            }

            const data = await response.json();
            setBids(data);
        } catch (e) {
            console.error("Fetch Error:", e);
            Alert.alert("Error", "Could not load bids. Please check your connection.");

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


    const renderBidItem = ({ item }: { item: Bid }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
                pathname: `/worker-profile/${item.workerId._id}` as any,
                params: {
                    bidAmount: item.bidAmount,
                    name: item.workerId.name,
                    pic: item.workerId.profilePic,
                    expertise: item.workerId.expertise
                }
            })}
        >
            {/* Worker Profile Image */}
            <Image 
                source={{ uri: item.workerId.profilePic || 'https://via.placeholder.com/150' }} 
                style={styles.pic} 
            />

            {/* Worker Details */}
            <View style={styles.info}>
                <Text style={styles.name}>{item.workerId.name}</Text>
                <Text style={styles.expertise}>{item.workerId.expertise || 'Service Provider'}</Text>
                
                <View style={styles.ratingBox}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                        {item.workerId.rating ? item.workerId.rating.toFixed(1) : '4.9'}
                    </Text>
                </View>
            </View>

            {/* Bid Amount Badge */}
            <View style={styles.bidBadge}>
                <Text style={styles.bidLabel}>BID RATE</Text>
                <Text style={styles.bidValue}>₹{item.bidAmount}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Available Bids</Text>
                <TouchableOpacity onPress={fetchBids}>
                    <Ionicons name="refresh" size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={bids}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={renderBidItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No bids received yet.</Text>
                        </View>
                    }
                />
            )}

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

    container: { flex: 1, backgroundColor: '#fdfdfd' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: 60, 
        paddingBottom: 20, 
        backgroundColor: '#fff' 
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backButton: { padding: 5 },
    card: { 
        flexDirection: 'row', 
        backgroundColor: '#fff', 
        padding: 15, 
        borderRadius: 20, 
        marginBottom: 15, 
        alignItems: 'center', 
        elevation: 4, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 8 
    },
    pic: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#f0f0f0' },
    info: { flex: 1, marginLeft: 15 },
    name: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    expertise: { fontSize: 13, color: '#777', marginVertical: 2 },
    ratingBox: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: 13, marginLeft: 4, color: '#666', fontWeight: '600' },
    bidBadge: { alignItems: 'flex-end' },
    bidLabel: { fontSize: 9, color: '#999', letterSpacing: 1 },
    bidValue: { fontSize: 20, fontWeight: '900', color: '#2E7D32' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#888', fontSize: 16 }

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