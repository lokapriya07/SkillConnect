import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, Platform, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppStore } from "@/lib/store"
import { Colors } from "@/constants/Colors"

interface CartScreenProps {
    onBack?: () => void
    onCheckout: () => void
}

export default function CartScreen({ onBack, onCheckout }: CartScreenProps) {
    const [couponCode, setCouponCode] = useState("")
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
    const [discount, setDiscount] = useState(0)

    // Retrieve cart and actions from store
    const { cart, updateCartItemQuantity, removeFromCart } = useAppStore()

    // FIX 1: Access 'service.price' instead of 'item.price'
    const subtotal = cart.reduce((sum, item) => sum + (item.service.price * item.quantity), 0)

    const deliveryFee = subtotal > 0 ? 49 : 0
    const tax = Math.round(subtotal * 0.18)
    const total = subtotal + deliveryFee + tax - discount

    const applyCoupon = () => {
        if (couponCode.toUpperCase() === "SAVE10") {
            const discountAmount = Math.round(subtotal * 0.1)
            setDiscount(discountAmount)
            setAppliedCoupon("SAVE10")
            Alert.alert("Success", `Coupon applied! You saved Rs. ${discountAmount}`)
        } else if (couponCode.toUpperCase() === "FIRST50") {
            setDiscount(50)
            setAppliedCoupon("FIRST50")
            Alert.alert("Success", "Coupon applied! You saved Rs. 50")
        } else {
            Alert.alert("Invalid Coupon", "Please enter a valid coupon code")
        }
        setCouponCode("")
    }

    const removeCoupon = () => {
        setDiscount(0)
        setAppliedCoupon(null)
    }

    if (cart.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color={Colors.textSecondary} />
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptySubtitle}>Add services to get started</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>My Cart ({cart.length})</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Cart Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services</Text>
                    {cart.map((item) => (
                        // FIX 2: Use item.service.id for keys and data access
                        <View key={item.service.id} style={styles.cartItem}>
                            <Image source={{ uri: item.service.image }} style={styles.itemImage} />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={2}>
                                    {item.service.name}
                                </Text>
                                <Text style={styles.itemPrice}>Rs. {item.service.price}</Text>
                            </View>
                            <View style={styles.itemActions}>
                                <View style={styles.quantityControl}>
                                    <TouchableOpacity
                                        style={styles.qtyButton}
                                        onPress={() => {
                                            if (item.quantity === 1) {
                                                removeFromCart(item.service.id)
                                            } else {
                                                updateCartItemQuantity(item.service.id, item.quantity - 1)
                                            }
                                        }}
                                    >
                                        <Ionicons name="remove" size={16} color={Colors.primary} />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.qtyButton}
                                        onPress={() => updateCartItemQuantity(item.service.id, item.quantity + 1)}
                                    >
                                        <Ionicons name="add" size={16} color={Colors.primary} />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.service.id)}>
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Coupon Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Apply Coupon</Text>
                    {appliedCoupon ? (
                        <View style={styles.appliedCoupon}>
                            <View style={styles.couponInfo}>
                                <Ionicons name="pricetag" size={20} color={Colors.primary} />
                                <Text style={styles.couponAppliedText}>{appliedCoupon} applied</Text>
                            </View>
                            <TouchableOpacity onPress={removeCoupon}>
                                <Ionicons name="close-circle" size={24} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.couponInput}>
                            <TextInput
                                style={styles.couponTextInput}
                                placeholder="Enter coupon code"
                                placeholderTextColor={Colors.textSecondary}
                                value={couponCode}
                                onChangeText={setCouponCode}
                                autoCapitalize="characters"
                            />
                            <TouchableOpacity style={styles.applyButton} onPress={applyCoupon}>
                                <Text style={styles.applyButtonText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <Text style={styles.couponHint}>Try: SAVE10 or FIRST50</Text>
                </View>

                {/* Bill Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bill Summary</Text>
                    <View style={styles.billCard}>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Subtotal</Text>
                            <Text style={styles.billValue}>Rs. {subtotal}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Delivery Fee</Text>
                            <Text style={styles.billValue}>Rs. {deliveryFee}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Tax (18% GST)</Text>
                            <Text style={styles.billValue}>Rs. {tax}</Text>
                        </View>
                        {discount > 0 && (
                            <View style={styles.billRow}>
                                <Text style={[styles.billLabel, { color: "#4CAF50" }]}>Discount</Text>
                                <Text style={[styles.billValue, { color: "#4CAF50" }]}>- Rs. {discount}</Text>
                            </View>
                        )}
                        <View style={styles.billDivider} />
                        <View style={styles.billRow}>
                            <Text style={styles.billTotal}>Total</Text>
                            <Text style={styles.billTotalValue}>Rs. {total}</Text>
                        </View>
                    </View>
                </View>

                {/* Savings Banner */}
                {discount > 0 && (
                    <View style={styles.savingsBanner}>
                        <Ionicons name="gift" size={20} color="#4CAF50" />
                        <Text style={styles.savingsText}>You're saving Rs. {discount} on this order!</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Checkout Button */}
            <View style={styles.bottomBar}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>Rs. {total}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                    <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
        paddingBottom: 16,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.text,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 8,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 12,
    },
    cartItem: {
        flexDirection: "row",
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    itemName: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.text,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.primary,
        marginTop: 4,
    },
    itemActions: {
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    quantityControl: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 6,
    },
    qtyButton: {
        padding: 6,
    },
    qtyText: {
        fontSize: 14,
        fontWeight: "600",
        paddingHorizontal: 8,
        color: Colors.text,
    },
    removeButton: {
        padding: 4,
        marginTop: 8,
    },
    couponInput: {
        flexDirection: "row",
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: "hidden",
    },
    couponTextInput: {
        flex: 1,
        padding: 14,
        fontSize: 14,
        color: Colors.text,
    },
    applyButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        justifyContent: "center",
    },
    applyButtonText: {
        color: Colors.white,
        fontWeight: "600",
        fontSize: 14,
    },
    appliedCoupon: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#E3F2FD", // Primary Light equivalent
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    couponInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    couponAppliedText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
        marginLeft: 8,
    },
    couponHint: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 8,
    },
    billCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    billRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    billLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    billValue: {
        fontSize: 14,
        color: Colors.text,
    },
    billDivider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 8,
    },
    billTotal: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
    },
    billTotalValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.primary,
    },
    savingsBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F5E9",
        marginHorizontal: 16,
        padding: 12,
        borderRadius: 8,
    },
    savingsText: {
        fontSize: 14,
        color: "#4CAF50",
        marginLeft: 8,
        fontWeight: "500",
    },
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    totalContainer: {
        marginRight: 16,
    },
    totalLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.text,
    },
    checkoutButton: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    checkoutButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
        marginRight: 8,
    },
})