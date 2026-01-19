import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Platform, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppStore } from "@/lib/store"
import { services } from "@/lib/services-data"
import { Colors } from "@/constants/Colors"

const { width } = Dimensions.get("window")

interface ServiceDetailScreenProps {
    serviceId: string
    onBack: () => void
    onGoToCart: () => void
}

export default function ServiceDetailScreen({ serviceId, onBack, onGoToCart }: ServiceDetailScreenProps) {
    const [quantity, setQuantity] = useState(1)
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    // Get store actions
    const { addToCart, cart } = useAppStore()

    const service = services.find((s) => s.id === serviceId)

    if (!service) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text>Service not found</Text>
                <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: Colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const images = [
        service.image,
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800",
    ]

    const reviews = [
        {
            id: "1",
            name: "Rahul S.",
            rating: 5,
            comment: "Excellent service! Very professional and on time.",
            date: "2 days ago",
        },
        { id: "2", name: "Priya M.", rating: 4, comment: "Good work, would recommend to others.", date: "1 week ago" },
        { id: "3", name: "Amit K.", rating: 5, comment: "Best service provider in the city!", date: "2 weeks ago" },
    ]

    const handleAddToCart = () => {
        // FIX: Pass 'service' as 1st arg, 'quantity' as 2nd arg
        // This matches the addToCart: (service: Service, quantity?: number) signature in store.ts
        addToCart(service, quantity)

        // Optional: Navigate to cart automatically or show a toast
        // onGoToCart();
    }

    // Calculate total items in cart
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Service Details</Text>
                <TouchableOpacity onPress={onGoToCart} style={styles.cartButton}>
                    <Ionicons name="cart-outline" size={24} color={Colors.text} />
                    {cartItemCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Image Carousel */}
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width)
                            setActiveImageIndex(index)
                        }}
                    >
                        {images.map((img, index) => (
                            <Image key={index} source={{ uri: img }} style={styles.serviceImage} />
                        ))}
                    </ScrollView>
                    <View style={styles.imageDots}>
                        {images.map((_, index) => (
                            <View key={index} style={[styles.dot, activeImageIndex === index && styles.activeDot]} />
                        ))}
                    </View>
                </View>

                {/* Service Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={14} color="#FFC107" />
                            <Text style={styles.ratingText}>{service.rating}</Text>
                        </View>
                    </View>

                    <Text style={styles.categoryText}>{service.category}</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>Rs. {service.price}</Text>
                        <Text style={styles.originalPrice}>Rs. {service.price + 200}</Text>
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>20% OFF</Text>
                        </View>
                    </View>

                    <Text style={styles.duration}>
                        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} /> Duration: {service.duration}
                    </Text>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                            Professional {service.name.toLowerCase()} service with experienced technicians. We use high-quality
                            materials and provide a satisfaction guarantee. Our team arrives on time and completes the work
                            efficiently.
                        </Text>
                    </View>

                    {/* What's Included */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What's Included</Text>
                        {["Professional service", "Quality materials", "30-day warranty", "Clean-up after service"].map(
                            (item, index) => (
                                <View key={index} style={styles.includeItem}>
                                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                                    <Text style={styles.includeText}>{item}</Text>
                                </View>
                            )
                        )}
                    </View>

                    {/* Trust Badges */}
                    <View style={styles.trustContainer}>
                        <View style={styles.trustBadge}>
                            <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
                            <Text style={styles.trustText}>Verified</Text>
                        </View>
                        <View style={styles.trustBadge}>
                            <Ionicons name="time" size={24} color={Colors.primary} />
                            <Text style={styles.trustText}>On-Time</Text>
                        </View>
                        <View style={styles.trustBadge}>
                            <Ionicons name="card" size={24} color={Colors.primary} />
                            <Text style={styles.trustText}>Secure Pay</Text>
                        </View>
                    </View>

                    {/* Reviews */}
                    <View style={styles.section}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.sectionTitle}>Reviews</Text>
                            <Text style={styles.reviewCount}>({service.reviews} reviews)</Text>
                        </View>
                        {reviews.map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewTop}>
                                    <View style={styles.reviewerInfo}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>{review.name[0]}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.reviewerName}>{review.name}</Text>
                                            <Text style={styles.reviewDate}>{review.date}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.reviewRating}>
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Ionicons key={i} name="star" size={12} color="#FFC107" />
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Ionicons name="remove" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(quantity + 1)}>
                        <Ionicons name="add" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                    <Text style={styles.addToCartText}>Add to Cart - Rs. {service.price * quantity}</Text>
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
    center: {
        justifyContent: 'center',
        alignItems: 'center'
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
    cartButton: {
        padding: 8,
        position: "relative",
    },
    cartBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    cartBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: "bold",
    },
    imageContainer: {
        position: "relative",
    },
    serviceImage: {
        width: width,
        height: 280,
        resizeMode: "cover",
    },
    imageDots: {
        flexDirection: "row",
        justifyContent: "center",
        position: "absolute",
        bottom: 16,
        width: "100%",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,0.5)",
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: Colors.white,
        width: 24,
    },
    infoContainer: {
        padding: 20,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    serviceName: {
        fontSize: 22,
        fontWeight: "bold",
        color: Colors.text,
        flex: 1,
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF9E6",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        marginLeft: 4,
    },
    categoryText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },
    price: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.primary,
    },
    originalPrice: {
        fontSize: 16,
        color: Colors.textSecondary,
        textDecorationLine: "line-through",
        marginLeft: 12,
    },
    discountBadge: {
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 12,
    },
    discountText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#4CAF50",
    },
    duration: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 8,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    includeItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    includeText: {
        fontSize: 14,
        color: Colors.text,
        marginLeft: 10,
    },
    trustContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#E3F2FD", // Assuming Colors.primaryLight is this blue
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
    },
    trustBadge: {
        alignItems: "center",
    },
    trustText: {
        fontSize: 12,
        color: Colors.primary,
        marginTop: 4,
        fontWeight: "500",
    },
    reviewHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    reviewCount: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    reviewCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    reviewTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    reviewerInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    avatarText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
    },
    reviewDate: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    reviewRating: {
        flexDirection: "row",
    },
    reviewComment: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        marginRight: 16,
    },
    quantityButton: {
        padding: 10,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "600",
        paddingHorizontal: 12,
        color: Colors.text,
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    addToCartText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
})