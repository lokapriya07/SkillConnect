import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/lib/store'

const plans = [
    {
        id: 'basic',
        title: 'Basic',
        price: '₹0/month',
        originalPrice: '₹299',
        benefits: ['5 services/month', 'Standard support', 'Basic priority'],
        isPopular: false
    },
    {
        id: 'plus',
        title: 'ServiceHub Plus',
        price: '₹199/month',
        originalPrice: '₹499',
        benefits: ['Unlimited services', 'Priority support', 'Same day booking', 'Cancel anytime'],
        isPopular: true
    },
    {
        id: 'premium',
        title: 'Premium',
        price: '₹499/month',
        originalPrice: '₹999',
        benefits: ['Unlimited services', 'VIP support 24/7', 'Instant booking', 'Dedicated manager', 'Free cancellations'],
        isPopular: false
    }
]

export default function ServiceUpgradeScreen() {
    const router = useRouter()
    const { setAuthenticated } = useAppStore()
    const [selectedPlan, setSelectedPlan] = useState('plus')
    const darkMode = useAppStore((state) => state.darkMode)

    const subscribePlan = (planId: string) => {
        setSelectedPlan(planId)
        // Simulate subscription process
        setTimeout(() => {
            // Here you would integrate with your payment gateway
            // For demo - show success
            router.push('/profile')
        }, 1500)
    }

    const styles = getStyles(darkMode)

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upgrade to Plus</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.crownIcon}>
                        <Ionicons name="diamond-outline" size={32} color="#FFD700" />
                    </View>
                    <Text style={styles.heroTitle}>Unlock ServiceHub Plus</Text>
                    <Text style={styles.heroSubtitle}>
                        Get exclusive benefits and priority service
                    </Text>
                </View>

                {/* Plans */}
                <View style={styles.plansSection}>
                    <Text style={styles.sectionTitle}>Choose your plan</Text>
                    <View style={styles.plansContainer}>
                        {plans.map((plan, index) => (
                            <TouchableOpacity
                                key={plan.id}
                                style={[
                                    styles.planCard,
                                    plan.isPopular && styles.popularPlanCard,
                                    selectedPlan === plan.id && styles.selectedPlanCard
                                ]}
                                onPress={() => setSelectedPlan(plan.id)}
                            >
                                {plan.isPopular && (
                                    <View style={styles.popularBadge}>
                                        <Text style={styles.popularBadgeText}>POPULAR</Text>
                                    </View>
                                )}

                                <View style={styles.planHeader}>
                                    <Text style={styles.planTitle}>{plan.title}</Text>
                                    {plan.originalPrice && (
                                        <Text style={styles.planOriginalPrice}>₹{plan.originalPrice}</Text>
                                    )}
                                    <Text style={styles.planPrice}>{plan.price}</Text>
                                </View>

                                <View style={styles.planBenefits}>
                                    {plan.benefits.map((benefit, i) => (
                                        <View key={i} style={styles.benefitItem}>
                                            <View style={styles.checkIcon}>
                                                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                            </View>
                                            <Text style={styles.benefitText}>{benefit}</Text>
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.subscribeButton,
                                        selectedPlan === plan.id && styles.subscribeButtonActive
                                    ]}
                                    onPress={() => subscribePlan(plan.id)}
                                >
                                    <Text style={styles.subscribeButtonText}>
                                        {selectedPlan === plan.id ? 'Subscribe Now' : 'Select Plan'}
                                    </Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Features Highlight */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionTitle}>Why upgrade?</Text>
                    <View style={styles.featureGrid}>
                        <View style={styles.featureItem}>
                            <Ionicons name="flash-outline" size={28} color={Colors.primary} />
                            <Text style={styles.featureTitle}>Same Day Booking</Text>
                            <Text style={styles.featureDesc}>Get services within hours</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="shield-checkmark-outline" size={28} color={Colors.primary} />
                            <Text style={styles.featureTitle}>Priority Support</Text>
                            <Text style={styles.featureDesc}>24/7 dedicated help</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="speedometer-outline" size={28} color={Colors.primary} />
                            <Text style={styles.featureTitle}>Faster Matching</Text>
                            <Text style={styles.featureDesc}>Best workers first</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={styles.bottomCTA}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => subscribePlan(selectedPlan)}
                >
                    <Text style={styles.primaryButtonText}>Upgrade Now - ₹199/month</Text>
                </TouchableOpacity>
                <Text style={styles.currentPlanText}>Stay on Basic (Free)</Text>
            </View>
        </View>
    )
}

