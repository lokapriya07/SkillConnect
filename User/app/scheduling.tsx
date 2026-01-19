import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function SchedulingScreen() {
    const router = useRouter()
    const insets = useSafeAreaInsets()

    // --- STATE ---
    const [selectedDate, setSelectedDate] = useState("Today")
    const [selectedTime, setSelectedTime] = useState("10:00 AM")
    const [address, setAddress] = useState("Flat 402, Sunshine Apartments, Hitech City, Hyderabad")

    const dates = ["Today", "Tomorrow", "Jan 12", "Jan 13"]
    const times = ["09:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"]

    const handleFinalConfirm = () => {
        // Here you would update your global store job status to 'scheduled'
        router.push("/tracking" as any)
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Finalize Booking</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* 1. DATE SELECTION */}
                <Text style={styles.sectionLabel}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                    {dates.map(d => (
                        <TouchableOpacity
                            key={d}
                            style={[styles.dateChip, selectedDate === d && styles.activeChip]}
                            onPress={() => setSelectedDate(d)}
                        >
                            <Text style={[styles.chipText, selectedDate === d && styles.activeChipText]}>{d}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* 2. TIME SELECTION */}
                <Text style={[styles.sectionLabel, { marginTop: 30 }]}>Select Arrival Time</Text>
                <View style={styles.timeGrid}>
                    {times.map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.timeSlot, selectedTime === t && styles.activeTimeSlot]}
                            onPress={() => setSelectedTime(t)}
                        >
                            <Text style={[styles.chipText, selectedTime === t && styles.activeChipText]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 3. ADDRESS SECTION */}
                <Text style={[styles.sectionLabel, { marginTop: 30 }]}>Service Address</Text>
                <View style={styles.addressContainer}>
                    <View style={styles.addressHeader}>
                        <Ionicons name="location" size={20} color={Colors.primary} />
                        <Text style={styles.addressType}>Home</Text>
                    </View>
                    <TextInput
                        style={styles.addressInput}
                        multiline
                        value={address}
                        onChangeText={setAddress}
                    />
                    <TouchableOpacity style={styles.changeAddressBtn}>
                        <Text style={styles.changeAddressText}>Change Address</Text>
                    </TouchableOpacity>
                </View>

                {/* 4. SUMMARY CARD */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Worker Fee (Agreed Bid)</Text>
                        <Text style={styles.summaryValue}>₹450</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Platform Fee</Text>
                        <Text style={styles.summaryValue}>₹25</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total to Pay</Text>
                        <Text style={styles.totalValue}>₹475</Text>
                    </View>
                </View>

            </ScrollView>

            {/* FOOTER BUTTON */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleFinalConfirm}>
                    <Text style={styles.confirmBtnText}>Confirm & Schedule</Text>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
    scrollContent: { padding: 20, paddingBottom: 120 },
    sectionLabel: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 15 },

    // Chips
    chipRow: { flexDirection: 'row', marginBottom: 5 },
    dateChip: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F5F5F5', marginRight: 12, borderWidth: 1, borderColor: '#EEE' },
    activeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText: { fontSize: 14, fontWeight: '600', color: '#666' },
    activeChipText: { color: 'white' },

    // Time Grid
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    timeSlot: { width: '30%', paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#EEE' },
    activeTimeSlot: { backgroundColor: Colors.primary, borderColor: Colors.primary },

    // Address
    addressContainer: { padding: 16, borderRadius: 16, backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE' },
    addressHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    addressType: { fontWeight: '700', color: Colors.text },
    addressInput: { fontSize: 14, color: '#444', lineHeight: 20, textAlignVertical: 'top', minHeight: 60 },
    changeAddressBtn: { marginTop: 10, alignSelf: 'flex-start' },
    changeAddressText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },

    // Summary
    summaryCard: { marginTop: 30, padding: 20, backgroundColor: '#FFF9F0', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#FFD180' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { color: '#666', fontSize: 14 },
    summaryValue: { fontWeight: '600', color: Colors.text },
    totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#FFD180' },
    totalLabel: { fontSize: 16, fontWeight: '800', color: Colors.text },
    totalValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },

    // Footer
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
    confirmBtn: { backgroundColor: Colors.primary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    confirmBtnText: { color: 'white', fontSize: 18, fontWeight: '700' }
})