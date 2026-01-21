
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const WORKERS = [
    { id: '1', name: 'Rahul Sharma', rating: 4.8, jobs: 124, price: 450, image: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Amit Verma', rating: 4.5, jobs: 89, price: 400, image: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', name: 'Suresh Kumar', rating: 4.2, jobs: 75, price: 380, image: 'https://i.pravatar.cc/150?u=3' },
];

export default function WorkerBidsScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedWorker, setSelectedWorker] = useState(WORKERS[0]);

    // --- HEADER COMPONENT ---
    const ScreenHeader = ({ title, showSub }: { title: string; showSub?: boolean }) => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={() => (step === 1 ? router.back() : setStep(1))}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitleText}>{title}</Text>
                <View style={{ width: 24 }} />
            </View>
            {showSub && (
                <View style={styles.headerSubBox}>
                    <Text style={styles.headerSubText}>Choose the best worker for your problem</Text>
                </View>
            )}
        </View>
    );

    // --- STEP 1: BIDS LIST ---
    const BidsList = () => (
        <View style={styles.screen}>
            <ScreenHeader title="Nearby Workers" showSub={true} />
            <FlatList
                data={WORKERS}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.workerCard}
                        onPress={() => { setSelectedWorker(item); setStep(2); }}
                    >
                        <Image source={{ uri: item.image }} style={styles.avatar} />
                        <View style={styles.workerDetails}>
                            <Text style={styles.workerName}>{item.name}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={styles.ratingText}>{item.rating} ({item.jobs} jobs)</Text>
                            </View>
                        </View>
                        <View style={styles.priceTag}>
                            <Text style={styles.priceLabel}>Bid Amount</Text>
                            <Text style={styles.priceAmt}>₹{item.price}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    // --- STEP 2: WORKER PROFILE ---
    const WorkerProfile = () => (
        <View style={styles.screen}>
            <ScreenHeader title="Worker Profile" />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.profileMainCard}>
                    <Image source={{ uri: selectedWorker.image }} style={styles.profileImg} />
                    <Text style={styles.profileName}>{selectedWorker.name}</Text>
                    <Text style={styles.profileBid}>Final Bid: ₹{selectedWorker.price}</Text>

                    <View style={styles.divider} />

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <Text style={styles.skillText}>• Pipe Leakage & Repair</Text>
                        <Text style={styles.skillText}>• Bathroom Fittings</Text>
                        <Text style={styles.skillText}>• Drainage Cleaning</Text>
                    </View>

                    <View style={styles.galleryGrid}>
                        {[1, 2, 3].map((i) => <View key={i} style={styles.galleryItem} />)}
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Rating & Reviews</Text>
                        <Text style={styles.ratingValue}>{selectedWorker.rating}/5 ⭐⭐⭐⭐</Text>
                        <Text style={styles.reviewComment}>"Prompt service and very professional. Solved the leak in 20 minutes."</Text>
                    </View>
                </View>
            </ScrollView>

            {/* FINAL ACTION BAR REDIRECTING TO CHECKOUT */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => router.push("/checkout" as any)}
                >
                    <Text style={styles.confirmBtnText}>Choose this Worker</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#007BFF' }}>
            {step === 1 ? <BidsList /> : <WorkerProfile />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F4F7FA' },
    headerContainer: { backgroundColor: '#007BFF', paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitleText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    headerSubBox: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginTop: 12 },
    headerSubText: { color: '#666', fontSize: 13 },

    listContainer: { padding: 15 },
    workerCard: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 2 },
    avatar: { width: 55, height: 55, borderRadius: 27.5 },
    workerDetails: { flex: 1, marginLeft: 12 },
    workerName: { fontSize: 16, fontWeight: 'bold' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingText: { fontSize: 12, color: '#888', marginLeft: 4 },
    priceTag: { backgroundColor: '#007BFF', padding: 8, borderRadius: 8, alignItems: 'center' },
    priceLabel: { color: 'white', fontSize: 9 },
    priceAmt: { color: 'white', fontWeight: 'bold', fontSize: 15 },

    profileMainCard: { backgroundColor: 'white', margin: 15, borderRadius: 20, padding: 20, alignItems: 'center', elevation: 3 },
    profileImg: { width: 90, height: 90, borderRadius: 45, marginTop: -10, borderWidth: 3, borderColor: '#007BFF' },
    profileName: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
    profileBid: { color: '#007BFF', fontWeight: '600', marginBottom: 15 },
    divider: { height: 1, backgroundColor: '#EEE', width: '100%', marginBottom: 15 },
    infoSection: { alignSelf: 'stretch', marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    skillText: { color: '#555', marginBottom: 4 },
    galleryGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
    galleryItem: { width: '31%', height: 70, backgroundColor: '#E8E8E8', borderRadius: 8 },
    ratingValue: { fontSize: 18, fontWeight: 'bold' },
    reviewComment: { color: '#777', fontStyle: 'italic', marginTop: 5 },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
    confirmBtn: { backgroundColor: '#007BFF', padding: 16, borderRadius: 12, alignItems: 'center' },
    confirmBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});