const getStyles = (darkMode: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: darkMode ? Colors.backgroundDark : Colors.background || '#f8f9fa'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary || '#2563eb',
        paddingTop: 20,
        paddingBottom: 12,
        paddingHorizontal: 20
    },
    backButton: {
        padding: 8
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center'
    },
    content: {
        flex: 1,
        padding: 20
    },
    heroSection: {
        backgroundColor: darkMode ? Colors.surfaceDark : '#fff',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4
    },
    crownIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: darkMode ? Colors.textDark : Colors.text || '#111',
        marginBottom: 8,
        textAlign: 'center'
    },
    heroSubtitle: {
        fontSize: 16,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary || '#6b7280',
        textAlign: 'center',
        lineHeight: 22
    },
    plansSection: {
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: darkMode ? Colors.textDark : Colors.text || '#111',
        marginBottom: 16
    },
    plansContainer: {
        gap: 12
    },
    planCard: {
        backgroundColor: darkMode ? Colors.surfaceDark : '#fff',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: darkMode ? Colors.borderDark : '#e5e7eb',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    popularPlanCard: {
        borderColor: Colors.primary || '#3b82f6',
        shadowOpacity: 0.15,
        elevation: 6
    },
    selectedPlanCard: {
        borderColor: '#10b981',
        borderWidth: 2,
        shadowOpacity: 0.2
    },
    popularBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: Colors.primary || '#3b82f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    popularBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    planHeader: {
        alignItems: 'center',
        marginBottom: 20
    },
    planTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: darkMode ? Colors.textDark : Colors.text || '#111',
        marginBottom: 4
    },
    planOriginalPrice: {
        fontSize: 14,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary || '#9ca3af',
        textDecorationLine: 'line-through',
        marginBottom: 4
    },
    planPrice: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.primary || '#3b82f6'
    },
    planBenefits: {
        marginBottom: 24
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    checkIcon: {
        marginRight: 12
    },
    benefitText: {
        fontSize: 15,
        color: darkMode ? Colors.textDark : Colors.text || '#374151',
        flex: 1
    },
    subscribeButton: {
        backgroundColor: darkMode ? Colors.surfaceDark : '#f3f4f6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center'
    },
    subscribeButtonActive: {
        backgroundColor: Colors.primary || '#3b82f6'
    },
    subscribeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: darkMode ? Colors.textDark : Colors.textSecondary || '#6b7280'
    },
    featuresSection: {
        backgroundColor: darkMode ? Colors.surfaceDark : '#fff',
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3
    },
    featureGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20
    },
    featureItem: {
        alignItems: 'center',
        flex: 1
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: darkMode ? Colors.textDark : Colors.text || '#111',
        marginTop: 8,
        marginBottom: 4
    },
    featureDesc: {
        fontSize: 13,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary || '#6b7280',
        textAlign: 'center'
    },
    bottomCTA: {
        padding: 20,
        backgroundColor: darkMode ? Colors.surfaceDark : '#fff',
        borderTopWidth: 1,
        borderTopColor: darkMode ? Colors.borderDark : '#f3f4f6'
    },
    primaryButton: {
        backgroundColor: Colors.primary || '#3b82f6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700'
    },
    currentPlanText: {
        textAlign: 'center',
        fontSize: 14,
        color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary || '#6b7280',
        fontWeight: '500'
    }
})
