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
import { Colors } from "@/constants/Colors";
import { useAppStore } from "@/lib/store";

interface SearchScreenProps {
    onBack: () => void;
    onServiceSelect: (serviceId: string) => void;
}

type SortOption = "relevance" | "price_low" | "rating";

export function SearchScreen({ onBack, onServiceSelect }: SearchScreenProps) {
    const { darkMode } = useAppStore();
    const [query, setQuery] = useState("");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    
    // UPDATED: Recent searches now live in state
    const [recentSearches, setRecentSearches] = useState(["AC Repair", "Cleaning", "Plumber", "Electrician"]);

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [minRating, setMinRating] = useState<number | null>(null);
    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("relevance");

    // Theme colors
    const backgroundColor = darkMode ? Colors.backgroundDark : Colors.background
    const surfaceColor = darkMode ? Colors.surfaceDark : Colors.surface
    const surfaceVariantColor = darkMode ? Colors.gray[800] : Colors.gray[100]
    const textColor = darkMode ? Colors.textDark : Colors.text
    const textSecondaryColor = darkMode ? Colors.textSecondaryDark : Colors.textSecondary
    const borderColor = darkMode ? Colors.borderDark : Colors.border
    const mutedBg = darkMode ? Colors.gray[900] : Colors.gray[100]

    const hasActiveFilters = !!(selectedCategory || minRating || maxPrice || sortBy !== "relevance");
    const activeFilterCount = [selectedCategory, minRating, maxPrice, sortBy !== "relevance"].filter(Boolean).length;

    // UPDATED: Logic to add to recent searches
    const handleSearchSubmit = (term: string) => {
        const text = term.trim();
        if (!text) return;

        setRecentSearches((prev) => {
            const filtered = prev.filter((item) => item.toLowerCase() !== text.toLowerCase());
            return [text, ...filtered].slice(0, 6); // Keep top 6
        });
    };

    // UPDATED: Logic to remove a single recent search
    const removeRecentSearch = (term: string) => {
        setRecentSearches(prev => prev.filter(item => item !== term));
    };

    const filteredServices = useMemo(() => {
        const searchTerm = query.trim().toLowerCase();
        if (!searchTerm && !hasActiveFilters) return [];

        let result = services.filter((service) => {
            const matchesQuery = !searchTerm || 
                service.name.toLowerCase().includes(searchTerm) ||
                service.description.toLowerCase().includes(searchTerm) ||
                service.category.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !selectedCategory || 
                service.category.toLowerCase() === selectedCategory.toLowerCase();

            const matchesRating = !minRating || service.rating >= minRating;
            const matchesPrice = !maxPrice || service.price <= maxPrice;

            return matchesQuery && matchesCategory && matchesRating && matchesPrice;
        });

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

    // Dynamic styles
    const getStyles = () => StyleSheet.create({
        container: { flex: 1, backgroundColor: backgroundColor, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
        header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: borderColor, gap: 12, backgroundColor: surfaceColor },
        backButton: { padding: 4 },
        searchContainer: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: surfaceVariantColor, borderWidth: 1, borderColor: borderColor, borderRadius: 8, height: 44, paddingHorizontal: 12 },
        searchIcon: { marginRight: 8 },
        input: { flex: 1, fontSize: 16, color: textColor, height: "100%" },
        actionButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
        iconButton: { padding: 4 },
        filterTrigger: { position: 'relative', padding: 4 },
        filterDot: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: backgroundColor },
        content: { flex: 1 },
        section: { padding: 16 },
        borderTop: { borderTopWidth: 1, borderTopColor: borderColor },
        sectionTitle: { fontSize: 12, fontWeight: "600", color: textSecondaryColor, marginBottom: 12, textTransform: "uppercase" },
        tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
        tagWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: surfaceVariantColor, borderRadius: 20, paddingRight: 8 },
        tag: { paddingHorizontal: 12, paddingVertical: 8 },
        tagRemove: { padding: 4 },
        tagText: { fontSize: 14, color: textColor },
        categoriesList: { gap: 12 },
        categoryItem: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8 },
        categoryIcon: { width: 40, height: 40, borderRadius: 20, position: 'absolute', left: 12 },
        categoryIconOverlay: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
        categoryName: { fontSize: 16, fontWeight: "500", color: textColor },
        resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
        resultsCount: { fontSize: 14, color: textSecondaryColor },
        clearAllText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
        listContainer: { padding: 16, gap: 12 },
        resultCard: { flexDirection: "row", backgroundColor: surfaceColor, borderRadius: 12, borderWidth: 1, borderColor: borderColor, padding: 12, gap: 16 },
        imageContainer: { width: 80, height: 80, borderRadius: 8, backgroundColor: mutedBg, overflow: "hidden" },
        serviceImage: { width: "100%", height: "100%" },
        cardContent: { flex: 1, justifyContent: "space-between" },
        serviceName: { fontSize: 16, fontWeight: "600", color: textColor },
        metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
        ratingBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
        ratingText: { fontSize: 12, color: textSecondaryColor },
        durationBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
        durationText: { fontSize: 12, color: textSecondaryColor },
        priceRow: { flexDirection: "row", alignItems: "center" },
        price: { fontSize: 16, fontWeight: "700", color: Colors.primary },
        originalPrice: { fontSize: 12, color: textSecondaryColor, textDecorationLine: "line-through", marginLeft: 8 },
        emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
        emptyIcon: { marginBottom: 16, opacity: 0.3 },
        emptyTitle: { fontSize: 18, fontWeight: "600", color: textColor, marginBottom: 8 },
        emptyText: { color: textSecondaryColor, textAlign: "center" },
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: "flex-end" },
        modalContent: { backgroundColor: surfaceColor, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
        modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
        modalTitle: { fontSize: 20, fontWeight: "700", color: textColor },
        filterLabel: { fontSize: 14, fontWeight: "700", marginBottom: 12, textTransform: 'uppercase', color: textColor },
        filterOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
        filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: borderColor, backgroundColor: surfaceVariantColor },
        filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
        filterChipText: { fontSize: 13, color: textColor },
        filterChipTextActive: { color: "#FFF" },
        modalFooter: { flexDirection: "row", gap: 12, marginTop: 24, paddingBottom: 20 },
        resetButton: { flex: 1, padding: 14, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: borderColor, backgroundColor: surfaceVariantColor },
        resetButtonText: { fontWeight: "600", color: textColor },
        applyButton: { flex: 2, padding: 14, alignItems: "center", borderRadius: 8, backgroundColor: Colors.primary },
        applyButtonText: { color: "#FFF", fontWeight: "600" },
        activeFiltersScroll: { backgroundColor: surfaceColor, borderBottomWidth: 1, borderBottomColor: borderColor, paddingVertical: 10 },
        activeFiltersInner: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
        activeFilterBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: surfaceVariantColor, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6, borderWidth: 1, borderColor: borderColor },
        activeFilterText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
    })

    const styles = getStyles()

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
                        <Star size={12} color="#facc15" fill="#facc15" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <View style={styles.durationBadge}>
                        <Clock size={12} color={textSecondaryColor} />
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
                    <ArrowLeft size={24} color={textColor} />
                </TouchableOpacity>

                <View style={styles.searchContainer}>
                    <Search size={20} color={textSecondaryColor} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search services..."
                        placeholderTextColor={textSecondaryColor}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => handleSearchSubmit(query)}
                        returnKeyType="search"
                        style={styles.input}
                        autoFocus={true}
                    />
                    <View style={styles.actionButtons}>
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery("")} style={styles.iconButton}>
                                <X size={20} color={textSecondaryColor} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            onPress={() => setIsFilterVisible(true)} 
                            style={styles.filterTrigger}
                        >
                            <SlidersHorizontal size={20} color={activeFilterCount > 0 ? Colors.primary : textSecondaryColor} />
                            {activeFilterCount > 0 && <View style={styles.filterDot} />}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Active Filter Chips Row */}
            {hasActiveFilters && (
                <View style={styles.activeFiltersScroll}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersInner}>
                        {selectedCategory && (
                            <View style={styles.activeFilterBadge}>
                                <Text style={styles.activeFilterText}>{selectedCategory}</Text>
                                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                                    <X size={14} color={Colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {maxPrice && (
                            <View style={styles.activeFilterBadge}>
                                <Text style={styles.activeFilterText}>Under ₹{maxPrice}</Text>
                                <TouchableOpacity onPress={() => setMaxPrice(null)}>
                                    <X size={14} color={Colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {sortBy !== "relevance" && (
                            <View style={styles.activeFilterBadge}>
                                <Text style={styles.activeFilterText}>
                                    {sortBy === 'price_low' ? 'Price: Low' : 'Top Rated'}
                                </Text>
                                <TouchableOpacity onPress={() => setSortBy("relevance")}>
                                    <X size={14} color={Colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}

            {(!query.trim() && !hasActiveFilters) ? (
                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.section}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
                            {recentSearches.length > 0 && (
                                <TouchableOpacity onPress={() => setRecentSearches([])}>
                                    <Text style={[styles.sectionTitle, {color: Colors.primary}]}>Clear All</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.tagsContainer}>
                            {recentSearches.map((search, index) => (
                                <View key={index} style={styles.tagWrapper}>
                                    <TouchableOpacity style={styles.tag} onPress={() => setQuery(search)}>
                                        <Text style={styles.tagText}>{search}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.tagRemove} onPress={() => removeRecentSearch(search)}>
                                        <X size={12} color={textSecondaryColor} />
                                    </TouchableOpacity>
                                </View>
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
                                    onPress={() => {
                                        setSelectedCategory(category.name);
                                        handleSearchSubmit(category.name);
                                    }}
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
                            <Search size={64} color={textSecondaryColor} style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>No results found</Text>
                            <Text style={styles.emptyText}>Try adjusting your filters or search term</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Filter Modal */}
            <Modal animationType="slide" transparent={true} visible={isFilterVisible} onRequestClose={() => setIsFilterVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setIsFilterVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filters & Sort</Text>
                            <TouchableOpacity onPress={() => setIsFilterVisible(false)}><X size={24} color={textColor} /></TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.filterLabel}>Sort By</Text>
                            <View style={styles.filterOptions}>
                                {[{id:'relevance', l:'Relevance'}, {id:'price_low', l:'Price: Low to High'}, {id:'rating', l:'Top Rated'}].map(o => (
                                    <TouchableOpacity key={o.id} style={[styles.filterChip, sortBy === o.id ? styles.filterChipActive : null]} onPress={() => setSortBy(o.id as SortOption)}>
                                        <Text style={[styles.filterChipText, sortBy === o.id ? styles.filterChipTextActive : null]}>{o.l}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Category</Text>
                            <View style={styles.filterOptions}>
                                {categories.map(cat => (
                                    <TouchableOpacity key={cat.id} style={[styles.filterChip, selectedCategory === cat.name ? styles.filterChipActive : null]} onPress={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}>
                                        <Text style={[styles.filterChipText, selectedCategory === cat.name ? styles.filterChipTextActive : null]}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Budget</Text>
                            <View style={styles.filterOptions}>
                                {[{l:'Under ₹500', v:500}, {l:'Under ₹1000', v:1000}, {l:'Under ₹5000', v:5000}].map(p => (
                                    <TouchableOpacity key={p.v} style={[styles.filterChip, maxPrice === p.v ? styles.filterChipActive : null]} onPress={() => setMaxPrice(maxPrice === p.v ? null : p.v)}>
                                        <Text style={[styles.filterChipText, maxPrice === p.v ? styles.filterChipTextActive : null]}>{p.l}</Text>
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
