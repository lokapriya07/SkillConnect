// import { Colors } from "@/constants/Colors"
// import { categories, getFeaturedServices, getPopularServices } from "@/lib/services-data"
// import { useAppStore } from "@/lib/store"
// import { Ionicons } from "@expo/vector-icons"
// import { useRouter } from "expo-router"
// import {
//   Dimensions,
//   Image,
//   Platform,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native"

// const { width } = Dimensions.get("window")

// // DATA MAPPINGS
// const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
//   cleaning: "sparkles",
//   plumb: "construct",
//   plumbing: "construct",
//   electrical: "flash",
//   painting: "color-palette",
//   carpentry: "hammer",
//   appliance: "hardware-chip",
//   pest: "bug",
//   salon: "cut",
// }

// export const serviceImages: Record<string, string> = {
//   "clean-1": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
//   "clean-2": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
//   "plumb-1": "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400",
//   "elec-1": "https://images.unsplash.com/photo-1621905476059-5f6e90de7816?w=400",
//   "paint-1": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400",
//   "salon-1": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
// }

// export default function HomeScreen() {
//   const router = useRouter()
//   // Extracting activeJob from your Zustand store
//   const { currentLocation, getCartCount, activeJob } = useAppStore()

//   const featuredServices = getFeaturedServices()
//   const popularServices = getPopularServices()
//   const cartCount = getCartCount()

//   // Navigation Helpers
//   const goToSearch = () => router.push("/search")
//   const goToCart = () => router.push("/cart")
//   const goToProfile = () => router.push("/profile")
//   const goToUpload = () => router.push("/upload")

//   const handleCategoryPress = (id: string) => {
//     router.push(`/category/${id}` as any)
//   }

//   const handleServicePress = (id: string) => {
//     router.push(`/service/${id}`)
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.locationContainer}
//           onPress={() => router.push("/location" as any)}
//         >
//           <Ionicons name="location" size={20} color={Colors.white} />
//           <View style={styles.locationTextContainer}>
//             <Text style={styles.locationLabel}>Your Location</Text>
//             <Text style={styles.locationValue} numberOfLines={1}>
//               {currentLocation?.address || "Set your location"}
//             </Text>
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.searchBar} onPress={goToSearch} activeOpacity={0.9}>
//           <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
//           <Text style={styles.searchText}>Search for services...</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         style={styles.content}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 120 }}
//       >
//         {/* ✅ NEW: ACTIVE REQUEST TRACKER (Appears after Upload) */}
//         {activeJob && (
//           <View style={styles.activeJobSection}>
//             <TouchableOpacity
//               style={styles.activeJobCard}
//               onPress={() => router.push("/worker-bids" as any)}
//             >
//               <View style={styles.activeJobHeader}>
//                 <View style={styles.statusBadge}>
//                   <View style={styles.pulseDot} />
//                   <Text style={styles.statusText}>Finding nearby workers...</Text>
//                 </View>
//                 <Text style={styles.activeJobBudget}>₹{activeJob.budget}</Text>
//               </View>

//               <Text style={styles.activeJobDesc} numberOfLines={1}>
//                 "{activeJob.description}"
//               </Text>

