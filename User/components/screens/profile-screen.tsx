// "use client"

// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { useAppStore } from "@/lib/store"
// import { Colors } from "@/constants/Colors"
// import { useRouter, Href } from "expo-router"
// import { useSafeAreaInsets } from "react-native-safe-area-context"

// interface ProfileScreenProps {
//     onLogout: () => void
// }

// const menuItems = [
//     { id: "bookings", icon: "calendar", title: "My Bookings", subtitle: "View all your bookings", route: "/bookings" as Href },
//     { id: "help", icon: "chatbubble-ellipses", title: "Help & Support", subtitle: "Get help, contact us", route: "/help" as Href },
//     { id: "about", icon: "information-circle", title: "About", subtitle: "App version, terms, privacy", route: "/about" as Href },
// ]

// export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
//     const { user, isAuthenticated, darkMode } = useAppStore()
//     const router = useRouter()
//     const insets = useSafeAreaInsets()

//     // Theme colors
//     const backgroundColor = darkMode ? Colors.backgroundDark : Colors.background
//     const surfaceColor = darkMode ? Colors.surfaceDark : Colors.surface
//     const surfaceVariantColor = darkMode ? Colors.gray[800] : Colors.gray[100]
//     const textColor = darkMode ? Colors.textDark : Colors.text
//     const textSecondaryColor = darkMode ? Colors.textSecondaryDark : Colors.textSecondary
//     const borderColor = darkMode ? Colors.borderDark : Colors.border
//     const placeholderBg = darkMode ? Colors.gray[700] : Colors.gray[200]

