// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useState } from 'react';
// import {
//   FlatList,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// const WORKERS = [
//   { id: '1', name: 'Rahul Sharma', rating: 4.8, jobs: 124, price: 450, image: 'https://i.pravatar.cc/150?u=1' },
//   { id: '2', name: 'Amit Verma', rating: 4.5, jobs: 89, price: 400, image: 'https://i.pravatar.cc/150?u=2' },
//   { id: '3', name: 'Suresh Kumar', rating: 4.2, jobs: 75, price: 380, image: 'https://i.pravatar.cc/150?u=3' },
// ];

// export default function WorkerBidsScreen() {
//   const router = useRouter();
//   const [step, setStep] = useState(1); 
//   const [selectedWorker, setSelectedWorker] = useState(WORKERS[0]);
//   const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash or Online
//   const [onlineType, setOnlineType] = useState('UPI'); // UPI or Card

//   // --- HEADER COMPONENT (Adjusted for less gap) ---
//   const ScreenHeader = ({ title, showSub }: { title: string; showSub?: boolean }) => (
//     <View style={styles.headerContainer}>
//       <View style={styles.headerTopRow}>
//         <TouchableOpacity onPress={() => (step === 1 ? router.back() : setStep(step - 1))}>
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitleText}>{title}</Text>
//         <View style={{ width: 24 }} /> 
//       </View>
//       {showSub && (
//         <View style={styles.headerSubBox}>
//           <Text style={styles.headerSubText}>Choose the best worker for your problem</Text>
//         </View>
//       )}
//     </View>
//   );

//   // --- STEP 1: BIDS LIST ---
//   const BidsList = () => (
//     <View style={styles.screen}>
//       <ScreenHeader title="Nearby Workers" showSub={true} />
//       <FlatList
//         data={WORKERS}
//         contentContainerStyle={styles.listContainer}
//         renderItem={({ item }) => (
//           <TouchableOpacity style={styles.workerCard} onPress={() => { setSelectedWorker(item); setStep(2); }}>
//             <Image source={{ uri: item.image }} style={styles.avatar} />
//             <View style={styles.workerDetails}>
//               <Text style={styles.workerName}>{item.name}</Text>
//               <View style={styles.ratingRow}>
//                 <Ionicons name="star" size={14} color="#FFD700" />
//                 <Text style={styles.ratingText}>{item.rating} ({item.jobs} jobs)</Text>
//               </View>
//             </View>
//             <View style={styles.priceTag}>
//               <Text style={styles.priceLabel}>Bid Amount</Text>
//               <Text style={styles.priceAmt}>₹{item.price}</Text>
//             </View>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );

//   // --- STEP 2: PROFILE ---
//   const WorkerProfile = () => (
//     <View style={styles.screen}>
//       <ScreenHeader title="Worker Profile" />
//       <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
//         <View style={styles.profileMainCard}>
//           <Image source={{ uri: selectedWorker.image }} style={styles.profileImg} />
//           <Text style={styles.profileName}>{selectedWorker.name}</Text>
//           <Text style={styles.profileBid}>Final Bid: ₹{selectedWorker.price}</Text>

//           <View style={styles.divider} />

//           <View style={styles.infoSection}>
//             <Text style={styles.sectionTitle}>Skills</Text>
//             <Text style={styles.skillText}>• Pipe Leakage & Repair</Text>
//             <Text style={styles.skillText}>• Bathroom Fittings</Text>
//             <Text style={styles.skillText}>• Drainage Cleaning</Text>
//           </View>

//           <View style={styles.galleryGrid}>
//             {[1, 2, 3].map((i) => <View key={i} style={styles.galleryItem} />)}
//           </View>

//           <View style={styles.infoSection}>
//             <Text style={styles.sectionTitle}>Rating & Reviews</Text>
//             <Text style={styles.ratingValue}>{selectedWorker.rating}/5 ⭐⭐⭐⭐</Text>
//             <Text style={styles.reviewComment}>"Prompt service and very professional. Solved the leak in 20 minutes."</Text>
//           </View>
//         </View>
//       </ScrollView>
//       <View style={styles.bottomBar}>
//         <TouchableOpacity style={styles.confirmBtn} onPress={() => setStep(3)}>
//           <Text style={styles.confirmBtnText}>Choose this Worker</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   // --- STEP 3: FINALIZE & PAYMENT ---
//   const Finalize = () => (
//     <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.screen}>
//       <ScreenHeader title="Finalize Schedule" />
//       <ScrollView contentContainerStyle={styles.formPadding}>
//         <Text style={styles.label}>Service Address</Text>
//         <TextInput style={styles.input} placeholder="123, Blue Tower, Sector 5..." />

//         <View style={styles.row}>
//           <View style={{ flex: 1, marginRight: 10 }}>
//             <Text style={styles.label}>Date</Text>
//             <TextInput style={styles.input} placeholder="DD/MM/YYYY" />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.label}>Time</Text>
//             <TextInput style={styles.input} placeholder="09:00 AM" />
//           </View>
//         </View>

