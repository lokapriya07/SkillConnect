// import React from 'react';
// import {
//     View,
//     Text,
//     Image,
//     TouchableOpacity,
//     ScrollView,
//     StyleSheet,
//     SafeAreaView,
//     StatusBar,
//     Platform,
//     ImageSourcePropType
// } from 'react-native';
// import { useAppStore } from '@/lib/store';
// import { categories, getServicesByCategory } from '@/lib/services-data';
// import { serviceImages } from '@/components/screens/home-screen';
// import { ArrowLeft, ShoppingCart, Star, Filter, Clock } from 'lucide-react-native';

// // --- Theme Constants ---
// const COLORS = {
//     primary: '#2563eb',
//     primaryForeground: '#ffffff',
//     background: '#ffffff',
//     card: '#ffffff',
//     border: '#e2e8f0',
//     muted: '#f1f5f9',
//     mutedForeground: '#64748b',
//     destructive: '#ef4444',
//     destructiveForeground: '#ffffff',
//     text: '#0f172a',
//     yellow: '#facc15',
// };

// interface CategoryScreenProps {
//     categoryId: string;
//     onServiceSelect: (serviceId: string) => void;
//     onBack: () => void;
//     onCartPress: () => void;
// }

// export function CategoryScreen({
//     categoryId,
//     onServiceSelect,
//     onBack,
//     onCartPress
// }: CategoryScreenProps) {
//     const { getCartCount, addToCart } = useAppStore();
//     const category = categories.find((c) => c.id === categoryId);
//     const services = getServicesByCategory(categoryId);
//     const cartCount = getCartCount();

//     if (!category) return null;

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

//             {/* Header Section */}
//             <View style={styles.headerContainer}>
//                 <View style={styles.headerTop}>
//                     <TouchableOpacity onPress={onBack} style={styles.iconButton}>
//                         <ArrowLeft color={COLORS.primaryForeground} size={24} />
//                     </TouchableOpacity>

//                     <Text style={styles.headerTitle}>{category.name}</Text>

//                     <TouchableOpacity onPress={onCartPress} style={styles.iconButton}>
//                         <ShoppingCart color={COLORS.primaryForeground} size={24} />
//                         {cartCount > 0 && (
//                             <View style={styles.badge}>
//                                 <Text style={styles.badgeText}>{cartCount}</Text>
//                             </View>
//                         )}
//                     </TouchableOpacity>
//                 </View>

//                 {/* Filter Bar */}
//                 <ScrollView
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={styles.filterScroll}
//                 >
//                     <TouchableOpacity style={styles.filterChip}>
//                         <Filter color={COLORS.primaryForeground} size={14} style={{ marginRight: 4 }} />
//                         <Text style={styles.filterText}>Filters</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={styles.filterChip}>
//                         <Text style={styles.filterText}>Price: Low to High</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={styles.filterChip}>
//                         <Text style={styles.filterText}>Rating 4+</Text>
//                     </TouchableOpacity>
//                 </ScrollView>
//             </View>

//             {/* Main Content */}
//             <ScrollView contentContainerStyle={styles.scrollContent}>

//                 {/* Services Count */}
//                 <View style={styles.countContainer}>
//                     <Text style={styles.countText}>{services.length} services available</Text>
//                 </View>

//                 {/* Services List */}
//                 <View style={styles.listContainer}>
//                     {services.map((service) => {
//                         // --- FIX START ---
//                         // Get raw source (URL string or local require number)
//                         const rawSource = serviceImages[service.id] || service.image;

//                         // Normalize for React Native Image component
//                         const imageSource: ImageSourcePropType = typeof rawSource === 'string'
//                             ? { uri: rawSource }
//                             : rawSource;
//                         // --- FIX END ---

//                         return (
//                             <TouchableOpacity
//                                 key={service.id}
//                                 style={styles.card}
//                                 activeOpacity={0.9}
//                                 onPress={() => onServiceSelect(service.id)}
//                             >
//                                 {/* Image Section */}
//                                 <View style={styles.imageContainer}>
//                                     <Image
//                                         source={imageSource}
//                                         style={styles.cardImage}
//                                         resizeMode="cover"
//                                     />
//                                     {service.originalPrice && (
//                                         <View style={styles.discountBadge}>
//                                             <Text style={styles.discountText}>
//                                                 {Math.round((1 - service.price / service.originalPrice) * 100)}% OFF
//                                             </Text>
//                                         </View>
//                                     )}
//                                 </View>