//               <View style={styles.activeJobFooter}>
//                 <Text style={styles.viewBidsText}>View worker bids</Text>
//                 <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
//               </View>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Categories */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>What do you need?</Text>
//           <View style={styles.categoriesGrid}>
//             {categories.map((category) => (
//               <TouchableOpacity
//                 key={category.id}
//                 style={styles.categoryItem}
//                 onPress={() => handleCategoryPress(category.id)}
//               >
//                 <View
//                   style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}
//                 >
//                   <Ionicons
//                     name={categoryIcons[category.id] || "grid"}
//                     size={24}
//                     color={category.color}
//                   />
//                 </View>
//                 <Text style={styles.categoryName}>{category.name}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* Featured Offers */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Featured Offers</Text>
//             <TouchableOpacity style={styles.seeAllBtn}>
//               <Text style={styles.seeAllText}>See all</Text>
//               <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
//             </TouchableOpacity>
//           </View>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.horizontalScroll}
//           >
//             {featuredServices.map((service) => (
//               <TouchableOpacity
//                 key={service.id}
//                 style={styles.featuredCard}
//                 onPress={() => handleServicePress(service.id)}
//               >
//                 <View style={styles.featuredImageContainer}>
//                   <Image
//                     source={{ uri: serviceImages[service.id] || service.image }}
//                     style={styles.featuredImage}
//                   />
//                   {service.originalPrice && (
//                     <View style={styles.discountBadge}>
//                       <Text style={styles.discountText}>
//                         {Math.round((1 - service.price / service.originalPrice) * 100)}% OFF
//                       </Text>
//                     </View>
//                   )}
//                 </View>
//                 <View style={styles.featuredContent}>
//                   <Text style={styles.serviceName} numberOfLines={1}>
//                     {service.name}
//                   </Text>
//                   <View style={styles.ratingRow}>
//                     <Ionicons name="star" size={12} color="#FFD700" />
//                     <Text style={styles.ratingText}>{service.rating}</Text>
//                   </View>
//                   <View style={styles.priceRow}>
//                     <Text style={styles.price}>₹{service.price}</Text>
//                     {service.originalPrice && (
//                       <Text style={styles.originalPrice}>₹{service.originalPrice}</Text>
//                     )}
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Popular Services */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Popular Services</Text>
//             <TouchableOpacity style={styles.seeAllBtn}>
//               <Text style={styles.seeAllText}>See all</Text>
//               <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.popularList}>
//             {popularServices.slice(0, 4).map((service) => (
//               <TouchableOpacity
//                 key={service.id}
//                 style={styles.popularCard}
//                 onPress={() => handleServicePress(service.id)}
//               >
//                 <Image
//                   source={{ uri: serviceImages[service.id] || service.image }}
//                   style={styles.popularImage}
//                 />
//                 <View style={styles.popularContent}>
//                   <Text style={styles.popularName}>{service.name}</Text>
//                   <View style={styles.ratingRow}>
//                     <Ionicons name="star" size={12} color="#FFD700" />
//                     <Text style={styles.ratingText}>
//                       {service.rating} ({service.reviews})
//                     </Text>
//                   </View>
//                   <View style={styles.priceRow}>
//                     <Text style={styles.price}>₹{service.price}</Text>
//                     {service.originalPrice && (
//                       <Text style={styles.originalPrice}>₹{service.originalPrice}</Text>
//                     )}
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </ScrollView>

//       {/* Bottom Navigation Bar */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity style={styles.navItem}>
//           <Ionicons name="sparkles" size={24} color={Colors.primary} />
//           <Text style={[styles.navText, { color: Colors.primary }]}>Home</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem} onPress={goToUpload}>
//           <Ionicons name="cloud-upload-outline" size={24} color={Colors.textSecondary} />
//           <Text style={styles.navText}>Upload</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem} onPress={goToSearch}>
//           <Ionicons name="search-outline" size={24} color={Colors.textSecondary} />
//           <Text style={styles.navText}>Search</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem} onPress={goToCart}>
//           <View>
//             <Ionicons name="cart-outline" size={24} color={Colors.textSecondary} />
//             {cartCount > 0 && (
//               <View style={styles.cartBadge}>
//                 <Text style={styles.cartBadgeText}>{cartCount}</Text>
//               </View>
//             )}
//           </View>
//           <Text style={styles.navText}>Cart</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem} onPress={goToProfile}>
//           <Ionicons name="person-outline" size={24} color={Colors.textSecondary} />
//           <Text style={styles.navText}>Profile</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.background },
//   header: {
//     backgroundColor: Colors.primary,
//     paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 60,
//     paddingHorizontal: 20,
//     paddingBottom: 24,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   locationContainer: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   locationTextContainer: { marginLeft: 8 },
//   locationLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
//   locationValue: { fontSize: 14, fontWeight: "600", color: Colors.white, maxWidth: 250 },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//     padding: 12,
//     borderRadius: 12,
//   },
//   searchText: { marginLeft: 10, color: "rgba(255,255,255,0.7)", fontSize: 14 },
//   content: { flex: 1 },

//   // Active Job Status Card
//   activeJobSection: { paddingHorizontal: 20, marginTop: 20 },
//   activeJobCard: {
//     backgroundColor: "#F0F7FF",
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#D0E4FF",
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   activeJobHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   statusBadge: { flexDirection: "row", alignItems: "center" },
//   pulseDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#22C55E",
//     marginRight: 6,
//   },
//   statusText: { fontSize: 13, fontWeight: "700", color: "#1E40AF" },
//   activeJobBudget: { fontSize: 16, fontWeight: "800", color: Colors.primary },
//   activeJobDesc: {
//     fontSize: 14,
//     color: Colors.textSecondary,
//     fontStyle: "italic",
//     marginBottom: 12,
//   },
//   activeJobFooter: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     alignItems: "center",
//     borderTopWidth: 1,
//     borderTopColor: "#D0E4FF",
//     paddingTop: 8,
//   },
//   viewBidsText: { fontSize: 13, fontWeight: "600", color: Colors.primary, marginRight: 4 },

