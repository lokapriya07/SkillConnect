import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Modal,
    StyleSheet,
    TouchableOpacity
} from "react-native";
// Correcting imports to match your project structure
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Standardizing Button import
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, X } from "lucide-react-native";

interface Transaction {
    id: string;
    type: "earning" | "withdrawal" | "refund" | "fee";
    description: string;
    amount: number;
    date: string;
    status: "completed" | "pending" | "failed";
}

const transactions: Transaction[] = [
    { id: "1", type: "earning", description: "Electrical Panel Upgrade", amount: 1000, date: "Dec 5, 2024", status: "completed" },
    { id: "2", type: "withdrawal", description: "Bank Account ****4532", amount: -500, date: "Dec 3, 2024", status: "completed" },
    { id: "3", type: "fee", description: "Platform service fee", amount: -50, date: "Dec 2, 2024", status: "completed" },
    { id: "4", type: "earning", description: "Plumbing Repair", amount: 350, date: "Nov 30, 2024", status: "completed" },
    { id: "5", type: "earning", description: "HVAC Maintenance", amount: 75, date: "Nov 21, 2024", status: "pending" },
];

const stats = {
    currentBalance: 1875,
    pendingPayouts: 75,
    thisMonth: 1425,
    lastMonth: 3200,
    totalEarned: 24500,
};

export default function EarningsPage() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");

    const getTransactionIcon = (type: Transaction["type"]) => {
        switch (type) {
            case "earning": return <ArrowDownRight color="#22c55e" size={18} />;
            case "withdrawal": return <ArrowUpRight color="#2563eb" size={18} />;
            default: return <ArrowUpRight color="#64748b" size={18} />;
        }
    };

    const getStatusColor = (status: Transaction["status"]) => {
        switch (status) {
            case "completed": return "#22c55e";
            case "pending": return "#f59e0b";
            default: return "#ef4444";
        }
    };

    const monthChange = ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Earnings & Wallet</Text>
                    <Text style={styles.subtitle}>Track your income and payouts</Text>
                </View>
                <Button
                    onPress={() => setIsModalVisible(true)}
                    title="Withdraw"
                    style={{ width: 100 }}
                />
            </View>

            {/* Balance Cards */}
            <View style={styles.statsGrid}>
                <Card style={styles.balanceCard}>
                    <CardContent>
                        <Text style={styles.statLabel}>Available Balance</Text>
                        <Text style={styles.balanceValue}>${stats.currentBalance.toLocaleString()}</Text>
                    </CardContent>
                </Card>

                <View style={styles.subStatsRow}>
                    <Card style={styles.subCard}>
                        <CardContent>
                            <Text style={styles.smallLabel}>This Month</Text>
                            <Text style={styles.smallValue}>${stats.thisMonth}</Text>
                            <Text style={{ color: monthChange >= 0 ? "#22c55e" : "#ef4444", fontSize: 10 }}>
                                {monthChange >= 0 ? "↑" : "↓"} {Math.abs(monthChange).toFixed(1)}%
                            </Text>
                        </CardContent>
                    </Card>
                    <Card style={styles.subCard}>
                        <CardContent>
                            <Text style={styles.smallLabel}>Total Earned</Text>
                            <Text style={styles.smallValue}>${stats.totalEarned.toLocaleString()}</Text>
                        </CardContent>
                    </Card>
                </View>
            </View>

            {/* Transactions Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Transaction History</Text>
            </View>

            {transactions.map((tx) => (
                <Card key={tx.id} style={styles.txCard}>
                    <CardContent style={styles.txRow}>
                        <View style={styles.txLeft}>
                            <View style={styles.iconCircle}>
                                {getTransactionIcon(tx.type)}
                            </View>
                            <View>
                                <Text style={styles.txTitle}>{tx.description}</Text>
                                <Text style={styles.txDate}>{tx.date}</Text>
                            </View>
                        </View>
                        <View style={styles.txRight}>
                            <Text style={[styles.txAmount, { color: tx.amount > 0 ? "#22c55e" : "#1e293b" }]}>
                                {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount)}
                            </Text>
                            <Badge color={getStatusColor(tx.status)}>{tx.status}</Badge>
                        </View>
                    </CardContent>
                </Card>
            ))}

            {/* Withdraw Modal */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Withdraw Funds</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>Available: ${stats.currentBalance}</Text>

                        <TextInput
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            value={withdrawAmount}
                            onChangeText={setWithdrawAmount}
                            style={styles.input}
                            placeholderTextColor="#94a3b8"
                        />

                        <Button
                            title={`Confirm Withdrawal $${withdrawAmount || "0"}`}
                            onPress={() => setIsModalVisible(false)}
                            disabled={!withdrawAmount}
                        />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 10
    },
    title: { fontSize: 22, fontWeight: "700", color: "#1e293b" },
    subtitle: { fontSize: 13, color: "#64748b" },
    statsGrid: { gap: 12 },
    balanceCard: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
    balanceValue: { fontSize: 28, fontWeight: "800", color: "#2563eb", marginTop: 4 },
    statLabel: { fontSize: 13, color: "#64748b", fontWeight: "500" },
    subStatsRow: { flexDirection: "row", gap: 12 },
    subCard: { flex: 1 },
    smallLabel: { fontSize: 11, color: "#64748b" },
    smallValue: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
    sectionHeader: { marginTop: 24, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
    txCard: { marginBottom: 8 },
    txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    txLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
    txTitle: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
    txDate: { fontSize: 12, color: "#94a3b8" },
    txRight: { alignItems: "flex-end", gap: 4 },
    txAmount: { fontSize: 15, fontWeight: "700" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
    modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: "700" },
    modalSubtitle: { color: "#64748b", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#e2e8f0", padding: 12, borderRadius: 10, fontSize: 18, marginBottom: 20, color: "#1e293b" }
});