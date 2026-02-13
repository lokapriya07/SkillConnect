

import { Colors } from "@/constants/Colors"
import { categories, getFeaturedServices, getPopularServices } from "@/lib/services-data"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useEffect, useRef, useState } from "react"
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ImageBackground, 
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

// DATA MAPPINGS
const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  cleaning: "sparkles",
  plumb: "construct",
  plumbing: "construct",
  electrical: "flash",
  painting: "color-palette",
  carpentry: "hammer",
  appliance: "hardware-chip",
  pest: "bug",
  salon: "cut",
}

const BANNERS = [
  {
    id: '1',
    categoryId: 'cleaning',
    serviceId: 'salon-2', // Points to Home Cleaning
    image: 'https://cdn.shopify.com/s/files/1/0026/4549/1812/files/shutterstock_1236164359_1024x1024.jpg?v=1614305641',
    title: 'Republic Day Sale',
    subtitle: 'Flat 50% Off on all Spa Services',
    offer: 'UPTO 50% OFF',
    searchHint: 'Home Cleaning',
    color: '#FF9933' 
  },
  {
    id: '2',
    categoryId: 'cleaning',
    serviceId: 'clean-3', // <--- THIS points to Kitchen Cleaning
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    title: 'Kitchen Cleaning',
    subtitle: 'Expert deep cleaning for your home',
    offer: 'Starting @ ₹299',
    searchHint: 'Kitchen Cleaning',
    color: '#000080' 
  },
  {
    id: '3',
    categoryId: 'salon',
    serviceId: 'salon-men-1', // Points to Salon/Men
    image: 'https://images.unsplash.com/photo-1521223344201-d169129f7b7d?w=800',
    title: 'Salon for Men',
    subtitle: 'Top rated stylists at your doorstep',
    offer: '20% OFF FIRST VISIT',
    searchHint: 'Salon for Men',
    color: '#128C7E' 
  },
];

export const serviceImages: Record<string, string> = {
  "clean-1": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
  "clean-2": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
  "plumb-1": "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400",
  "elec-1": "https://images.unsplash.com/photo-1621905476059-5f6e90de7816?w=400",
  "paint-1": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400",
  "salon-1": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
}