//                                 {/* Content Section */}
//                                 <View style={styles.cardContent}>
//                                     <Text style={styles.serviceName}>{service.name}</Text>
//                                     <Text numberOfLines={2} style={styles.serviceDesc}>
//                                         {service.description}
//                                     </Text>

//                                     {/* Rating & Duration */}
//                                     <View style={styles.metaRow}>
//                                         <View style={styles.metaItem}>
//                                             <Star color={COLORS.yellow} fill={COLORS.yellow} size={14} />
//                                             <Text style={styles.ratingText}>{service.rating}</Text>
//                                             <Text style={styles.reviewsText}>({service.reviews})</Text>
//                                         </View>
//                                         <View style={styles.metaItem}>
//                                             <Clock color={COLORS.mutedForeground} size={14} />
//                                             <Text style={styles.durationText}>{service.duration}</Text>
//                                         </View>
//                                     </View>
//                                 </View>

//                                 {/* Footer / Price & Add Button */}
//                                 <View style={styles.cardFooter}>
//                                     <View style={styles.priceContainer}>
//                                         <Text style={styles.priceText}>₹{service.price}</Text>
//                                         {service.originalPrice && (
//                                             <Text style={styles.originalPriceText}>₹{service.originalPrice}</Text>
//                                         )}
//                                     </View>

//                                     <TouchableOpacity
//                                         style={styles.addButton}
//                                         onPress={() => addToCart(service)}
//                                     >
//                                         <Text style={styles.addButtonText}>Add to Cart</Text>
//                                     </TouchableOpacity>
//                                 </View>
//                             </TouchableOpacity>
//                         );
//                     })}
//                 </View>
//             </ScrollView>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: COLORS.background,
//     },
//     // Header Styles
//     headerContainer: {
//         backgroundColor: COLORS.primary,
//         paddingHorizontal: 16,
//         paddingTop: Platform.OS === 'android' ? 40 : 16,
//         paddingBottom: 20,
//     },
//     headerTop: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: 16,
//     },
//     headerTitle: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: COLORS.primaryForeground,
//     },
//     iconButton: {
//         padding: 4,
//         position: 'relative',
//     },
//     badge: {
//         position: 'absolute',
//         top: -4,
//         right: -4,
//         width: 18,
//         height: 18,
//         backgroundColor: 'white',
//         borderRadius: 9,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     badgeText: {
//         color: COLORS.primary,
//         fontSize: 10,
//         fontWeight: '700',
//     },
//     // Filter Styles
//     filterScroll: {
//         gap: 8,
//         paddingBottom: 4,
//     },
//     filterChip: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: 'rgba(255,255,255,0.2)',
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 20,
//     },
//     filterText: {
//         color: COLORS.primaryForeground,
//         fontSize: 13,
//         fontWeight: '500',
//     },
//     // Body Styles
//     scrollContent: {
//         paddingBottom: 24,
//     },
//     countContainer: {
//         paddingHorizontal: 16,
//         paddingVertical: 16,
//     },
//     countText: {
//         color: COLORS.mutedForeground,
//         fontSize: 14,
//     },
//     listContainer: {
//         paddingHorizontal: 16,
//         gap: 16,
//     },
//     // Card Styles
//     card: {
//         backgroundColor: COLORS.card,
//         borderRadius: 12,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         overflow: 'hidden',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 2,
//         elevation: 2,
//     },
//     imageContainer: {
//         height: 160,
//         backgroundColor: COLORS.muted,
//         position: 'relative',
//     },
//     cardImage: {
//         width: '100%',
//         height: '100%',
//     },
//     discountBadge: {
//         position: 'absolute',
//         top: 12,
//         left: 12,
//         backgroundColor: COLORS.destructive,
//         paddingHorizontal: 10,
//         paddingVertical: 4,
//         borderRadius: 100,
//     },
//     discountText: {
//         color: COLORS.destructiveForeground,
//         fontSize: 12,
//         fontWeight: '600',
//     },
//     cardContent: {
//         padding: 16,
//     },
//     serviceName: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: COLORS.text,
//         marginBottom: 4,
//     },
//     serviceDesc: {
//         fontSize: 14,
//         color: COLORS.mutedForeground,
//         lineHeight: 20,
//     },
//     metaRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 16,
//         marginTop: 12,
//     },
//     metaItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 4,
//     },
//     ratingText: {
//         fontSize: 14,
//         fontWeight: '500',
//         color: COLORS.text,
//     },
//     reviewsText: {
//         fontSize: 14,
//         color: COLORS.mutedForeground,
//     },
//     durationText: {
//         fontSize: 14,
//         color: COLORS.mutedForeground,
//     },
//     cardFooter: {
//         paddingHorizontal: 16,
//         paddingBottom: 16,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//     },
//     priceContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     priceText: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: COLORS.primary,
//     },
//     originalPriceText: {
//         fontSize: 14,
//         color: COLORS.mutedForeground,
//         textDecorationLine: 'line-through',
//     },
//     addButton: {
//         backgroundColor: COLORS.text,
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 6,
//     },
//     addButtonText: {
//         color: 'white',
//         fontSize: 14,
//         fontWeight: '500',
//     },
// });



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

