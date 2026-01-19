import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Platform,
    ImageSourcePropType
} from 'react-native';
import { useAppStore } from '@/lib/store';
import { categories, getServicesByCategory } from '@/lib/services-data';
import { serviceImages } from '@/components/screens/home-screen';
import { ArrowLeft, ShoppingCart, Star, Filter, Clock } from 'lucide-react-native';

// --- Theme Constants ---
const COLORS = {
    primary: '#2563eb',
    primaryForeground: '#ffffff',
    background: '#ffffff',
    card: '#ffffff',
    border: '#e2e8f0',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    text: '#0f172a',
    yellow: '#facc15',
};

interface CategoryScreenProps {
    categoryId: string;
    onServiceSelect: (serviceId: string) => void;
    onBack: () => void;
    onCartPress: () => void;
}

export function CategoryScreen({
    categoryId,
    onServiceSelect,
    onBack,
    onCartPress
}: CategoryScreenProps) {
    const { getCartCount, addToCart } = useAppStore();
    const category = categories.find((c) => c.id === categoryId);
    const services = getServicesByCategory(categoryId);
    const cartCount = getCartCount();

    if (!category) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header Section */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                        <ArrowLeft color={COLORS.primaryForeground} size={24} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>{category.name}</Text>

                    <TouchableOpacity onPress={onCartPress} style={styles.iconButton}>
                        <ShoppingCart color={COLORS.primaryForeground} size={24} />
                        {cartCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{cartCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Filter Bar */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    <TouchableOpacity style={styles.filterChip}>
                        <Filter color={COLORS.primaryForeground} size={14} style={{ marginRight: 4 }} />
                        <Text style={styles.filterText}>Filters</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterText}>Price: Low to High</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterText}>Rating 4+</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Services Count */}
                <View style={styles.countContainer}>
                    <Text style={styles.countText}>{services.length} services available</Text>
                </View>

                {/* Services List */}
                <View style={styles.listContainer}>
                    {services.map((service) => {
                        // --- FIX START ---
                        // Get raw source (URL string or local require number)
                        const rawSource = serviceImages[service.id] || service.image;

                        // Normalize for React Native Image component
                        const imageSource: ImageSourcePropType = typeof rawSource === 'string'
                            ? { uri: rawSource }
                            : rawSource;
                        // --- FIX END ---

                        return (
                            <TouchableOpacity
                                key={service.id}
                                style={styles.card}
                                activeOpacity={0.9}
                                onPress={() => onServiceSelect(service.id)}
                            >
                                {/* Image Section */}
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={imageSource}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                    {service.originalPrice && (
                                        <View style={styles.discountBadge}>
                                            <Text style={styles.discountText}>
                                                {Math.round((1 - service.price / service.originalPrice) * 100)}% OFF
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Content Section */}
                                <View style={styles.cardContent}>
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                    <Text numberOfLines={2} style={styles.serviceDesc}>
                                        {service.description}
                                    </Text>

                                    {/* Rating & Duration */}
                                    <View style={styles.metaRow}>
                                        <View style={styles.metaItem}>
                                            <Star color={COLORS.yellow} fill={COLORS.yellow} size={14} />
                                            <Text style={styles.ratingText}>{service.rating}</Text>
                                            <Text style={styles.reviewsText}>({service.reviews})</Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Clock color={COLORS.mutedForeground} size={14} />
                                            <Text style={styles.durationText}>{service.duration}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Footer / Price & Add Button */}
                                <View style={styles.cardFooter}>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.priceText}>₹{service.price}</Text>
                                        {service.originalPrice && (
                                            <Text style={styles.originalPriceText}>₹{service.originalPrice}</Text>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => addToCart(service)}
                                    >
                                        <Text style={styles.addButtonText}>Add to Cart</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    // Header Styles
    headerContainer: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.primaryForeground,
    },
    iconButton: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 18,
        height: 18,
        backgroundColor: 'white',
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: '700',
    },
    // Filter Styles
    filterScroll: {
        gap: 8,
        paddingBottom: 4,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterText: {
        color: COLORS.primaryForeground,
        fontSize: 13,
        fontWeight: '500',
    },
    // Body Styles
    scrollContent: {
        paddingBottom: 24,
    },
    countContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    countText: {
        color: COLORS.mutedForeground,
        fontSize: 14,
    },
    listContainer: {
        paddingHorizontal: 16,
        gap: 16,
    },
    // Card Styles
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    imageContainer: {
        height: 160,
        backgroundColor: COLORS.muted,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: COLORS.destructive,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    discountText: {
        color: COLORS.destructiveForeground,
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        padding: 16,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    serviceDesc: {
        fontSize: 14,
        color: COLORS.mutedForeground,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginTop: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
    },
    reviewsText: {
        fontSize: 14,
        color: COLORS.mutedForeground,
    },
    durationText: {
        fontSize: 14,
        color: COLORS.mutedForeground,
    },
    cardFooter: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceText: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.primary,
    },
    originalPriceText: {
        fontSize: 14,
        color: COLORS.mutedForeground,
        textDecorationLine: 'line-through',
    },
    addButton: {
        backgroundColor: COLORS.text,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    addButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
});