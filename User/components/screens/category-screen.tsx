import React, { useState, useMemo } from 'react';
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
    TextInput,
    Modal,
    Pressable,
    ImageSourcePropType
} from 'react-native';
import { useAppStore } from '@/lib/store';
import { categories, getServicesByCategory } from '@/lib/services-data';
import { serviceImages } from '@/components/screens/home-screen';
import { ArrowLeft, ShoppingCart, Star, Filter, Clock, Search, X, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

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
    const { getCartCount, addToCart, darkMode } = useAppStore();
    
    // --- State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    
    // Advanced Filter State
    const [tempPriceRange, setTempPriceRange] = useState<string | null>(null);
    const [tempRating, setTempRating] = useState<number | null>(null);
    
    const [appliedPriceRange, setAppliedPriceRange] = useState<string | null>(null);
    const [appliedRating, setAppliedRating] = useState<number | null>(null);

    // Theme colors
    const backgroundColor = darkMode ? Colors.backgroundDark : Colors.background
    const surfaceColor = darkMode ? Colors.surfaceDark : Colors.surface
    const surfaceVariantColor = darkMode ? Colors.gray[800] : Colors.gray[100]
    const textColor = darkMode ? Colors.textDark : Colors.text
    const textSecondaryColor = darkMode ? Colors.textSecondaryDark : Colors.textSecondary
    const borderColor = darkMode ? Colors.borderDark : Colors.border
    const mutedBg = darkMode ? Colors.gray[900] : Colors.gray[100]
    const mutedFg = darkMode ? Colors.gray[400] : Colors.gray[600]
    const cardBg = darkMode ? Colors.surfaceDark : Colors.surface

    const category = categories.find((c) => c.id === categoryId);
    const rawServices = getServicesByCategory(categoryId);
    const cartCount = getCartCount();

    // --- Complex Filtering Logic ---
    const services = useMemo(() => {
        let result = [...rawServices];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.description.toLowerCase().includes(query)
            );
        }

        if (appliedPriceRange) {
            if (appliedPriceRange === 'under500') result = result.filter(s => s.price < 500);
            if (appliedPriceRange === '500-1000') result = result.filter(s => s.price >= 500 && s.price <= 1000);
            if (appliedPriceRange === 'above1000') result = result.filter(s => s.price > 1000);
        }

        if (appliedRating) {
            result = result.filter(s => s.rating >= appliedRating);
        }

        return result;
    }, [rawServices, searchQuery, appliedPriceRange, appliedRating]);

    const applyFilters = () => {
        setAppliedPriceRange(tempPriceRange);
        setAppliedRating(tempRating);
        setFilterModalVisible(false);
    };

    const clearFilters = () => {
        setTempPriceRange(null);
        setTempRating(null);
        setAppliedPriceRange(null);
        setAppliedRating(null);
        setSearchQuery('');
    };

    if (!category) return null;

    // Dynamic styles
    const getStyles = () => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: backgroundColor,
        },
        headerContainer: {
            backgroundColor: Colors.primary,
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
            color: '#ffffff',
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
            color: Colors.primary,
            fontSize: 10,
            fontWeight: '700',
        },
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
            color: '#ffffff',
            fontSize: 13,
            fontWeight: '500',
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
        },
        searchInput: {
            flex: 1,
            color: '#ffffff',
            marginLeft: 8,
            fontSize: 15,
        },
        scrollContent: {
            paddingBottom: 24,
        },
        countContainer: {
            paddingHorizontal: 16,
            paddingVertical: 16,
        },
        countText: {
            color: textSecondaryColor,
            fontSize: 14,
        },
        listContainer: {
            paddingHorizontal: 16,
            gap: 16,
        },
        card: {
            backgroundColor: cardBg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: borderColor,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        imageContainer: {
            height: 160,
            backgroundColor: mutedBg,
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
            backgroundColor: Colors.error,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 100,
        },
        discountText: {
            color: '#ffffff',
            fontSize: 12,
            fontWeight: '600',
        },
        cardContent: {
            padding: 16,
        },
        serviceName: {
            fontSize: 18,
            fontWeight: '600',
            color: textColor,
            marginBottom: 4,
        },
        serviceDesc: {
            fontSize: 14,
            color: textSecondaryColor,
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
            color: textColor,
        },
        reviewsText: {
            fontSize: 14,
            color: textSecondaryColor,
        },
        durationText: {
            fontSize: 14,
            color: textSecondaryColor,
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
            color: Colors.primary,
        },
        originalPriceText: {
            fontSize: 14,
            color: textSecondaryColor,
            textDecorationLine: 'line-through',
        },
        addButton: {
            backgroundColor: Colors.text,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
        },
        addButtonText: {
            color: 'white',
            fontSize: 14,
            fontWeight: '500',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: surfaceColor,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            maxHeight: '80%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: textColor,
        },
        filterSection: {
            marginBottom: 20,
        },
        filterLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: textColor,
            marginBottom: 12,
        },
        filterOptions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        filterOption: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: surfaceVariantColor,
            borderWidth: 1,
            borderColor: borderColor,
        },
        filterOptionActive: {
            backgroundColor: Colors.primary,
            borderColor: Colors.primary,
        },
        filterOptionText: {
            fontSize: 13,
            color: textColor,
        },
        filterOptionTextActive: {
            color: '#ffffff',
        },
        modalFooter: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 20,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: borderColor,
        },
        resetButton: {
            flex: 1,
            padding: 14,
            alignItems: 'center',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: borderColor,
            backgroundColor: surfaceVariantColor,
        },
        resetButtonText: {
            fontWeight: '600',
            color: textColor,
        },
        applyButton: {
            flex: 2,
            padding: 14,
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: Colors.primary,
        },
        applyButtonText: {
            color: '#ffffff',
            fontWeight: '600',
        },
    })

    const styles = getStyles()

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header Section */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                        <ArrowLeft color="#ffffff" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{category.name}</Text>
                    <TouchableOpacity onPress={onCartPress} style={styles.iconButton}>
                        <ShoppingCart color="#ffffff" size={24} />
                        {cartCount > 0 && (
                            <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search & Filter Row */}
                <View style={styles.searchContainer}>
                    <Search color="rgba(255,255,255,0.7)" size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search services..."
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X color="rgba(255,255,255,0.7)" size={20} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    <TouchableOpacity style={styles.filterChip} onPress={() => setFilterModalVisible(true)}>
                        <Filter color="#ffffff" size={14} style={{ marginRight: 4 }} />
                        <Text style={styles.filterText}>Filters</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterChip, appliedPriceRange ? { backgroundColor: '#ffffff' } : null]}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Text style={[styles.filterText, appliedPriceRange ? { color: Colors.primary } : null]}>Price</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterChip, appliedRating ? { backgroundColor: '#ffffff' } : null]}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Text style={[styles.filterText, appliedRating ? { color: Colors.primary } : null]}>Rating 4+</Text>
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
                        // Get raw source (URL string or local require number)
                        const rawSource = serviceImages[service.id] || service.image;

                        // Normalize for React Native Image component
                        const imageSource: ImageSourcePropType = typeof rawSource === 'string'
                            ? { uri: rawSource }
                            : rawSource;

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
                                            <Star color="#facc15" fill="#facc15" size={14} />
                                            <Text style={styles.ratingText}>{service.rating}</Text>
                                            <Text style={styles.reviewsText}>({service.reviews})</Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Clock color={textSecondaryColor} size={14} />
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

            {/* Filter Modal */}
            <Modal animationType="slide" transparent={true} visible={isFilterModalVisible} onRequestClose={() => setFilterModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filters & Sort</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <X color={textColor} size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Price Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Price Range</Text>
                                <View style={styles.filterOptions}>
                                    {[
                                        { label: 'Under ₹500', value: 'under500' },
                                        { label: '₹500 - ₹1000', value: '500-1000' },
                                        { label: 'Above ₹1000', value: 'above1000' }
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[styles.filterOption, tempPriceRange === option.value && styles.filterOptionActive]}
                                            onPress={() => setTempPriceRange(tempPriceRange === option.value ? null : option.value)}
                                        >
                                            <Text style={[styles.filterOptionText, tempPriceRange === option.value && styles.filterOptionTextActive]}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Rating Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Minimum Rating</Text>
                                <View style={styles.filterOptions}>
                                    {[4, 4.5, 5].map((rating) => (
                                        <TouchableOpacity
                                            key={rating}
                                            style={[styles.filterOption, tempRating === rating && styles.filterOptionActive]}
                                            onPress={() => setTempRating(tempRating === rating ? null : rating)}
                                        >
                                            <Text style={[styles.filterOptionText, tempRating === rating && styles.filterOptionTextActive]}>
                                                {rating}+ ★
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetButton} onPress={clearFilters}>
                                <Text style={styles.resetButtonText}>Reset All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                                <Text style={styles.applyButtonText}>Show Results</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
