import { ArrowLeft, Clock, Search, SlidersHorizontal, Star, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { serviceImages } from "@/components/screens/home-screen";
import { categories, services } from "@/lib/services-data";

interface SearchScreenProps {
    onBack: () => void;
    onServiceSelect: (serviceId: string) => void;
}

const recentSearches = ["AC Repair", "Cleaning", "Plumber", "Electrician"];

const COLORS = {
    background: "#FFFFFF",
    primary: "#000000",
    muted: "#F4F4F5",
    border: "#E4E4E7",
    text: "#09090B",
    textMuted: "#71717A",
    yellow: "#FACC15",
    overlay: "rgba(0,0,0,0.5)",
};

type SortOption = "relevance" | "price_low" | "rating";

export function SearchScreen({ onBack, onServiceSelect }: SearchScreenProps) {
    const [query, setQuery] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    
    // Filter States
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [minRating, setMinRating] = useState<number | null>(null);
    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("relevance");

    // Check if any filter is active
    const hasActiveFilters = !!(selectedCategory || minRating || maxPrice || sortBy !== "relevance");
    const activeFilterCount = [selectedCategory, minRating, maxPrice, sortBy !== "relevance"].filter(Boolean).length;

    const filteredServices = useMemo(() => {
        const searchTerm = query.trim().toLowerCase();
        
        // Show suggestions only if search is empty AND no filters are applied
        if (!searchTerm && !hasActiveFilters) return [];

        let result = services.filter((service) => {
            // 1. Text Search Logic (matches Name, Description, or Category Name)
            const matchesQuery = !searchTerm || 
                service.name.toLowerCase().includes(searchTerm) ||
                service.description.toLowerCase().includes(searchTerm) ||
                service.category.toLowerCase().includes(searchTerm);
            
            // 2. Filter logic
            const matchesCategory = !selectedCategory || service.category === selectedCategory;
            const matchesRating = !minRating || service.rating >= minRating;
            const matchesPrice = !maxPrice || service.price <= maxPrice;

            return matchesQuery && matchesCategory && matchesRating && matchesPrice;
        });

        // 3. Sorting logic
        if (sortBy === "price_low") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === "rating") {
            result.sort((a, b) => b.rating - a.rating);
        }

        return result;
    }, [query, selectedCategory, minRating, maxPrice, sortBy, hasActiveFilters]);

    const resetAll = () => {
        setQuery("");
        setSelectedCategory(null);
        setMinRating(null);
        setMaxPrice(null);
        setSortBy("relevance");
    };

    const renderServiceItem = ({ item }: { item: typeof services[0] }) => (
        <TouchableOpacity
            style={styles.resultCard}
            onPress={() => onServiceSelect(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={
                        serviceImages[item.id]
                            ? { uri: serviceImages[item.id] } 
                            : typeof item.image === "string" ? { uri: item.image } : item.image
                    }
                    style={styles.serviceImage}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.metaRow}>
                    <View style={styles.ratingBadge}>
                        <Star size={12} color={COLORS.yellow} fill={COLORS.yellow} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <View style={styles.durationBadge}>
                        <Clock size={12} color={COLORS.textMuted} />
                        <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    {item.originalPrice && <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>

                <View style={styles.searchContainer}>
                    <Search size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search services..."
                        placeholderTextColor={COLORS.textMuted}
                        value={query}
                        onChangeText={setQuery}
                        style={styles.input}
                        autoFocus={true}
                    />
                    <View style={styles.actionButtons}>
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery("")} style={styles.iconButton}>
                                <X size={20} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            onPress={() => setIsFilterVisible(true)} 
                            style={styles.filterTrigger}
                        >
                            <SlidersHorizontal size={20} color={activeFilterCount > 0 ? COLORS.primary : COLORS.textMuted} />
                            {activeFilterCount > 0 && <View style={styles.filterDot} />}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Content Logic: If search is empty AND no filters, show suggestions */}
            {(!query.trim() && !hasActiveFilters) ? (
                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
                        <View style={styles.tagsContainer}>
                            {recentSearches.map((search, index) => (
                                <TouchableOpacity key={index} style={styles.tag} onPress={() => setQuery(search)}>
                                    <Text style={styles.tagText}>{search}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.section, styles.borderTop]}>
                        <Text style={styles.sectionTitle}>POPULAR CATEGORIES</Text>
                        <View style={styles.categoriesList}>
                            {categories.slice(0, 5).map((category) => (
                                <TouchableOpacity 
                                    key={category.id} 
                                    style={styles.categoryItem} 
                                    onPress={() => setQuery(category.name)}
                                >
                                    <View style={[styles.categoryIcon, { backgroundColor: category.color, opacity: 0.15 }]} />
                                    <View style={styles.categoryIconOverlay}><Search size={20} color={category.color} /></View>
                                    <Text style={styles.categoryName}>{category.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.content}>
                    <View style={styles.resultsHeader}>
                        <Text style={styles.resultsCount}>{filteredServices.length} results found</Text>
                        <TouchableOpacity onPress={resetAll}>
                            <Text style={styles.clearAllText}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {filteredServices.length > 0 ? (
                        <FlatList
                            data={filteredServices}
                            renderItem={renderServiceItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContainer}
                            keyboardShouldPersistTaps="handled"
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Search size={64} color={COLORS.textMuted} style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>No results found</Text>
                            <Text style={styles.emptyText}>Try adjusting your filters or search term</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Filter Modal */}
            <Modal animationType="slide" transparent={true} visible={isFilterVisible} onRequestClose={() => setIsFilterVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setIsFilterVisible(false)}>
                    <Pressable style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filters & Sort</Text>
                            <TouchableOpacity onPress={() => setIsFilterVisible(false)}><X size={24} color={COLORS.text} /></TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.filterLabel}>Sort By</Text>
                            <View style={styles.filterOptions}>
                                {[{id:'relevance', l:'Relevance'}, {id:'price_low', l:'Price: Low to High'}, {id:'rating', l:'Top Rated'}].map(o => (
                                    <TouchableOpacity key={o.id} style={[styles.filterChip, sortBy === o.id && styles.filterChipActive]} onPress={() => setSortBy(o.id as SortOption)}>
                                        <Text style={[styles.filterChipText, sortBy === o.id && styles.filterChipTextActive]}>{o.l}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Category</Text>
                            <View style={styles.filterOptions}>
                                {categories.map(cat => (
                                    <TouchableOpacity key={cat.id} style={[styles.filterChip, selectedCategory === cat.name && styles.filterChipActive]} onPress={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}>
                                        <Text style={[styles.filterChipText, selectedCategory === cat.name && styles.filterChipTextActive]}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Budget</Text>
                            <View style={styles.filterOptions}>
                                {[{l:'Under ₹500', v:500}, {l:'Under ₹1000', v:1000}, {l:'Under ₹5000', v:5000}].map(p => (
                                    <TouchableOpacity key={p.v} style={[styles.filterChip, maxPrice === p.v && styles.filterChipActive]} onPress={() => setMaxPrice(maxPrice === p.v ? null : p.v)}>
                                        <Text style={[styles.filterChipText, maxPrice === p.v && styles.filterChipTextActive]}>{p.l}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetButton} onPress={() => { resetAll(); setIsFilterVisible(false); }}>
                                <Text style={styles.resetButtonText}>Reset All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={() => setIsFilterVisible(false)}>
                                <Text style={styles.applyButtonText}>Show Results</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
    header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
    backButton: { padding: 4 },
    searchContainer: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, height: 44, paddingHorizontal: 12 },
    searchIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 16, color: COLORS.text, height: "100%" },
    actionButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
    iconButton: { padding: 4 },
    filterTrigger: { position: 'relative', padding: 4 },
    filterDot: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#FFF' },
    content: { flex: 1 },
    section: { padding: 16 },
    borderTop: { borderTopWidth: 1, borderTopColor: COLORS.border },
    sectionTitle: { fontSize: 12, fontWeight: "600", color: COLORS.textMuted, marginBottom: 12, textTransform: "uppercase" },
    tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    tag: { backgroundColor: COLORS.muted, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    tagText: { fontSize: 14, color: COLORS.text },
    categoriesList: { gap: 12 },
    categoryItem: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8 },
    categoryIcon: { width: 40, height: 40, borderRadius: 20, position: 'absolute', left: 12 },
    categoryIconOverlay: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    categoryName: { fontSize: 16, fontWeight: "500", color: COLORS.text },
    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
    resultsCount: { fontSize: 14, color: COLORS.textMuted },
    clearAllText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
    listContainer: { padding: 16, gap: 12 },
    resultCard: { flexDirection: "row", backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12, gap: 16 },
    imageContainer: { width: 80, height: 80, borderRadius: 8, backgroundColor: COLORS.muted, overflow: "hidden" },
    serviceImage: { width: "100%", height: "100%" },
    cardContent: { flex: 1, justifyContent: "space-between" },
    serviceName: { fontSize: 16, fontWeight: "600", color: COLORS.text },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    ratingBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
    ratingText: { fontSize: 12, color: COLORS.textMuted },
    durationBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
    durationText: { fontSize: 12, color: COLORS.textMuted },
    priceRow: { flexDirection: "row", alignItems: "center" },
    price: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
    originalPrice: { fontSize: 12, color: COLORS.textMuted, textDecorationLine: "line-through", marginLeft: 8 },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
    emptyIcon: { marginBottom: 16, opacity: 0.3 },
    emptyTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text, marginBottom: 8 },
    emptyText: { color: COLORS.textMuted, textAlign: "center" },
    modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
    modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },
    filterLabel: { fontSize: 14, fontWeight: "700", marginBottom: 12, textTransform: 'uppercase' },
    filterOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
    filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterChipText: { fontSize: 13, color: COLORS.text },
    filterChipTextActive: { color: "#FFF" },
    modalFooter: { flexDirection: "row", gap: 12, marginTop: 24, paddingBottom: 20 },
    resetButton: { flex: 1, padding: 14, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
    resetButtonText: { fontWeight: "600", color: COLORS.text },
    applyButton: { flex: 2, padding: 14, alignItems: "center", borderRadius: 8, backgroundColor: COLORS.primary },
    applyButtonText: { color: "#FFF", fontWeight: "600" },
});