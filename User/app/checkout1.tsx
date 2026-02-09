import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/lib/store';

const PaymentMethods = () => {
    const darkMode = useAppStore((state) => state.darkMode);
    
    const methods = [
        { id: '1', type: 'Visa', last4: '4242', expiry: '12/26', icon: 'card', color: '#1A1F71' },
        { id: '2', type: 'Mastercard', last4: '8891', expiry: '09/25', icon: 'card', color: '#EB001B' },
        { id: '3', type: 'Apple Pay', last4: 'Pay', expiry: 'Active', icon: 'logo-apple', color: '#000000' },
    ];

    const styles = getStyles(darkMode);

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
                    <Ionicons name="chevron-forward" size={20} color={darkMode ? Colors.textSecondaryDark : Colors.textSecondary} />
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color={Colors.primary} />
                <Text style={styles.addButtonText}>Add New Method</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const getStyles = (darkMode: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: darkMode ? Colors.backgroundDark : Colors.background },
    title: { fontSize: 28, fontWeight: '800', color: darkMode ? Colors.textDark : Colors.text, marginTop: 40 },
    subtitle: { fontSize: 16, color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary, marginBottom: 30 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: darkMode ? Colors.surfaceDark : Colors.white,
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
    cardName: { fontSize: 16, fontWeight: '600', color: darkMode ? Colors.textDark : Colors.text },
    cardExpiry: { fontSize: 13, color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: Colors.primary,
        marginTop: 10,
        backgroundColor: darkMode ? Colors.surfaceDark : '#fff'
    },
    addButtonText: { marginLeft: 10, color: Colors.primary, fontWeight: '700', fontSize: 16 }
});

export default PaymentMethods;