//     // Dynamic styles
//     const getStyles = () => StyleSheet.create({
//         container: {
//             flex: 1,
//             backgroundColor: backgroundColor,
//         },
//         content: {
//             flex: 1,
//         },
//         scrollableHeader: {
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             paddingHorizontal: 20,
//             paddingVertical: 15,
//         },
//         headerTitle: {
//             fontSize: 28,
//             fontWeight: '800',
//             color: textColor,
//         },
//         settingsBtn: {
//             padding: 8,
//             backgroundColor: surfaceColor,
//             borderRadius: 12,
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.05,
//             shadowRadius: 5,
//             elevation: 2,
//         },
//         profileSection: {
//             alignItems: 'center',
//             paddingVertical: 20,
//         },
//         profileImageContainer: {
//             position: 'relative',
//             marginBottom: 16,
//         },
//         activeRing: {
//             padding: 4,
//             borderRadius: 60,
//             borderWidth: 2,
//             borderColor: Colors.primary,
//             borderStyle: 'dashed',
//         },
//         profileImage: {
//             width: 100,
//             height: 100,
//             borderRadius: 50,
//         },
//         profilePlaceholder: {
//             width: 100,
//             height: 100,
//             borderRadius: 50,
//             backgroundColor: placeholderBg,
//             alignItems: 'center',
//             justifyContent: 'center',
//         },
//         editBadge: {
//             position: 'absolute',
//             bottom: 5,
//             right: 5,
//             backgroundColor: Colors.primary,
//             width: 30,
//             height: 30,
//             borderRadius: 15,
//             justifyContent: 'center',
//             alignItems: 'center',
//             borderWidth: 3,
//             borderColor: backgroundColor,
//         },
//         profileName: {
//             fontSize: 22,
//             fontWeight: '700',
//             color: textColor,
//         },
//         profilePhone: {
//             fontSize: 14,
//             color: textSecondaryColor,
//             marginTop: 4,
//         },
//         membershipCard: {
//             backgroundColor: Colors.primary,
//             marginHorizontal: 20,
//             borderRadius: 24,
//             padding: 20,
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             shadowColor: Colors.primary,
//             shadowOffset: { width: 0, height: 8 },
//             shadowOpacity: 0.3,
//             shadowRadius: 12,
//             elevation: 6,
//         },
//         membershipInfo: {
//             flexDirection: 'row',
//             alignItems: 'center',
//         },
//         crownCircle: {
//             width: 44,
//             height: 44,
//             borderRadius: 22,
//             backgroundColor: 'rgba(255,255,255,0.2)',
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginRight: 15,
//         },
//         membershipTitle: {
//             color: '#FFF',
//             fontSize: 18,
//             fontWeight: '700',
//         },
//         membershipSubtitle: {
//             color: 'rgba(255,255,255,0.8)',
//             fontSize: 13,
//         },
//         statsRow: {
//             flexDirection: 'row',
//             backgroundColor: surfaceColor,
//             marginHorizontal: 20,
//             marginTop: 25,
//             borderRadius: 20,
//             paddingVertical: 18,
//             borderWidth: 1,
//             borderColor: borderColor,
//         },
//         statBox: {
//             flex: 1,
//             alignItems: 'center',
//         },
//         statBorder: {
//             borderLeftWidth: 1,
//             borderRightWidth: 1,
//             borderColor: borderColor,
//         },
//         statVal: {
//             fontSize: 18,
//             fontWeight: '700',
//             color: textColor,
//         },
//         statLab: {
//             fontSize: 12,
//             color: textSecondaryColor,
//             marginTop: 2,
//         },
//         menuWrapper: {
//             backgroundColor: surfaceColor,
//             marginHorizontal: 20,
//             marginTop: 25,
//             borderRadius: 24,
//             paddingHorizontal: 16,
//             paddingVertical: 4,
//             borderWidth: 1,
//             borderColor: borderColor,
//         },
//         menuRow: {
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             paddingVertical: 16,
//             borderBottomWidth: 1,
//             borderBottomColor: borderColor,
//         },
//         menuLeft: {
//             flexDirection: 'row',
//             alignItems: 'center',
//         },
//         iconCircle: {
//             width: 40,
//             height: 40,
//             borderRadius: 12,
//             backgroundColor: surfaceVariantColor,
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginRight: 15,
//         },
//         menuLabel: {
//             fontSize: 15,
//             fontWeight: '600',
//             color: textColor,
//         },
//         menuSubLabel: {
//             fontSize: 12,
//             color: textSecondaryColor,
//         },
//         logoutBtn: {
//             marginHorizontal: 20,
//             marginTop: 30,
//             height: 56,
//             borderRadius: 20,
//             justifyContent: 'center',
//             alignItems: 'center',
//             backgroundColor: surfaceColor,
//             borderWidth: 1,
//             borderColor: darkMode ? "#5C1A1A" : "#FFE5E5",
//         },
//         logoutBtnText: {
//             color: Colors.error,
//             fontSize: 16,
//             fontWeight: '700',
//         },
//         versionText: {
//             textAlign: 'center',
//             marginTop: 24,
//             color: textSecondaryColor,
//             fontSize: 12,
//             opacity: 0.5,
//         }
//     })

//     const styles = getStyles()