const COLORS = {
    primary: '#2563eb',
    primaryForeground: '#ffffff',
    background: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    text: '#0f172a',
    yellow: '#facc15',
    overlay: 'rgba(0,0,0,0.5)',
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
    
    // --- State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    
    // Advanced Filter State
    const [tempPriceRange, setTempPriceRange] = useState<string | null>(null);
    const [tempRating, setTempRating] = useState<number | null>(null);
    
    const [appliedPriceRange, setAppliedPriceRange] = useState<string | null>(null);
    const [appliedRating, setAppliedRating] = useState<number | null>(null);

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
                            <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search & Filter Row */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBarContainer}>
                        <Search color={COLORS.mutedForeground} size={18} />
                        <TextInput
                            placeholder="Search service..."
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity 
                        style={[styles.filterTrigger, (appliedPriceRange || appliedRating) ? styles.filterTriggerActive : null]} 
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Filter color={(appliedPriceRange || appliedRating) ? COLORS.primary : COLORS.mutedForeground} size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Active Chips Horizontal Scroll */}
            {(appliedPriceRange || appliedRating) && (
                <View style={styles.activeFiltersContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {appliedPriceRange && (
                            <View style={styles.activeChip}>
                                <Text style={styles.activeChipText}>{appliedPriceRange}</Text>
                                <TouchableOpacity onPress={() => setAppliedPriceRange(null)}><X size={14} color={COLORS.primary}/></TouchableOpacity>
                            </View>
                        )}
                        {appliedRating && (
                            <View style={styles.activeChip}>
                                <Text style={styles.activeChipText}>{appliedRating}+ Star</Text>
                                <TouchableOpacity onPress={() => setAppliedRating(null)}><X size={14} color={COLORS.primary}/></TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}

            {/* List Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.countContainer}>
                    <Text style={styles.countText}>{services.length} Services Available</Text>
                </View>

                {services.length > 0 ? (
                    <View style={styles.listContainer}>
                        {services.map((service) => {
                            const rawSource = serviceImages[service.id] || service.image;
                            const imageSource: ImageSourcePropType = typeof rawSource === 'string' ? { uri: rawSource } : rawSource;
                            return (
                                <TouchableOpacity key={service.id} style={styles.card} onPress={() => onServiceSelect(service.id)}>
                                    <View style={styles.imageContainer}>
                                        <Image source={imageSource} style={styles.cardImage} />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.serviceName}>{service.name}</Text>
                                        <View style={styles.metaRow}>
                                            <Star color={COLORS.yellow} fill={COLORS.yellow} size={14} />
                                            <Text style={styles.ratingText}>{service.rating}</Text>
                                            <Text style={styles.reviewsText}>({service.reviews})</Text>
                                            <View style={styles.dot} />
                                            <Clock color={COLORS.mutedForeground} size={14} />
                                            <Text style={styles.durationText}>{service.duration}</Text>
                                        </View>
                                        <View style={styles.cardFooter}>
                                            <Text style={styles.priceText}>₹{service.price}</Text>
                                            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(service)}>
                                                <Text style={styles.addButtonText}>Add</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No matches found.</Text>
                        <TouchableOpacity onPress={clearFilters}><Text style={styles.clearLink}>Reset all filters</Text></TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Filter Bottom Sheet Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isFilterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filters</Text>
                            <TouchableOpacity onPress={clearFilters}><Text style={styles.resetText}>Reset All</Text></TouchableOpacity>
                        </View>

                        <Text style={styles.filterSectionTitle}>Price Range</Text>
                        <View style={styles.optionRow}>
                            {['under500', '500-1000', 'above1000'].map((range) => (
                                <TouchableOpacity 
                                    key={range}
                                    style={[styles.optionChip, tempPriceRange === range && styles.optionChipActive]}
                                    onPress={() => setTempPriceRange(range)}
                                >
                                    <Text style={[styles.optionText, tempPriceRange === range && styles.optionTextActive]}>{range.replace('under', '< ').replace('above', '> ')}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
                        <View style={styles.optionRow}>
                            {[3, 4, 4.5].map((rate) => (
                                <TouchableOpacity 
                                    key={rate}
                                    style={[styles.optionChip, tempRating === rate && styles.optionChipActive]}
                                    onPress={() => setTempRating(rate)}
                                >
                                    <Star size={12} color={tempRating === rate ? COLORS.primaryForeground : COLORS.mutedForeground} fill={tempRating === rate ? COLORS.primaryForeground : 'transparent'} />
                                    <Text style={[styles.optionText, tempRating === rate && styles.optionTextActive]}>{rate}+ Stars</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    headerContainer: { backgroundColor: COLORS.primary, padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 16 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.primaryForeground },
    iconButton: { padding: 4, position: 'relative' },
    badge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, backgroundColor: 'white', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '700' },
    
    searchRow: { flexDirection: 'row', gap: 10 },
    searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 10, paddingHorizontal: 12, height: 45 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: COLORS.text },
    filterTrigger: { backgroundColor: COLORS.background, width: 45, height: 45, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    filterTriggerActive: { borderWidth: 2, borderColor: COLORS.yellow },

    activeFiltersContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    activeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.muted, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, gap: 6 },
    activeChipText: { fontSize: 12, fontWeight: '600', color: COLORS.primary, textTransform: 'capitalize' },

    scrollContent: { paddingBottom: 24 },
    countContainer: { paddingHorizontal: 16, paddingVertical: 12 },
    countText: { color: COLORS.mutedForeground, fontSize: 13, fontWeight: '600' },
    listContainer: { paddingHorizontal: 16, gap: 12 },

    card: { backgroundColor: COLORS.card, borderRadius: 15, overflow: 'hidden', flexDirection: 'row', padding: 12, borderWidth: 1, borderColor: COLORS.border },
    imageContainer: { width: 100, height: 100, borderRadius: 10, overflow: 'hidden' },
    cardImage: { width: '100%', height: '100%' },
    cardContent: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
    serviceName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 13, fontWeight: '600' },
    reviewsText: { fontSize: 13, color: COLORS.mutedForeground },
    durationText: { fontSize: 13, color: COLORS.mutedForeground },
    dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: COLORS.mutedForeground, marginHorizontal: 4 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    priceText: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    addButton: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
    addButtonText: { color: 'white', fontWeight: '700' },

    emptyState: { padding: 60, alignItems: 'center' },
    emptyText: { color: COLORS.mutedForeground },
    clearLink: { color: COLORS.primary, marginTop: 10, fontWeight: '700' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.card, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800' },
    resetText: { color: COLORS.destructive, fontWeight: '600' },
    filterSectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 12 },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    optionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
    optionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    optionText: { color: COLORS.text, fontWeight: '500' },
    optionTextActive: { color: COLORS.primaryForeground, fontWeight: '700' },
    applyButton: { backgroundColor: COLORS.primary, marginTop: 30, paddingVertical: 16, borderRadius: 15, alignItems: 'center' },
    applyButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});