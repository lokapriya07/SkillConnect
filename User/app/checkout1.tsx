import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const PaymentMethods = () => {
    const methods = [
        { id: '1', type: 'Visa', last4: '4242', expiry: '12/26', icon: 'card', color: '#1A1F71' },
        { id: '2', type: 'Mastercard', last4: '8891', expiry: '09/25', icon: 'card', color: '#EB001B' },
        { id: '3', type: 'Apple Pay', last4: 'Pay', expiry: 'Active', icon: 'logo-apple', color: '#000000' },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.title}>Payment Methods</Text>
            <Text style={styles.subtitle}>Your saved cards and wallets</Text>

            {methods.map((item) => (
                <TouchableOpacity key={item.id} style={styles.card}>
                    <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                        <Ionicons name={item.icon as any} size={24} color="white" />
                    </View>
                    <View style={styles.cardDetails}>
                        <Text style={styles.cardName}>{item.type} •••• {item.last4}</Text>
                        <Text style={styles.cardExpiry}>Expires {item.expiry}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color={Colors.primary} />
                <Text style={styles.addButtonText}>Add New Method</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginTop: 40 },
    subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 30 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3
    },
    iconCircle: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cardDetails: { flex: 1, marginLeft: 15 },
    cardName: { fontSize: 16, fontWeight: '600', color: Colors.text },
    cardExpiry: { fontSize: 13, color: Colors.textSecondary },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: Colors.primary,
        marginTop: 10
    },
    addButtonText: { marginLeft: 10, color: Colors.primary, fontWeight: '700', fontSize: 16 }
});

export default PaymentMethods;