//     return (
//         <View style={styles.container}>
//             <ScrollView 
//                 style={styles.content} 
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={{ 
//                     paddingTop: insets.top, 
//                     paddingBottom: insets.bottom + 40 
//                 }}
//             >
//                 {/* Header - Now inside ScrollView */}
//                 <View style={styles.scrollableHeader}>
//                     <Text style={styles.headerTitle}>Account</Text>
//                     <TouchableOpacity
//                         style={styles.settingsBtn}
//                         onPress={() => router.push("/settings")}
//                     >
//                         <Ionicons name="settings-outline" size={24} color={textColor} />
//                     </TouchableOpacity>
//                 </View>

//                 {/* Profile Section */}
//                 <View style={styles.profileSection}>
//                     <View style={styles.profileImageContainer}>
//                         <View style={styles.activeRing}>
//                             {isAuthenticated && user ? (
//                                 <Image
//                                     source={{ uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" }}
//                                     style={styles.profileImage}
//                                 />
//                             ) : (
//                                 <View style={styles.profilePlaceholder}>
//                                     <Ionicons name="person" size={40} color={textSecondaryColor} />
//                                 </View>
//                             )}
//                         </View>
//                         <TouchableOpacity 
//                             style={styles.editBadge}
//                             onPress={() => router.push("/edit-profile" as Href)}
//                         >
//                             <Ionicons name="pencil" size={14} color={Colors.white} />
//                         </TouchableOpacity>
//                     </View>

//                     <Text style={styles.profileName}>
//                         {isAuthenticated ? (user?.name || "John Doe") : "Guest User"}
//                     </Text>
//                     <Text style={styles.profilePhone}>
//                         {user?.phone || "+1 (555) 123-4567"}
//                     </Text>
                    
//                 </View>

//                 {/* Membership Card */}
//                 <TouchableOpacity 
//                     style={styles.membershipCard}
//                     activeOpacity={0.9}
//                     onPress={() => router.push('/service-upgrade' as any)}
//                 >
//                     <View style={styles.membershipInfo}>
//                         <View style={styles.crownCircle}>
//                             <Ionicons name="diamond" size={20} color="#FFF" />
//                         </View>
//                         <View>
//                             <Text style={styles.membershipTitle}>ServiceHub Gold</Text>
//                             <Text style={styles.membershipSubtitle}>Save 15% on every booking</Text>
//                         </View>
//                     </View>
//                     <Ionicons name="chevron-forward" size={20} color="#FFF" />
//                 </TouchableOpacity>

//                 {/* Quick Stats */}
//                 <View style={styles.statsRow}>
//                     <View style={styles.statBox}>
//                         <Text style={styles.statVal}>12</Text>
//                         <Text style={styles.statLab}>Bookings</Text>
//                     </View>
//                     <View style={[styles.statBox, styles.statBorder]}>
//                         <Text style={styles.statVal}>$1.2k</Text>
//                         <Text style={styles.statLab}>Savings</Text>
//                     </View>
//                     <View style={styles.statBox}>
//                         <Text style={styles.statVal}>150</Text>
//                         <Text style={styles.statLab}>Points</Text>
//                     </View>
//                 </View>

//                 {/* Menu Section */}
//                 <View style={styles.menuWrapper}>
//                     {menuItems.map((item, index) => (
//                         <TouchableOpacity
//                             key={item.id}
//                             style={[styles.menuRow, index === menuItems.length - 1 && { borderBottomWidth: 0 }]}
//                             onPress={() => router.push(item.route)}
//                         >
//                             <View style={styles.menuLeft}>
//                                 <View style={styles.iconCircle}>
//                                     <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
//                                 </View>
//                                 <View>
//                                     <Text style={styles.menuLabel}>{item.title}</Text>
//                                     <Text style={styles.menuSubLabel}>{item.subtitle}</Text>
//                                 </View>
//                             </View>
//                             <Ionicons name="chevron-forward" size={18} color={textSecondaryColor} />
//                         </TouchableOpacity>
//                     ))}
//                 </View>

//                 {/* Logout */}
//                 <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
//                     <Text style={styles.logoutBtnText}>Sign Out</Text>
//                 </TouchableOpacity>

//                 <Text style={styles.versionText}>App Version 2.4.0</Text>
//             </ScrollView>
//         </View>
//     )
// }


"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAppStore } from "@/lib/store"
import { Colors } from "@/constants/Colors"
import { useRouter, Href } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

interface ProfileScreenProps {
    onLogout: () => void
}

const menuItems = [
    { 
        id: "bookings", 
        icon: "calendar", 
        title: "My Bookings", 
        subtitle: "View all your bookings", 
        route: "/bookings" as Href,
        color: "#3B82F6"
    },
    {
        id: "completedTasks",
        icon: "checkmark-done",
        title: "Completed Tasks",
        subtitle: "View your completed services",
        route: "/completed-tasks" as Href,
        color: "#10B981"
    },
    { 
        id: "help", 
        icon: "chatbubble", 
        title: "Help & Support", 
        subtitle: "Get help, contact us", 
        route: "/help" as Href,
        color: "#10B981"
    },
    { 
        id: "about", 
        icon: "information-circle", 
        title: "About", 
        subtitle: "App version, terms, privacy", 
        route: "/about" as Href,
        color: "#F59E0B"
    },
]

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {

    const { user, isAuthenticated, darkMode } = useAppStore()
    const router = useRouter()
    const insets = useSafeAreaInsets()

    const blueColor = "#3B82F6"

    const backgroundColor = darkMode ? '#0A0F1F' : '#F8FAFC'
    const surfaceColor = darkMode ? '#1A1F30' : '#FFFFFF'
    const textColor = darkMode ? '#FFFFFF' : '#0F172A'
    const textSecondaryColor = darkMode ? '#94A3B8' : '#64748B'
    const borderColor = darkMode ? '#2D3348' : '#E2E8F0'

    const styles = StyleSheet.create({

        container:{
            flex:1,
            backgroundColor:backgroundColor
        },

        header:{
            paddingHorizontal:20,
            paddingTop:insets.top+20,
            paddingBottom:20,
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems:'center'
        },

        headerTitle:{
            fontSize:28,
            fontWeight:'700',
            color:textColor
        },

        iconButton:{
            width:44,
            height:44,
            borderRadius:22,
            backgroundColor:surfaceColor,
            justifyContent:'center',
            alignItems:'center'
        },

        coverImage:{
            height:120,
            marginBottom:40
        },

        profileSection:{
            paddingHorizontal:20,
            marginTop:-118,
            marginBottom:24
        },

        profileCard:{
            backgroundColor:surfaceColor,
            borderRadius:28,
            padding:20,
            flexDirection:'row',
            alignItems:'center'
        },

        profileImageWrapper:{
            marginRight:16
        },

        profileImage:{
            width:80,
            height:80,
            borderRadius:40
        },

        profileImagePlaceholder:{
            width:80,
            height:80,
            borderRadius:40,
            backgroundColor:borderColor,
            justifyContent:'center',
            alignItems:'center'
        },

        badgeIcon:{
            position:'absolute',
            bottom:0,
            right:0,
            backgroundColor:blueColor,
            width:28,
            height:28,
            borderRadius:14,
            justifyContent:'center',
            alignItems:'center'
        },

        profileInfo:{
            flex:1
        },

        profileName:{
            fontSize:24,
            fontWeight:'700',
            color:textColor
        },

        profilePhone:{
            fontSize:14,
            color:textSecondaryColor,
            marginBottom:8
        },

        editProfileButton:{
            flexDirection:'row',
            alignItems:'center'
        },

        editProfileText:{
            fontSize:13,
            color:blueColor
        },

        statsGrid:{
            flexDirection:'row',
            paddingHorizontal:20,
            gap:12,
            marginBottom:24
        },

        statCard:{
            flex:1,
            backgroundColor:surfaceColor,
            borderRadius:20,
            padding:16,
            alignItems:'center'
        },

        statValue:{
            fontSize:24,
            fontWeight:'700',
            color:textColor
        },

        statLabel:{
            fontSize:12,
            color:textSecondaryColor
        },

        membershipCard:{
            marginHorizontal:20,
            marginBottom:24,
            borderRadius:24,
            overflow:'hidden'
        },

        membershipGradient:{
            padding:20
        },

        membershipContent:{
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'space-between'
        },

        membershipLeft:{
            flexDirection:'row',
            alignItems:'center',
            gap:16
        },

        membershipIcon:{
            width:56,
            height:56,
            borderRadius:20,
            backgroundColor:'rgba(255,255,255,0.2)',
            justifyContent:'center',
            alignItems:'center'
        },

        membershipTitle:{
            color:'#fff',
            fontSize:18,
            fontWeight:'700'
        },

        membershipSubtitle:{
            color:'rgba(255,255,255,0.8)',
            fontSize:13
        },

        membershipBadge:{
            backgroundColor:'rgba(255,255,255,0.2)',
            paddingHorizontal:12,
            paddingVertical:6,
            borderRadius:20
        },

        membershipBadgeText:{
            color:'#fff'
        },

        menuSection:{
            marginHorizontal:20,
            marginBottom:24,
            backgroundColor:surfaceColor,
            borderRadius:24
        },

        menuItem:{
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems:'center',
            padding:16
        },

        menuItemLeft:{
            flexDirection:'row',
            alignItems:'center',
            gap:12
        },

        menuIcon:{
            width:44,
            height:44,
            borderRadius:14,
            justifyContent:'center',
            alignItems:'center'
        },

        menuTitle:{
            fontSize:16,
            fontWeight:'600',
            color:textColor
        },

        menuSubtitle:{
            fontSize:13,
            color:textSecondaryColor
        },

        logoutButton:{
            marginHorizontal:20,
            marginBottom:20,
            padding:18,
            borderRadius:24,
            backgroundColor:'#FEF2F2',
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center'
        },

        logoutText:{
            color:'#EF4444',
            fontSize:16,
            fontWeight:'600'
        },

        versionText:{
            textAlign:'center',
            color:textSecondaryColor,
            fontSize:12,
            marginBottom:24
        },

        divider:{
            height:1,
            backgroundColor:borderColor,
            marginHorizontal:20,
            marginVertical:8
        }

    })

    return(

        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Account</Text>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={()=>router.push("/settings")}
                >
                    <Ionicons name="settings-outline" size={20} color={textColor}/>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.coverImage}>
                    <LinearGradient
                        colors={['#3B82F6','#60A5FA']}
                        style={{flex:1}}
                    />
                </View>

                <View style={styles.profileSection}>

                    <TouchableOpacity
                        style={styles.profileCard}
                        onPress={()=>router.push("/edit-profile" as Href)}
                    >

                        <View style={styles.profileImageWrapper}>

                            {isAuthenticated && user ? (

                                <Image
                                    source={{uri:"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"}}
                                    style={styles.profileImage}
                                />

                            ) : (

                                <View style={styles.profileImagePlaceholder}>
                                    <Ionicons name="person" size={32} color={textSecondaryColor}/>
                                </View>

                            )}

                            <View style={styles.badgeIcon}>
                                <Ionicons name="camera" size={14} color="#fff"/>
                            </View>

                        </View>

                        <View style={styles.profileInfo}>

                            <Text style={styles.profileName}>
                                {isAuthenticated ? (user?.name || "John Doe") : "Guest User"}
                            </Text>

                            <Text style={styles.profilePhone}>
                                {user?.phone || "+1 (555) 123-4567"}
                            </Text>

                            <View style={styles.editProfileButton}>
                                <Ionicons name="pencil" size={12} color={blueColor}/>
                                <Text style={styles.editProfileText}> Edit Profile</Text>
                            </View>

                        </View>

                        <Ionicons name="chevron-forward" size={20} color={textSecondaryColor}/>

                    </TouchableOpacity>

                </View>

                <View style={styles.statsGrid}>

                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Bookings</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>150</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>$1.2k</Text>
                        <Text style={styles.statLabel}>Savings</Text>
                    </View>

                </View>

                <View style={styles.membershipCard}>

                    <LinearGradient
                        colors={['#3B82F6','#60A5FA','#6ba3e4']}
                        style={styles.membershipGradient}
                    >

                        <TouchableOpacity
                            onPress={()=>router.push('/service-upgrade' as any)}
                        >

                            <View style={styles.membershipContent}>

                                <View style={styles.membershipLeft}>

                                    <View style={styles.membershipIcon}>
                                        <Ionicons name="diamond" size={28} color="#fff"/>
                                    </View>

                                    <View>
                                        <Text style={styles.membershipTitle}>ServiceHub Gold</Text>
                                        <Text style={styles.membershipSubtitle}>Save 15% on every booking</Text>
                                    </View>

                                </View>

                                <View style={styles.membershipBadge}>
                                    <Text style={styles.membershipBadgeText}>ACTIVE</Text>
                                </View>

                            </View>

                        </TouchableOpacity>

                    </LinearGradient>

                </View>

                <View style={styles.menuSection}>

                    {menuItems.map((item,index)=>(
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                index!==menuItems.length-1 && {borderBottomWidth:1,borderBottomColor:borderColor}
                            ]}
                            onPress={()=>router.push(item.route)}
                        >

                            <View style={styles.menuItemLeft}>

                                <View style={[styles.menuIcon,{backgroundColor:`${item.color}15`}]}>
                                    <Ionicons name={item.icon as any} size={20} color={item.color}/>
                                </View>

                                <View>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                                </View>

                            </View>

                            <Ionicons name="chevron-forward" size={18} color={textSecondaryColor}/>

                        </TouchableOpacity>
                    ))}

                </View>

                <View style={styles.divider}/>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout}
                >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444"/>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 2.4.0 • Updated Feb 2024</Text>

            </ScrollView>

        </View>

    )
}