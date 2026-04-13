import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";

// Correcting imports to match your project structure
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button"; // Standardizing Button import
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, X, Gift } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Transaction {
    id: string;
    type: "earning" | "withdrawal" | "refund" | "fee" | "points_earned" | "points_redeemed";
    description: string;
    amount: number;
    date: string;
    status: "completed" | "pending" | "failed";
}

interface WalletData {
    currentBalance: number;
    pendingPayouts: number;
    thisMonth: number;
    lastMonth: number;
    totalEarned: number;
    totalPoints: number;
    availablePoints: number;
    redeemedPoints: number;
}


export default function EarningsPage() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPointsRedeemVisible, setIsPointsRedeemVisible] = useState(false);
    const [redeemPoints, setRedeemPoints] = useState("");
    
    // Dynamic state
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<WalletData>({
        currentBalance: 0,
        pendingPayouts: 0,
        thisMonth: 0,
        lastMonth: 0,
        totalEarned: 0,
        totalPoints: 0,
        availablePoints: 0,
        redeemedPoints: 0,
    });

    // Fetch earnings and points data from backend
    useEffect(() => {
        const fetchEarningsData = async () => {
            try {
                setLoading(true);
                const workerId = await AsyncStorage.getItem("userId") || await AsyncStorage.getItem("workerId");
                
                if (!workerId) {
                    console.error('[EARNINGS] Worker ID not found');
                    setLoading(false);
                    return;
                }

                // Fetch all assigned/hired jobs then pick out completed ones
                const jobsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/worker/${workerId}/assigned-jobs`);

                if (jobsResponse.ok) {
                    const body = await jobsResponse.json();
                    const allJobs = body.jobs || [];
                    const completedJobs = allJobs.filter((j: any) => j.status === 'completed');
                    console.log('[EARNINGS] Completed jobs count', completedJobs.length, completedJobs);

                    // Generate transaction entries from completed jobs
                    const completedTransactions: Transaction[] = completedJobs.map((job: any, index: number) => {
                        const pointsEarned = Math.ceil((job.budget?.max || 100) / 10); // 1 point per $10 earned
                        return {
                            id: job._id || job._id || `job-${index}`,
                            type: "points_earned",
                            description: job.description?.slice(0, 50) || "Job Completed",
                            amount: pointsEarned,
                            date: new Date(job.completedAt || job.updatedAt || job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                            status: "completed",
                        };
                    });

                    setTransactions(completedTransactions);

                    // Calculate total points
                    const totalPoints = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
                    
                    setStats(prevStats => ({
                        ...prevStats,
                        totalPoints: totalPoints,
                        availablePoints: totalPoints,
                    }));
                }
            } catch (error) {
                console.error('[EARNINGS] Fetch error:', error);
                // Keep default values on error
            } finally {
                setLoading(false);
            }
        };

        fetchEarningsData();
    }, []);

    const getTransactionIcon = (type: Transaction["type"]) => {
        switch (type) {
            case "earning": return <ArrowDownRight color="#22c55e" size={18} />;
            case "withdrawal": return <ArrowUpRight color="#2563eb" size={18} />;
            case "points_earned": return <Gift color="#f59e0b" size={18} />;
            case "points_redeemed": return <Gift color="#8b5cf6" size={18} />;
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

    const handleRedeemPoints = async () => {
        if (!redeemPoints || parseInt(redeemPoints) === 0) {
            alert("Please enter a valid amount");
            return;
        }

        try {
            const workerId = await AsyncStorage.getItem("userId") || await AsyncStorage.getItem("workerId");
            if (!workerId) return;

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/work/redeem-points/${workerId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pointsToRedeem: parseInt(redeemPoints) }),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Points redeemed successfully!");
                setRedeemPoints("");
                setIsPointsRedeemVisible(false);
                // Refresh data
                const earningsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/work/earnings/${workerId}`);
                const updatedData = await earningsResponse.json();
                if (updatedData.success) {
                    setStats({
                        ...stats,
                        availablePoints: updatedData.availablePoints || 0,
                        redeemedPoints: updatedData.redeemedPoints || 0,
                        currentBalance: updatedData.currentBalance || 0,
                    });
                }
            } else {
                alert("Failed to redeem points");
            }
        } catch (error) {
            console.error('[EARNINGS] Redeem error:', error);
            alert("Error redeeming points");
        }
    };


    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.loadingText}>Loading earnings...</Text>
                </View>
            ) : (
            <>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Points Wallet</Text>
                    <Text style={styles.subtitle}>View and redeem your reward points</Text>
                </View>
            </View>

            {/* Points Wallet Section */}
            <Card style={styles.pointsCard}>
                <CardContent style={styles.pointsCenter}>
                    <Gift size={64} color="#f59e0b" />
                    <Text style={styles.pointsValueLarge}>{stats.totalPoints}</Text>
                    <Text style={styles.pointsLabel}>Total Points</Text>
                    <Button
                        title="Redeem"
                        onPress={() => setIsPointsRedeemVisible(true)}
                        disabled={stats.availablePoints === 0}
                        style={styles.redeemBtn}
                    />
                    {stats.availablePoints === 0 && (
                        <Text style={styles.pointsSubtitle}>Earn points by posting jobs</Text>
                    )}
                    {/* progress bar toward next reward */}
                    <View style={styles.progressContainer}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${Math.min((stats.totalPoints/500)*100, 100)}%` },
                            ]}
                        />
                    </View>
                    <Text style={styles.nextTierText}>
                        {Math.max(0, 500 - stats.totalPoints)} pts to $1 bonus
                    </Text>
                </CardContent>
            </Card>

            {/* Points History Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📊 Points Breakdown</Text>
            </View>

            {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Gift size={48} color="#f59e0b" />
                    <Text style={styles.emptyStateText}>No points yet. Post jobs to start earning!</Text>
                </View>
            ) : (
                transactions.map((tx) => (
                    <Card key={tx.id} style={styles.transactionCard}>
                        <CardContent>
                            <View style={styles.txTopRow}>
                                <View style={styles.txLeft}>
                                    <View style={[styles.iconCircle, styles.iconBg]}>
                                        {getTransactionIcon(tx.type)}
                                    </View>
                                    <Text style={styles.txTitle} numberOfLines={1} ellipsizeMode="tail">{tx.description}</Text>
                                </View>
                                <Text style={[styles.txAmount, { color: "#f59e0b" }]}>
                                    +{tx.amount} pts
                                </Text>
                            </View>
                            <View style={styles.txBottomRow}>
                                <Text style={styles.txDate}>{tx.date}</Text>
                                <Badge color={getStatusColor(tx.status)}>{tx.status}</Badge>
                            </View>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* Points Redemption Modal */}
            <Modal visible={isPointsRedeemVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Redeem Points</Text>
                            <TouchableOpacity onPress={() => setIsPointsRedeemVisible(false)}>
                                <X size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>Available Points: {stats.availablePoints}</Text>
                        <Text style={styles.redemptionRate}>1 Point = $0.01</Text>

                        <TextInput
                            placeholder="Enter points to redeem"
                            keyboardType="number-pad"
                            value={redeemPoints}
                            onChangeText={setRedeemPoints}
                            style={styles.input}
                            placeholderTextColor="#94a3b8"
                        />

                        {redeemPoints && (
                            <Text style={styles.redemptionPreview}>
                                You will receive: ${(parseInt(redeemPoints) * 0.01).toFixed(2)}
                            </Text>
                        )}

                        <Button
                            title={`Redeem ${redeemPoints || "0"} Points`}
                            onPress={handleRedeemPoints}
                            disabled={!redeemPoints || parseInt(redeemPoints) === 0}
                        />
                    </View>
                </View>
            </Modal>
            </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 300 },
    loadingText: { marginTop: 12, fontSize: 14, color: "#64748b" },
    header: {
        marginBottom: 20,
        marginTop: 10
    },
    title: { fontSize: 22, fontWeight: "700", color: "#1e293b" },
    subtitle: { fontSize: 13, color: "#64748b" },
    sectionHeader: { marginTop: 16, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
    pointsCard: { backgroundColor: "#fef3c7", borderColor: "#fcd34d", borderRadius: 16, marginBottom: 16 },
    pointsCenter: { alignItems: "center", gap: 8, padding: 24 },
    pointsValueLarge: { fontSize: 40, fontWeight: "900", color: "#f59e0b" },
    pointsLabel: { fontSize: 14, color: "#92400e", fontWeight: "600" },
    pointsSubtitle: { fontSize: 13, color: "#92400e", marginTop: 8, fontStyle: "italic" },
    nextTierText: { fontSize: 12, color: "#52525b", marginTop: 6 },
    redeemBtn: { marginTop: 12, width: 140 },
    txCard: { marginBottom: 8 },
    transactionCard: { marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    iconBg: { backgroundColor: '#fde68a' },
    txTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    txLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    txBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center" },
    txTitle: { fontSize: 14, fontWeight: "600", color: "#1e293b", flex: 1 },
    txDate: { fontSize: 12, color: "#94a3b8" },
    txAmount: { fontSize: 16, fontWeight: "700" },
    emptyState: { paddingVertical: 30, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyStateText: { fontSize: 14, color: "#94a3b8", textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
    modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: "700" },
    modalSubtitle: { color: "#64748b", marginBottom: 10, fontSize: 14 },
    redemptionRate: { color: "#f59e0b", marginBottom: 15, fontSize: 13, fontWeight: "600" },
    redemptionPreview: { color: "#f59e0b", marginBottom: 15, fontSize: 13, fontWeight: "600", textAlign: "center" },
    input: { borderWidth: 1, borderColor: "#e2e8f0", padding: 12, borderRadius: 10, fontSize: 18, marginBottom: 20, color: "#1e293b" },
    progressContainer: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden", width: "100%", marginTop: 12 },
    progressFill: { height: "100%", backgroundColor: "#f59e0b" }
});