//   section: { paddingVertical: 15, paddingHorizontal: 20 },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, marginBottom: 12 },
//   seeAllBtn: { flexDirection: "row", alignItems: "center" },
//   seeAllText: { fontSize: 14, color: Colors.primary, fontWeight: "600", marginRight: 2 },
//   categoriesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
//   categoryItem: { width: "23%", alignItems: "center", marginBottom: 16 },
//   categoryIcon: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 8,
//   },
//   categoryName: { fontSize: 12, fontWeight: "500", color: Colors.text, textAlign: "center" },
//   horizontalScroll: { paddingRight: 20 },
//   featuredCard: {
//     width: 160,
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     overflow: "hidden",
//   },
//   featuredImageContainer: { height: 100, backgroundColor: "#f0f0f0", position: "relative" },
//   featuredImage: { width: "100%", height: "100%", resizeMode: "cover" },
//   discountBadge: {
//     position: "absolute",
//     top: 8,
//     left: 8,
//     backgroundColor: Colors.error,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   discountText: { color: Colors.white, fontSize: 10, fontWeight: "700" },
//   featuredContent: { padding: 10 },
//   serviceName: { fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 4 },
//   ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
//   ratingText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 4 },
//   priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
//   price: { fontSize: 14, fontWeight: "700", color: Colors.primary },
//   originalPrice: {
//     fontSize: 12,
//     color: Colors.textSecondary,
//     textDecorationLine: "line-through",
//   },
//   popularList: { gap: 12 },
//   popularCard: {
//     flexDirection: "row",
//     backgroundColor: Colors.white,
//     borderRadius: 12,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     alignItems: "center",
//   },
//   popularImage: {
//     width: 70,
//     height: 70,
//     borderRadius: 8,
//     resizeMode: "cover",
//     backgroundColor: "#f0f0f0",
//   },
//   popularContent: { flex: 1, marginLeft: 12 },
//   popularName: { fontSize: 15, fontWeight: "600", color: Colors.text, marginBottom: 4 },
//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     backgroundColor: Colors.white,
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: Colors.border,
//     paddingBottom: Platform.OS === "ios" ? 24 : 12,
//     elevation: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   navItem: { alignItems: "center", justifyContent: "center" },
//   navText: { fontSize: 10, marginTop: 4, color: Colors.textSecondary, fontWeight: "500" },
//   cartBadge: {
//     position: "absolute",
//     top: -5,
//     right: -8,
//     backgroundColor: Colors.primary,
//     borderRadius: 8,
//     width: 16,
//     height: 16,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: "bold" },
// })
import { Colors } from "@/constants/Colors";
import { categories, getFeaturedServices, getPopularServices } from "@/lib/services-data";
import { useAppStore } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// CAROUSEL DATA
const BANNERS = [
  {
    id: "1",
    title: "Women Spa \n& Saloon",
    subtitle: "Services near by you",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
    color: "#9C27B0",
  },
  {
    id: "2",
    title: "Kitchen \nCleaning",
    subtitle: "Services near by you",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
    color: "#FF9800",
  },
  {
    id: "3",
    title: "Salon \nfor men",
    subtitle: "Services near by you",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
    color: "#009688",
  },
];

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
};

export const serviceImages: Record<string, string> = {
  "clean-1": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
  "clean-2": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400",
  "plumb-1": "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400",
  "elec-1": "https://images.unsplash.com/photo-1621905476059-5f6e90de7816?w=400",
  "paint-1": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400",
  "salon-1": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
};