//         <Text style={styles.label}>Payment Method</Text>
//         <View style={styles.toggleContainer}>
//           <TouchableOpacity 
//             style={[styles.toggleBtn, paymentMethod === 'Cash' && styles.toggleActive]} 
//             onPress={() => setPaymentMethod('Cash')}>
//             <Text style={[styles.toggleText, paymentMethod === 'Cash' && styles.textWhite]}>Cash</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={[styles.toggleBtn, paymentMethod === 'Online' && styles.toggleActive]} 
//             onPress={() => setPaymentMethod('Online')}>
//             <Text style={[styles.toggleText, paymentMethod === 'Online' && styles.textWhite]}>Online</Text>
//           </TouchableOpacity>
//         </View>

//         {paymentMethod === 'Online' && (
//           <View style={styles.onlineOptions}>
//             <TouchableOpacity style={styles.paymentRow} onPress={() => setOnlineType('UPI')}>
//               <MaterialCommunityIcons name={onlineType === 'UPI' ? "radiobox-marked" : "radiobox-blank"} size={20} color="#007BFF" />
//               <Ionicons name="flash-outline" size={20} color="#4CAF50" style={{ marginLeft: 10 }} />
//               <Text style={styles.paymentRowText}>UPI (GPay, PhonePe, Paytm)</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.paymentRow} onPress={() => setOnlineType('Card')}>
//               <MaterialCommunityIcons name={onlineType === 'Card' ? "radiobox-marked" : "radiobox-blank"} size={20} color="#007BFF" />
//               <Ionicons name="card-outline" size={20} color="#FF9800" style={{ marginLeft: 10 }} />
//               <Text style={styles.paymentRowText}>Debit / Credit Card</Text>
//             </TouchableOpacity>

//             {onlineType === 'Card' && (
//               <View style={styles.cardInputContainer}>
//                 <TextInput style={styles.cardInput} placeholder="Card Number" keyboardType="numeric" />
//                 <View style={styles.row}>
//                   <TextInput style={[styles.cardInput, { flex: 1, marginRight: 5 }]} placeholder="MM/YY" />
//                   <TextInput style={[styles.cardInput, { flex: 1 }]} placeholder="CVV" secureTextEntry keyboardType="numeric" />
//                 </View>
//               </View>
//             )}
//           </View>
//         )}
//       </ScrollView>
//       <View style={styles.bottomBar}>
//         <TouchableOpacity style={styles.confirmBtn} onPress={() => alert("Booking confirmed!")}>
//           <Text style={styles.confirmBtnText}>Confirm Booking</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#007BFF' }}>
//       {step === 1 && <BidsList />}
//       {step === 2 && <WorkerProfile />}
//       {step === 3 && <Finalize />}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: '#F4F7FA' },
//   // Header Adjustments
//   headerContainer: { backgroundColor: '#007BFF', paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
//   headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   headerTitleText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
//   headerSubBox: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginTop: 12 },
//   headerSubText: { color: '#666', fontSize: 13 },

//   // List Items
//   listContainer: { padding: 15 },
//   workerCard: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 2 },
//   avatar: { width: 55, height: 55, borderRadius: 27.5 },
//   workerDetails: { flex: 1, marginLeft: 12 },
//   workerName: { fontSize: 16, fontWeight: 'bold' },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
//   ratingText: { fontSize: 12, color: '#888', marginLeft: 4 },
//   priceTag: { backgroundColor: '#007BFF', padding: 8, borderRadius: 8, alignItems: 'center' },
//   priceLabel: { color: 'white', fontSize: 9 },
//   priceAmt: { color: 'white', fontWeight: 'bold', fontSize: 15 },

//   // Profile
//   profileMainCard: { backgroundColor: 'white', margin: 15, borderRadius: 20, padding: 20, alignItems: 'center', elevation: 3 },
//   profileImg: { width: 90, height: 90, borderRadius: 45, marginTop: -10, borderWidth: 3, borderColor: '#007BFF' },
//   profileName: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
//   profileBid: { color: '#007BFF', fontWeight: '600', marginBottom: 15 },
//   divider: { height: 1, backgroundColor: '#EEE', width: '100%', marginBottom: 15 },
//   infoSection: { alignSelf: 'stretch', marginBottom: 20 },
//   sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
//   skillText: { color: '#555', marginBottom: 4 },
//   galleryGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
//   galleryItem: { width: '31%', height: 70, backgroundColor: '#E8E8E8', borderRadius: 8 },
//   ratingValue: { fontSize: 18, fontWeight: 'bold' },
//   reviewComment: { color: '#777', fontStyle: 'italic', marginTop: 5 },

//   // Form & Payment
//   formPadding: { padding: 20 },
//   label: { fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 15 },
//   input: { backgroundColor: 'white', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#DDD' },
//   row: { flexDirection: 'row' },
//   toggleContainer: { flexDirection: 'row', backgroundColor: '#DDD', borderRadius: 25, padding: 4, marginTop: 5 },
//   toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 21 },
//   toggleActive: { backgroundColor: '#007BFF' },
//   toggleText: { fontWeight: 'bold', color: '#666' },
//   textWhite: { color: 'white' },

//   // UPI/Card UI
//   onlineOptions: { marginTop: 15, backgroundColor: '#FFF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
//   paymentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
//   paymentRowText: { fontSize: 14, color: '#333', fontWeight: '500' },
//   cardInputContainer: { marginTop: 10 },
//   cardInput: { backgroundColor: '#F9F9F9', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', marginBottom: 8 },

//   // Bottom Fixed Bar
//   bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
//   confirmBtn: { backgroundColor: '#007BFF', padding: 16, borderRadius: 12, alignItems: 'center' },
//   confirmBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
// });
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