export default function HomeScreen() {
  const router = useRouter()
  const { currentLocation, getCartCount, activeJobs, user, fetchActiveJobs } = useAppStore()

  // Carousel Logic
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const featuredServices = getFeaturedServices()
  const popularServices = getPopularServices()
  const cartCount = getCartCount()
  useEffect(() => {
    if (user) {
      fetchActiveJobs();
    }
  }, [user]);
  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeIndex === BANNERS.length - 1 ? 0 : activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleScroll = (event: any) => {
    const scrollPos = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPos / width);
    setActiveIndex(index);
  };

  // Navigation Helpers
  const goToSearch = () => router.push("/search")
  const goToCart = () => router.push("/cart")
  const goToProfile = () => router.push("/profile")
  const goToUpload = () => router.push("/upload")

  const handleCategoryPress = (id: string) => {
    router.push(`/category/${id}` as any)
  }

  const handleServicePress = (id: string) => {
    router.push(`/service/${id}`)
  }

  // REAL WORLD ACTION: Navigate to the specific category from banner
  const handleBannerPress = (item: typeof BANNERS[0]) => {
    console.log("Booking from banner:", item.title);
    router.push(`/category/${item.categoryId}` as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      {/* Updated Header with Republic Day Background */}
      <ImageBackground
        source={{ uri: 'https://static.zoomnews.com/thumb/msid-107120950,width-1280,height-720,resizemode-75/107120950.jpg' }}
        style={[styles.header, { height: 200 }]}
        imageStyle={{ opacity: 0.7 }} // Makes text easier to read
      >
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => router.push("/location" as any)}
        >
          <Ionicons name="location" size={20} color={Colors.white} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Your Location</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {currentLocation?.address || "Set your location"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchBar} onPress={goToSearch} activeOpacity={0.9}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
          <Text style={styles.searchText}>Search for '{BANNERS[activeIndex].searchHint}'</Text>
        </TouchableOpacity>
      </ImageBackground>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Active Request Tracker */}
        {activeJobs && activeJobs.length > 0 && activeJobs.map((job) => {
          // Use the database _id if available, otherwise fallback to id
          const stableId = job._id || job.id;

          return (
            <View key={stableId} style={styles.trackerContainer}>
              <TouchableOpacity
                style={styles.trackerCard}
                onPress={() =>
                  router.push({
                    pathname: "/worker-bids" as any,
                    params: { jobId: stableId }
                  })
                }
              >
                <View style={styles.trackerHeader}>
                  <View style={styles.statusGroup}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.statusText}>AI Matching In Progress...</Text>
                  </View>
                  <Text style={styles.trackerBudget}>₹{job.budget}</Text>
                </View>

                <Text style={styles.trackerDesc} numberOfLines={1}>
                  Matching: "{job.description}"
                </Text>

                <View style={styles.trackerFooter}>
                  <Text style={styles.actionText}>
                    View Ranked Workers ({job.matchedWorkers?.length || 0})
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Categories Grid */}
        <View style={styles.section}>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category.id)}
              >
                <View
                  style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}
                >
                  <Ionicons
                    name={categoryIcons[category.id] || "grid"}
                    size={24}
                    color={category.color}
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Carousel Banner Section */}
        <View style={styles.carouselSection}>
          <FlatList
            ref={flatListRef}
            data={BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              // Logic to insert a newline after the 3rd word
              const words = item.subtitle.split(' ');
              const formattedSubtitle = words.length > 3
                ? `${words.slice(0, 3).join(' ')}\n${words.slice(3).join(' ')}`
                : item.subtitle;

              return (
                <View style={styles.bannerWrapper}>
                  <View style={[styles.bannerCard, { backgroundColor: item.color }]}>
                    <View style={styles.bannerContent}>
                      <View style={styles.offerBadge}>
                        <Text style={styles.offerBadgeText}>{item.offer}</Text>
                      </View>
                      <Text style={styles.bannerTitle}>{item.title}</Text>

                      {/* Use the formattedSubtitle here */}
                      <Text style={styles.bannerSubtitle}>{formattedSubtitle}</Text>

                      {/* <TouchableOpacity style={styles.bookNowBtn}>
                        <Text style={styles.bookNowText}>BOOK NOW</Text>
                      </TouchableOpacity> */}
                      <TouchableOpacity 
  style={styles.bookNowBtn} 
  onPress={() => {
    // If a specific serviceId exists, go to that service page
    // Otherwise, fall back to the category page
    if (item.serviceId) {
      router.push(`/service/${item.serviceId}`);
    } else {
      router.push(`/category/${item.categoryId}` as any);
    }
  }}
>
  <Text style={styles.bookNowText}>BOOK NOW</Text>
</TouchableOpacity>
                    </View>

                    <View style={styles.imageBgCircle} />
                    <Image source={{ uri: item.image }} style={styles.bannerImage} />
                  </View>
                </View>
              );
            }}
          />
          {/* Pagination Indicators */}
          <View style={styles.pagination}>
            {BANNERS.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { 
                    backgroundColor: activeIndex === i ? Colors.primary : '#D1D1D1',
                    width: activeIndex === i ? 20 : 8 
                  }
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Featured Offers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Offers</Text>
            
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push("/featured-services")}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>

          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {featuredServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.featuredCard}
                onPress={() => handleServicePress(service.id)}
              >
                <View style={styles.featuredImageContainer}>
                  <Image
                    source={{ uri: serviceImages[service.id] || service.image }}
                    style={styles.featuredImage}
                  />
                  {service.originalPrice && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {Math.round((1 - service.price / service.originalPrice) * 100)}% OFF
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {service.name}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{service.rating}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{service.price}</Text>
                    {service.originalPrice && (
                      <Text style={styles.originalPrice}>₹{service.originalPrice}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push("/popular-services")}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
            
          </View>
          <View style={styles.popularList}>
            {popularServices.slice(0, 4).map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.popularCard}
                onPress={() => handleServicePress(service.id)}
              >
                <Image
                  source={{ uri: serviceImages[service.id] || service.image }}
                  style={styles.popularImage}
                />
                <View style={styles.popularContent}>
                  <Text style={styles.popularName}>{service.name}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {service.rating} ({service.reviews})
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{service.price}</Text>
                    {service.originalPrice && (
                      <Text style={styles.originalPrice}>₹{service.originalPrice}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="sparkles" size={24} color={Colors.primary} />
          <Text style={[styles.navText, { color: Colors.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToUpload}>
          <Ionicons name="cloud-upload-outline" size={24} color={Colors.textSecondary} />
          <Text style={styles.navText}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToSearch}>
          <Ionicons name="search-outline" size={24} color={Colors.textSecondary} />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToCart}>
          <View>
            <Ionicons name="cart-outline" size={24} color={Colors.textSecondary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={goToProfile}>
          <Ionicons name="person-outline" size={24} color={Colors.textSecondary} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  locationContainer: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  locationTextContainer: { marginLeft: 8 },
  locationLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  locationValue: { fontSize: 14, fontWeight: "600", color: Colors.white, maxWidth: 250 },
  searchText: { marginLeft: 10, color: "rgba(255,255,255,0.9)", fontSize: 14 },
  content: { flex: 1 },
  bestLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },

  // Active Job Status Card
  activeJobSection: { paddingHorizontal: 20, marginTop: 20 },
  activeJobCard: {
    backgroundColor: "#F0F7FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D0E4FF",
    elevation: 3,
  },
  activeJobHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  statusBadge: { flexDirection: "row", alignItems: "center" },
  // pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E", marginRight: 6 },
  // statusText: { fontSize: 13, fontWeight: "700", color: "#1E40AF" },
  activeJobBudget: { fontSize: 16, fontWeight: "800", color: Colors.primary },
  activeJobDesc: { fontSize: 14, color: Colors.textSecondary, fontStyle: "italic", marginBottom: 12 },
  activeJobFooter: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", borderTopWidth: 1, borderTopColor: "#D0E4FF", paddingTop: 8 },
  viewBidsText: { fontSize: 13, fontWeight: "600", color: Colors.primary, marginRight: 4 },

  // section: { paddingVertical: 15, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  // sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },
  seeAllBtn: { flexDirection: "row", alignItems: "center" },
  seeAllText: { fontSize: 14, color: Colors.primary, fontWeight: "600", marginRight: 2 },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  categoryItem: { width: "23%", alignItems: "center", marginBottom: 16 },
  categoryIcon: { width: 55, height: 55, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  categoryName: { fontSize: 11, fontWeight: "600", color: Colors.text, textAlign: "center" },
  horizontalScroll: { paddingRight: 20 },
  featuredCard: { width: 160, backgroundColor: Colors.white, borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  featuredImageContainer: { height: 100, backgroundColor: "#f0f0f0", position: "relative" },
  featuredImage: { width: "100%", height: "100%", resizeMode: "cover" },
  discountBadge: { position: "absolute", top: 8, left: 8, backgroundColor: Colors.error, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: Colors.white, fontSize: 10, fontWeight: "700" },
  featuredContent: { padding: 10 },
  serviceName: { fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  ratingText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  originalPrice: { fontSize: 12, color: Colors.textSecondary, textDecorationLine: "line-through" },
  popularList: { gap: 12 },
  popularCard: { flexDirection: "row", backgroundColor: Colors.white, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  popularImage: { width: 70, height: 70, borderRadius: 8, resizeMode: "cover" },
  popularContent: { flex: 1, marginLeft: 12 },
  popularName: { fontSize: 15, fontWeight: "600", color: Colors.text, marginBottom: 4 },
  bottomNav: {
    position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around",
    backgroundColor: Colors.white, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border,
    paddingBottom: Platform.OS === "ios" ? 24 : 12, elevation: 20
  }, 
  navItem: { alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 10, marginTop: 4, color: Colors.textSecondary, fontWeight: "500" },
  cartBadge: { position: "absolute", top: -5, right: -8, backgroundColor: Colors.primary, borderRadius: 8, width: 16, height: 16, justifyContent: "center", alignItems: "center" },
  cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: "bold" },
  header: {
    backgroundColor: "#000", // Background color set to black
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 10,
    overflow: 'hidden', // Required to keep image within rounded corners
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)", // Darker translucent background for search
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  // Carousel Styles
  carouselSection: { marginVertical: 0 },
  bannerWrapper: { width: width, paddingHorizontal: 15 },
  bannerCard: {
    height: 180,
    borderRadius: 24,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  bannerContent: { flex: 1.2, zIndex: 5, justifyContent: 'center' },
  offerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  offerBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  bannerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 4 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500', marginBottom: 15 },
  bookNowBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  bookNowText: { color: '#000', fontSize: 12, fontWeight: 'bold' },

  // Floating Image Effect
  bannerImage: {
    width: 180,
    height: 200,
    resizeMode: 'cover',
    // Makes it a circle like the video
    position: 'absolute',
    right: -10,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  imageBgCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    right: -40,
    top: -20,
  },
  trackerContainer: { padding: 10, marginTop: -1 },
  trackerCard: { backgroundColor: 'white', borderRadius: 15, padding: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  trackerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50' },
  statusText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 12 },
  trackerBudget: { fontWeight: 'bold', fontSize: 16 },
  trackerDesc: { color: '#666', marginVertical: 8, fontSize: 14, fontStyle: 'italic' },
  trackerFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, marginTop: 5 },
  actionText: { color: Colors.primary, fontWeight: '700' },

  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  catItem: { alignItems: 'center', gap: 8 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#e3f2fd', justifyContent: 'center', alignItems: 'center' },
  catLabel: { fontSize: 12, fontWeight: '500' },
})