export default function HomeScreen() {
  const router = useRouter();
  const { currentLocation, getCartCount, activeJob } = useAppStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const featuredServices = getFeaturedServices();
  const popularServices = getPopularServices();
  const cartCount = getCartCount();

  // Auto-play logic for Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (activeIndex + 1) % BANNERS.length;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / (width - 40));
    if (index !== activeIndex) setActiveIndex(index);
  };

  const handleCategoryPress = (id: string) => router.push(`/category/${id}` as any);
  const handleServicePress = (id: string) => router.push(`/service/${id}`);
  const goToSearch = () => router.push("/search");
  const goToCart = () => router.push("/cart");
  const goToProfile = () => router.push("/profile");
  const goToUpload = () => router.push("/upload");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationContainer} onPress={() => router.push("/location" as any)}>
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
          <Text style={styles.searchText}>Search for services...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Categories Grid */}
        <View style={styles.section}>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryItem} onPress={() => handleCategoryPress(category.id)}>
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                  <Ionicons name={categoryIcons[category.id] || "grid"} size={24} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dynamic Carousel Banner */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.bannerWrapper}>
                <View style={[styles.bannerCard, { backgroundColor: item.color }]}>
                    <View style={styles.bannerTextContent}>
                        <Text style={styles.bannerSubtitle}>Best</Text>
                        <Text style={styles.bannerTitle}>{item.title}</Text>
                        <Text style={styles.bannerSmallText}>{item.subtitle}</Text>
                        <TouchableOpacity style={styles.bookNowBtn}>
                            <Text style={styles.bookNowText}>BOOK NOW</Text>
                        </TouchableOpacity>
                    </View>
                    <Image source={{ uri: item.image }} style={styles.bannerImage} />
                </View>
              </View>
            )}
          />
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, activeIndex === i ? styles.activeDot : null]} />
            ))}
          </View>
        </View>

        {/* Popular Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Most Booked Services</Text>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.popularList}>
            {popularServices.slice(0, 4).map((service) => (
              <TouchableOpacity key={service.id} style={styles.popularCard} onPress={() => handleServicePress(service.id)}>
                <Image source={{ uri: serviceImages[service.id] || service.image }} style={styles.popularImage} />
                <View style={styles.popularContent}>
                  <Text style={styles.popularName}>{service.name}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{service.rating} ({service.reviews})</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{service.price}</Text>
                    {service.originalPrice && <Text style={styles.originalPrice}>₹{service.originalPrice}</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  locationContainer: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  locationTextContainer: { marginLeft: 8 },
  locationLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  locationValue: { fontSize: 14, fontWeight: "600", color: Colors.white, maxWidth: 250 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 12,
  },
  searchText: { marginLeft: 10, color: "rgba(255,255,255,0.7)", fontSize: 14 },
  content: { flex: 1 },
  section: { paddingVertical: 15, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  categoryItem: { width: "23%", alignItems: "center", marginBottom: 16 },
  categoryIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  categoryName: { fontSize: 12, fontWeight: "500", color: Colors.text, textAlign: "center" },
  
  // CAROUSEL STYLES
  carouselContainer: { marginVertical: 10, alignItems: 'center' },
  bannerWrapper: { width: width, paddingHorizontal: 20 },
  bannerCard: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bannerTextContent: { flex: 1.2, padding: 20, justifyContent: 'center' },
  bannerSubtitle: { color: '#FFF', fontSize: 14, opacity: 0.9 },
  bannerTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', marginVertical: 4 },
  bannerSmallText: { color: '#FFF', fontSize: 12, marginBottom: 15 },
  bookNowBtn: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  bookNowText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  bannerImage: { flex: 1, height: '100%', width: '100%', resizeMode: 'cover' },
  pagination: { flexDirection: 'row', marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CCC', marginHorizontal: 4 },
  activeDot: { width: 20, backgroundColor: Colors.primary },

  popularList: { gap: 12 },
  popularCard: { flexDirection: "row", backgroundColor: Colors.white, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  popularImage: { width: 70, height: 70, borderRadius: 8, resizeMode: "cover" },
  popularContent: { flex: 1, marginLeft: 12 },
  popularName: { fontSize: 15, fontWeight: "600", color: Colors.text, marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  ratingText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  originalPrice: { fontSize: 12, color: Colors.textSecondary, textDecorationLine: "line-through" },
  seeAllBtn: { flexDirection: "row", alignItems: "center" },
  seeAllText: { fontSize: 14, color: Colors.primary, fontWeight: "600", marginRight: 2 },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 10, marginTop: 4, color: Colors.textSecondary, fontWeight: "500" },
  cartBadge: { position: "absolute", top: -5, right: -8, backgroundColor: Colors.primary, borderRadius: 8, width: 16, height: 16, justifyContent: "center", alignItems: "center" },
  cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: "bold" },
});