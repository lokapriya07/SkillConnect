import React, { useState } from "react"
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { useRouter } from "expo-router"

const MOCK_WORKERS = [
    { id: '1', name: 'Rajesh Kumar', rating: 4.8, jobs: 124, bid: 450, image: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Amit Singh', rating: 4.5, jobs: 89, bid: 600, image: 'https://i.pravatar.cc/150?u=2' },
]

export default function WorkerBidsScreen() {
    const router = useRouter()
    const [selectedWorker, setSelectedWorker] = useState<any>(null)

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
                <Text style={styles.title}>Available Workers</Text>
            </View>

            <FlatList
                data={MOCK_WORKERS}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.workerCard} onPress={() => setSelectedWorker(item)}>
                        <Image source={{ uri: item.image }} style={styles.avatar} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.workerName}>{item.name}</Text>
                            <View style={styles.row}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={styles.stats}>{item.rating} • {item.jobs} Jobs Done</Text>
                            </View>
                        </View>
                        <View style={styles.bidContainer}>
                            <Text style={styles.bidLabel}>Bid Amount</Text>
                            <Text style={styles.bidAmount}>₹{item.bid}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* Worker Profile Modal */}
            <Modal visible={!!selectedWorker} animationType="slide" presentationStyle="pageSheet">
                {selectedWorker && (
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Image source={{ uri: selectedWorker.image }} style={styles.largeAvatar} />
                        <Text style={styles.modalName}>{selectedWorker.name}</Text>
                        <Text style={styles.modalBio}>Expert plumber with 5+ years experience. Tools included.</Text>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.chatBtn}>
                                <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={() => router.push("/scheduling" as any)}
                            >
                                <Text style={styles.confirmText}>Accept Bid: ₹{selectedWorker.bid}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedWorker(null)}>
                            <Text>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, gap: 15 },
    title: { fontSize: 20, fontWeight: 'bold' },
    workerCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#eee', marginBottom: 12, alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    workerName: { fontSize: 16, fontWeight: '700' },
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    stats: { fontSize: 12, color: '#666', marginLeft: 4 },
    bidContainer: { alignItems: 'flex-end' },
    bidLabel: { fontSize: 10, color: '#666' },
    bidAmount: { fontSize: 18, fontWeight: '800', color: Colors.primary },
    modalContent: { flex: 1, padding: 30, alignItems: 'center' },
    modalHandle: { width: 40, height: 5, backgroundColor: '#ccc', borderRadius: 3, marginBottom: 20 },
    largeAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
    modalName: { fontSize: 22, fontWeight: 'bold' },
    modalBio: { textAlign: 'center', color: '#666', marginVertical: 15 },
    actionButtons: { flexDirection: 'row', gap: 10, marginTop: 20 },
    chatBtn: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
    confirmBtn: { flex: 1, height: 60, backgroundColor: Colors.primary, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    confirmText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    closeBtn: { marginTop: 20 }
})