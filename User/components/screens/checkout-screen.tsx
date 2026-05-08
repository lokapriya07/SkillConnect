// import { Colors } from "@/constants/Colors"
// import { useAppStore } from "@/lib/store"
// import { Ionicons } from "@expo/vector-icons"
// import React, { useState } from "react"
// import {
//     ActivityIndicator,
//     Alert,
//     Linking,
//     Platform,
//     ScrollView,
//     StatusBar,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native"

// interface CheckoutScreenProps {
//   onBack: () => void
//   onConfirm: () => void
//   params?: any
// }

// const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]

// const paymentMethods = [
//   { id: "card", name: "Card Payment", icon: "card-outline", description: "Pay using Debit/Credit Card" },
//   { id: "upi", name: "UPI Payment", icon: "phone-portrait-outline", description: "Pay using any UPI app" },
//   { id: "wallet", name: "Digital Wallet", icon: "wallet-outline", description: "Pay using wallets" },
//   { id: "cash", name: "Cash on Service", icon: "cash-outline", description: "Pay when the worker arrives" },
// ]

// const upiApps = [
//   { id: "googlepay", label: "Google Pay", icon: "logo-google" },
//   { id: "phonepe", label: "PhonePe", icon: "phone-portrait-outline" },
//   { id: "paytm", label: "Paytm", icon: "card-outline" },
//   { id: "bhim", label: "BHIM", icon: "qr-code-outline" },
// ]

// const upiAppSchemes: Record<string, (upiId: string, amount: number) => string> = {
//   googlepay: (upiId, amount) => `tez://upi/pay?pa=${upiId}&pn=SkillConnect&am=${amount}&cu=INR`,
//   phonepe: (upiId, amount) => `phonepe://pay?pa=${upiId}&pn=SkillConnect&am=${amount}&cu=INR`,
//   paytm: (upiId, amount) => `paytmmp://pay?pa=${upiId}&pn=SkillConnect&am=${amount}&cu=INR`,
//   bhim: (upiId, amount) => `upi://pay?pa=${upiId}&pn=SkillConnect&am=${amount}&cu=INR`,
// }

// const walletOptions = [
//   { id: "paytm", label: "Paytm Wallet" },
//   { id: "phonepe", label: "PhonePe Wallet" },
//   { id: "amazonpay", label: "Amazon Pay" },
//   { id: "mobikwik", label: "MobiKwik" },
//   { id: "airtel", label: "Airtel Thanks" },
// ]

// export default function CheckoutScreen({ onBack, onConfirm, params }: CheckoutScreenProps) {
//   // 1. Get data from Global Store
//   const { cart, getCartTotal, currentLocation, addBooking, clearCart, activeJobs, clearJobs, darkMode, user } = useAppStore()
  
//   // Extract params for hiring flow  
//   const hirableJobId = params?.jobId || null;
//   const hirableWorkerId = params?.workerId || null;
//   const hirableBidId = params?.bidId || null;
//   const workerName = params?.workerName || "";
//   const workerAmount = params?.amount || "";
  
//   // Determine if this is a hiring flow (requires all three IDs + bidId specifically)
//   const isHiringFlow = !!(hirableJobId && hirableWorkerId && hirableBidId);
  
//   React.useEffect(() => {
//     console.log('[CHECKOUT] Params received:', {
//       jobId: hirableJobId,
//       workerId: hirableWorkerId,
//       bidId: hirableBidId,
//       workerName,
//       amount: workerAmount,
//       isHiringFlow
//     });
//   }, [hirableJobId, hirableWorkerId, hirableBidId, workerName, workerAmount, isHiringFlow]);
  
//   // Get the first/most recent active job for checkout
//   const activeJob = activeJobs[0]

//   const [selectedDate, setSelectedDate] = useState<Date | null>(null)
//   const [selectedTime, setSelectedTime] = useState<string | null>(null)
//   const [selectedPayment, setSelectedPayment] = useState<string>("card")
//   const [selectedUpiApp, setSelectedUpiApp] = useState<string>(upiApps[0].id)
//   const [upiId, setUpiId] = useState<string>("")
//   const [selectedWallet, setSelectedWallet] = useState<string>(walletOptions[0].id)
//   const [cardNumber, setCardNumber] = useState<string>("")
//   const [cardHolder, setCardHolder] = useState<string>("")
//   const [expiry, setExpiry] = useState<string>("")
//   const [cvv, setCvv] = useState<string>("")
//   const [saveCard, setSaveCard] = useState<boolean>(true)
//   const [bidAmount, setBidAmount] = useState(isHiringFlow ? workerAmount : (activeJob?.budget || ""))
//   const [isProcessing, setIsProcessing] = useState(false)

//   const openUpiApp = async (appId: string) => {
//     if (!upiId) {
//       Alert.alert("Enter UPI ID", "Please enter your UPI ID before opening the UPI app.")
//       return
//     }
//     const schemeBuilder = upiAppSchemes[appId]
//     const url = schemeBuilder ? schemeBuilder(upiId, total) : `upi://pay?pa=${upiId}&pn=SkillConnect&am=${total}&cu=INR`
//     try {
//       const canOpen = await Linking.canOpenURL(url)
//       if (canOpen) {
//         await Linking.openURL(url)
//       } else {
//         Alert.alert("App not installed", "The selected UPI app is not available on this device.")
//       }
//     } catch (error) {
//       console.error('UPI redirect failed', error)
//       Alert.alert("Unable to open app", "Please try again or verify your UPI details.")
//     }
//   }

//   const handleSelectUpiApp = async (appId: string) => {
//     setSelectedUpiApp(appId)
//     setSelectedPayment("upi")
//     await openUpiApp(appId)
//   }

//   // Theme colors
//   const backgroundColor = darkMode ? Colors.backgroundDark : Colors.background
//   const surfaceColor = darkMode ? Colors.surfaceDark : Colors.surface
//   const textColor = darkMode ? Colors.textDark : Colors.text
//   const textSecondaryColor = darkMode ? Colors.textSecondaryDark : Colors.textSecondary
//   const borderColor = darkMode ? Colors.borderDark : Colors.border
//   const surfaceVariantColor = darkMode ? Colors.gray[800] : Colors.gray[100]
//   const primaryLightColor = darkMode ? "#1E3A5F" : "#E3F2FD"

//   // DEBUG: Log cart contents
//   React.useEffect(() => {
//     console.log('[CHECKOUT] Current cart items:', cart.map(item => ({ name: item.service.name, category: item.service.category })));
//   }, [cart]);

//   // --- DYNAMIC PRICING LOGIC ---
//   // Check if we are checking out a Bid from CreateRequestScreen or a standard Service
//   const isBidFlow = !!activeJob?.budget && !!bidAmount
//   const subtotal = isBidFlow ? parseFloat(bidAmount) || 0 : getCartTotal()

//   const discount = 50
//   const tax = Math.round(subtotal * 0.18)
//   const total = subtotal - discount + tax

//   // --- HELPERS ---
//   const getNextDays = () => {
//     const days = []
//     for (let i = 0; i < 7; i++) {
//       const date = new Date()
//       date.setDate(date.getDate() + i)
//       days.push(date)
//     }
//     return days
//   }

//   const formatDate = (date: Date) => {
//     const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
//     return {
//       day: days[date.getDay()],
//       date: date.getDate(),
//       month: date.toLocaleString("default", { month: "short" }),
//     }
//   }

//   const handleConfirmBooking = async () => {
//     if (selectedDate && selectedTime) {
//       if (selectedPayment === "upi" && !upiId) {
//         Alert.alert("UPI ID required", "Please enter your UPI ID before confirming the booking.")
//         return
//       }
//       setIsProcessing(true);
//       try {
//         if (isHiringFlow) {
//           // HIRING FLOW: Call the hire API endpoint
//           const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
          
//           // Get current user ID
//           const hirerId = user?._id || user?.id;
          
//           // Validate all required IDs before making API call
//           if (!hirableBidId) {
//             throw new Error('Missing Bid ID - cannot proceed with hiring');
//           }
//           if (!hirerId) {
//             throw new Error('User not logged in - cannot identify hirer');
//           }

//           const hireUrl = `${API_BASE_URL}/api/bids/${hirableBidId}/hire`;
//           console.log('[HIRE API] Calling:', hireUrl, {
//             jobId: hirableJobId,
//             workerId: hirableWorkerId,
//             hirerId: hirerId,
//             bidAmount: parseFloat(workerAmount || "0"),
//             scheduledDate: selectedDate.toDateString(),
//             scheduledTime: selectedTime
//           });

//           const hireResponse = await fetch(hireUrl, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//               jobId: hirableJobId,
//               workerId: hirableWorkerId,
//               hirerId: hirerId,
//               bidAmount: parseFloat(workerAmount || "0"),
//               scheduledDate: selectedDate.toDateString(),
//               scheduledTime: selectedTime,
//               paymentMethod: paymentMethods.find(p => p.id === selectedPayment)?.name || "Cash on Service",
//             })
//           });

//           const hireData = await hireResponse.json();
          
//           console.log('[HIRE API] Response:', hireResponse.status, hireData);

//           if (!hireResponse.ok || !hireData.success) {
//             // @ts-ignore
//             throw new Error(hireData.message || `Failed to hire worker (${hireResponse.status})`);
//           }

//           // Success - proceed to confirmation
//           // Note: The worker notification is sent by the backend
//           clearCart();
//           clearJobs();
//           onConfirm();
//         } else {
//           // REGULAR BOOKING FLOW
//           // Determine if this is truly a bid/custom-request flow.
//           // IMPORTANT: Only treat as bid flow if the cart is EMPTY (no predefined service selected).
//           // If the cart has items, the user booked a predefined service — always use cart data,
//           // never the uploaded job description, even if an active job exists with a budget.
//           const hasBidAmount = cart.length === 0 && bidAmount && bidAmount !== "" && parseFloat(bidAmount) > 0;
          
//           // Helper: clean up description names (remove repeated "service booking" text)
//           const cleanName = (desc: string | undefined): string => {
//             if (!desc) return "";
//             return desc.replace(/\s*service\s+booking.*$/gi, "").trim();
//           };
          
//           // Get payment method name from ID
//           const paymentMethodName = paymentMethods.find(p => p.id === selectedPayment)?.name || "Cash on Service";
          
//           // Extract service category from cart or active job
//           const serviceCategory = hasBidAmount 
//             ? 'custom'
//             : (cart[0]?.service?.category || cart[0]?.service?.name?.toLowerCase() || 'general');
          
//           // ENSURE ONLY THE CORRECT SERVICE IS BOOKED
//           // Use ONLY the first cart item (most recent service selected)
//           const correctBookingItems = hasBidAmount && activeJob?.description
//               ? [
//                   {
//                     service: {
//                       id: "bid-" + Date.now(),
//                       name: cleanName(activeJob?.description) || "Custom Service Request",
//                       description: cleanName(activeJob?.description) || "",
//                       price: subtotal,
//                       duration: "N/A",
//                       image: "",
//                       rating: 0,
//                       reviews: 0,
//                       category: "Bid",
//                     },
//                     quantity: 1,
//                   },
//                 ]
//               : cart.slice(0, 1).map(item => ({
//                   ...item,
//                   service: {
//                     ...item.service,
//                     name: item.service.name || item.service.category || "Service",
//                   }
//                 }));

//           console.log('[CHECKOUT] Creating booking with items:', correctBookingItems.map(i => ({ name: i.service.name, id: i.service.id })));

//           const newBooking = {
//             id: Math.random().toString(36).substr(2, 9),
//             userId: user?._id || user?.id || '', // Add userId to associate booking with user
//             items: correctBookingItems,
//             total: total,
//             status: "confirmed" as const,
//             date: selectedDate.toDateString(),
//             time: selectedTime,
//             address: currentLocation?.address || "Default Address",
//             paymentMethod: paymentMethodName,
//             serviceCategory: serviceCategory, // Store category for worker matching
//           }

//           addBooking(newBooking)
//           clearCart()
//           clearJobs() // Clear active jobs to prevent old job data from interfering with future bookings
//           onConfirm()
//         }
//       } catch (error) {
//         console.error('Booking/Hiring error:', error);
//         // @ts-ignore
//         const errorMessage = error.message || 'Failed to complete the booking';
//         // Check if it's a "job already assigned" error
//         if (errorMessage.includes('already been assigned') || errorMessage.includes('already hired')) {
//           alert('This job is no longer available. Another worker may have been hired.');
//         } else {
//           alert('Error: ' + errorMessage);
//         }
//       } finally {
//         setIsProcessing(false);
//       }
//     }
//   }

//   // Dynamic styles
//   const getStyles = () => StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: backgroundColor,
//     },
//     header: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       paddingHorizontal: 16,
//       paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 50,
//       paddingBottom: 16,
//       backgroundColor: surfaceColor,
//       borderBottomWidth: 1,
//       borderBottomColor: borderColor,
//     },
//     backButton: {
//       width: 40,
//       height: 40,
//       borderRadius: 20,
//       backgroundColor: surfaceVariantColor,
//       alignItems: "center",
//       justifyContent: "center",
//     },
//     headerTitle: {
//       fontSize: 18,
//       fontWeight: "600",
//       color: textColor,
//     },
//     content: {
//       flex: 1,
//     },
//     section: {
//       backgroundColor: surfaceColor,
//       marginTop: 8,
//       padding: 16,
//     },
//     sectionHeader: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       marginBottom: 12,
//     },
//     sectionTitle: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: textColor,
//       marginBottom: 12,
//     },
//     changeText: {
//       fontSize: 14,
//       color: Colors.primary,
//       fontWeight: "500",
//     },
//     addressCard: {
//       flexDirection: "row",
//       alignItems: "center",
//       padding: 12,
//       backgroundColor: primaryLightColor,
//       borderRadius: 12,
//       borderWidth: 1,
//       borderColor: Colors.primary,
//     },
//     addressIcon: {
//       width: 44,
//       height: 44,
//       borderRadius: 22,
//       backgroundColor: surfaceColor,
//       alignItems: "center",
//       justifyContent: "center",
//       marginRight: 12,
//     },
//     addressDetails: {
//       flex: 1,
//     },
//     addressType: {
//       fontSize: 14,
//       fontWeight: "600",
//       color: textColor,
//       marginBottom: 2,
//     },
//     addressText: {
//       fontSize: 13,
//       color: textSecondaryColor,
//       lineHeight: 18,
//     },
//     dateScroll: {
//       marginHorizontal: -16,
//       paddingHorizontal: 16,
//     },
//     dateCard: {
//       width: 70,
//       padding: 12,
//       borderRadius: 12,
//       backgroundColor: surfaceVariantColor,
//       alignItems: "center",
//       marginRight: 10,
//       borderWidth: 1,
//       borderColor: borderColor,
//     },
//     dateCardSelected: {
//       backgroundColor: Colors.primary,
//       borderColor: Colors.primary,
//     },
//     dateDay: {
//       fontSize: 12,
//       color: textSecondaryColor,
//       marginBottom: 4,
//     },
//     dateNumber: {
//       fontSize: 20,
//       fontWeight: "700",
//       color: textColor,
//       marginBottom: 2,
//     },
//     dateMonth: {
//       fontSize: 12,
//       color: textSecondaryColor,
//     },
//     dateTextSelected: {
//       color: Colors.white,
//     },
//     timeGrid: {
//       flexDirection: "row",
//       flexWrap: "wrap",
//       marginHorizontal: -5,
//     },
//     timeSlot: {
//       width: "23%",
//       margin: "1%",
//       paddingVertical: 12,
//       borderRadius: 8,
//       backgroundColor: surfaceVariantColor,
//       alignItems: "center",
//       borderWidth: 1,
//       borderColor: borderColor,
//     },
//     timeSlotSelected: {
//       backgroundColor: Colors.primary,
//       borderColor: Colors.primary,
//     },
//     timeText: {
//       fontSize: 12,
//       color: textColor,
//       fontWeight: "500",
//     },
//     timeTextSelected: {
//       color: Colors.white,
//     },
//     paymentCard: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       padding: 14,
//       backgroundColor: surfaceVariantColor,
//       borderRadius: 12,
//       marginBottom: 10,
//       borderWidth: 1,
//       borderColor: borderColor,
//     },
//     paymentCardSelected: {
//       borderColor: Colors.primary,
//       backgroundColor: primaryLightColor,
//     },
//     paymentLeft: {
//       flexDirection: "row",
//       alignItems: "center",
//     },
//     paymentIcon: {
//       width: 40,
//       height: 40,
//       borderRadius: 20,
//       backgroundColor: surfaceColor,
//       alignItems: "center",
//       justifyContent: "center",
//       marginRight: 12,
//     },
//     paymentIconSelected: {
//       backgroundColor: Colors.primary,
//     },
//     paymentName: {
//       fontSize: 14,
//       fontWeight: "500",
//       color: textColor,
//     },
//     radioOuter: {
//       width: 22,
//       height: 22,
//       borderRadius: 11,
//       borderWidth: 2,
//       borderColor: darkMode ? Colors.gray[600] : "#CCC",
//       alignItems: "center",
//       justifyContent: "center",
//     },
//     radioOuterSelected: {
//       borderColor: Colors.primary,
//     },
//     radioInner: {
//       width: 12,
//       height: 12,
//       borderRadius: 6,
//       backgroundColor: Colors.primary,
//     },
//     summaryCard: {
//       backgroundColor: surfaceVariantColor,
//       borderRadius: 12,
//       padding: 16,
//       borderWidth: 1,
//       borderColor: borderColor,
//     },
//     summaryItem: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       marginBottom: 12,
//     },
//     summaryItemName: {
//       fontSize: 14,
//       color: textSecondaryColor,
//     },
//     summaryItemPrice: {
//       fontSize: 14,
//       fontWeight: "600",
//       color: textColor,
//     },
//     summaryRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       marginBottom: 8,
//     },
//     summaryLabel: {
//       fontSize: 14,
//       color: textSecondaryColor,
//     },
//     summaryValue: {
//       fontSize: 14,
//       color: textColor,
//       fontWeight: "500",
//     },
//     totalLabel: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: textColor,
//     },
//     totalValue: {
//       fontSize: 20,
//       fontWeight: "bold",
//       color: Colors.primary,
//     },
//     divider: {
//       height: 1,
//       backgroundColor: borderColor,
//       marginVertical: 12,
//     },
//     bidAmountContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//     },
//     currencySymbol: {
//       fontSize: 16,
//       fontWeight: "600",
//       color: textColor,
//     },
//     bidAmountInput: {
//       flex: 1,
//       fontSize: 16,
//       fontWeight: "600",
//       color: textColor,
//       padding: 4,
//     },
//     bidAdjustmentNote: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginTop: 8,
//       padding: 8,
//       backgroundColor: darkMode ? "#3D2A1A" : "#FFF3E0",
//       borderRadius: 8,
//     },
//     bidAdjustmentText: {
//       fontSize: 12,
//       color: "#FF9800",
//       marginLeft: 4,
//     },
//     paymentDescription: {
//       fontSize: 12,
//       color: textSecondaryColor,
//       marginTop: 2,
//     },
//     paymentDetailsCard: {
//       marginTop: 14,
//       padding: 16,
//       borderRadius: 12,
//       backgroundColor: surfaceVariantColor,
//       borderWidth: 1,
//       borderColor: borderColor,
//     },
//     paymentDetailTitle: {
//       fontSize: 15,
//       fontWeight: "600",
//       color: textColor,
//       marginBottom: 10,
//     },
//     paymentDetailSubtitle: {
//       fontSize: 13,
//       color: textSecondaryColor,
//       marginBottom: 10,
//     },
//     inputField: {
//       width: "100%",
//       backgroundColor: surfaceColor,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: borderColor,
//       color: textColor,
//       paddingHorizontal: 14,
//       paddingVertical: 12,
//       marginBottom: 12,
//     },
//     smallInputRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//     },
//     smallInput: {
//       width: "48%",
//     },
//     toggleRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginTop: 8,
//     },
//     optionRow: {
//       flexDirection: "row",
//       flexWrap: "wrap",
//     },
//     optionButton: {
//       paddingVertical: 10,
//       paddingHorizontal: 14,
//       borderRadius: 12,
//       backgroundColor: surfaceColor,
//       borderWidth: 1,
//       borderColor: borderColor,
//       marginRight: 10,
//       marginBottom: 10,
//     },
//     optionButtonSelected: {
//       backgroundColor: Colors.primary,
//       borderColor: Colors.primary,
//     },
//     optionIconLabel: {
//       flexDirection: "row",
//       alignItems: "center",
//     },
//     optionLabel: {
//       fontSize: 13,
//       color: textColor,
//       marginLeft: 8,
//     },
//     optionLabelSelected: {
//       color: Colors.white,
//     },
//     helpNote: {
//       fontSize: 12,
//       color: textSecondaryColor,
//       marginTop: 8,
//     },
//     walletOption: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       paddingVertical: 12,
//       paddingHorizontal: 12,
//       borderRadius: 12,
//       borderWidth: 1,
//       borderColor: borderColor,
//       marginBottom: 8,
//       backgroundColor: surfaceColor,
//     },
//     walletOptionSelected: {
//       borderColor: Colors.primary,
//       backgroundColor: primaryLightColor,
//     },
//     bottomBar: {
//       flexDirection: "row",
//       alignItems: "center",
//       padding: 16,
//       backgroundColor: surfaceColor,
//       borderTopWidth: 1,
//       borderTopColor: borderColor,
//       paddingBottom: Platform.OS === "ios" ? 24 : 16,
//     },
//     totalContainer: {
//       marginRight: 16,
//     },
//     bottomTotalLabel: {
//       fontSize: 12,
//       color: textSecondaryColor,
//     },
//     bottomTotalValue: {
//       fontSize: 20,
//       fontWeight: "bold",
//       color: textColor,
//     },
//     confirmButton: {
//       flex: 1,
//       backgroundColor: Colors.primary,
//       paddingVertical: 14,
//       borderRadius: 12,
//       alignItems: "center",
//     },
//     confirmButtonDisabled: {
//       backgroundColor: Colors.gray[400],
//     },
//     confirmButtonText: {
//       color: Colors.white,
//       fontSize: 16,
//       fontWeight: "600",
//     },
//   })

//   const styles = getStyles()

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={onBack} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color={textColor} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Checkout</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Debug Info for Hiring Flow */}
//         {isHiringFlow && (
//           <View style={{ 
//             backgroundColor: '#E3F2FD', 
//             padding: 12, 
//             marginBottom: 12,
//             marginHorizontal: 16,
//             marginTop: 8,
//             borderRadius: 8,
//             borderLeftWidth: 4,
//             borderLeftColor: Colors.primary
//           }}>
//             <Text style={{ fontSize: 12, color: '#1565C0', fontWeight: '600', marginBottom: 4 }}>Hiring Mode: Active</Text>
//             <Text style={{ fontSize: 11, color: '#0D47A1', marginBottom: 2 }}>Bid ID: {hirableBidId}</Text>
//             <Text style={{ fontSize: 11, color: '#0D47A1', marginBottom: 2 }}>Job ID: {hirableJobId}</Text>
//             <Text style={{ fontSize: 11, color: '#0D47A1' }}>Worker: {workerName} (₹{workerAmount})</Text>
//           </View>
//         )}

//         {!isHiringFlow && (
//           <View style={{ 
//             backgroundColor: '#FFF3E0', 
//             padding: 12, 
//             marginBottom: 12,
//             marginHorizontal: 16,
//             marginTop: 8,
//             borderRadius: 8,
//             borderLeftWidth: 4,
//             borderLeftColor: '#FF9800'
//           }}>
//             <Text style={{ fontSize: 12, color: '#E65100', fontWeight: '600' }}>Regular Booking Mode</Text>
//           </View>
//         )}

//         {/* Address Section */}
//         <View style={styles.section}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Service Address</Text>
//             <TouchableOpacity>
//               <Text style={styles.changeText}>Change</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.addressCard}>
//             <View style={styles.addressIcon}>
//               <Ionicons name="location" size={24} color={Colors.primary} />
//             </View>
//             <View style={styles.addressDetails}>
//               <Text style={styles.addressType}>Home</Text>
//               <Text style={styles.addressText}>
//                 {currentLocation?.address || "123 Main Street, Apt 4B, New York, NY"}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Date Selection */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Select Date</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
//             {getNextDays().map((date, index) => {
//               const formatted = formatDate(date)
//               const isSelected = selectedDate?.toDateString() === date.toDateString()
//               return (
//                 <TouchableOpacity
//                   key={index}
//                   style={[styles.dateCard, isSelected && styles.dateCardSelected]}
//                   onPress={() => setSelectedDate(date)}
//                 >
//                   <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>{formatted.day}</Text>
//                   <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>{formatted.date}</Text>
//                   <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>{formatted.month}</Text>
//                 </TouchableOpacity>
//               )
//             })}
//           </ScrollView>
//         </View>

//         {/* Time Selection */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Select Time Slot</Text>
//           <View style={styles.timeGrid}>
//             {timeSlots.map((time) => {
//               const isSelected = selectedTime === time
//               return (
//                 <TouchableOpacity
//                   key={time}
//                   style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
//                   onPress={() => setSelectedTime(time)}
//                 >
//                   <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>{time}</Text>
//                 </TouchableOpacity>
//               )
//             })}
//           </View>
//         </View>

//         {/* Payment Method */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Payment Method</Text>
//           {paymentMethods.map((method) => {
//             const isSelected = selectedPayment === method.id
//             return (
//               <TouchableOpacity
//                 key={method.id}
//                 style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
//                 onPress={() => setSelectedPayment(method.id)}
//               >
//                 <View style={styles.paymentLeft}>
//                   <View style={[styles.paymentIcon, isSelected && styles.paymentIconSelected]}>
//                     <Ionicons
//                       name={method.icon as any}
//                       size={20}
//                       color={isSelected ? "white" : Colors.primary}
//                     />
//                   </View>
//                   <View>
//                     <Text style={styles.paymentName}>{method.name}</Text>
//                     <Text style={styles.paymentDescription}>{method.description}</Text>
//                   </View>
//                 </View>
//                 <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
//                   {isSelected && <View style={styles.radioInner} />}
//                 </View>
//               </TouchableOpacity>
//             )
//           })}

//           {/* Dynamic Payment Details */}
//           {selectedPayment === "card" && (
//             <View style={styles.paymentDetailsCard}>
//               <Text style={styles.paymentDetailTitle}>Card Details</Text>
//               <TextInput
//                 style={styles.inputField}
//                 value={cardNumber}
//                 onChangeText={setCardNumber}
//                 placeholder="Card Number"
//                 placeholderTextColor={textSecondaryColor}
//                 keyboardType="numeric"
//                 maxLength={19}
//               />
//               <TextInput
//                 style={styles.inputField}
//                 value={cardHolder}
//                 onChangeText={setCardHolder}
//                 placeholder="Cardholder Name"
//                 placeholderTextColor={textSecondaryColor}
//               />
//               <View style={styles.smallInputRow}>
//                 <TextInput
//                   style={[styles.inputField, styles.smallInput]}
//                   value={expiry}
//                   onChangeText={setExpiry}
//                   placeholder="MM/YY"
//                   placeholderTextColor={textSecondaryColor}
//                   keyboardType="numeric"
//                   maxLength={5}
//                 />
//                 <TextInput
//                   style={[styles.inputField, styles.smallInput]}
//                   value={cvv}
//                   onChangeText={setCvv}
//                   placeholder="CVV"
//                   placeholderTextColor={textSecondaryColor}
//                   keyboardType="numeric"
//                   secureTextEntry
//                   maxLength={4}
//                 />
//               </View>
//               <TouchableOpacity
//                 style={styles.toggleRow}
//                 activeOpacity={0.8}
//                 onPress={() => setSaveCard(!saveCard)}
//               >
//                 <View style={[styles.radioOuter, saveCard && styles.radioOuterSelected]}>
//                   {saveCard && <View style={styles.radioInner} />}
//                 </View>
//                 <Text style={styles.paymentDescription}>Save card for future payments</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {selectedPayment === "upi" && (
//             <View style={styles.paymentDetailsCard}>
//               <Text style={styles.paymentDetailTitle}>UPI Details</Text>
//               <TextInput
//                 style={styles.inputField}
//                 value={upiId}
//                 onChangeText={setUpiId}
//                 placeholder="Enter UPI ID"
//                 placeholderTextColor={textSecondaryColor}
//                 autoCapitalize="none"
//               />
//               <Text style={styles.paymentDetailSubtitle}>Select UPI App</Text>
//               <View style={styles.optionRow}>
//                 {upiApps.map((app) => {
//                   const selected = selectedUpiApp === app.id
//                   return (
//                     <TouchableOpacity
//                       key={app.id}
//                       style={[styles.optionButton, selected && styles.optionButtonSelected]}
//                       onPress={() => handleSelectUpiApp(app.id)}
//                     >
//                       <View style={styles.optionIconLabel}>
//                         <View style={[styles.paymentIcon, selected && styles.paymentIconSelected]}>
//                           <Ionicons
//                             name={app.icon as any}
//                             size={18}
//                             color={selected ? "white" : Colors.primary}
//                           />
//                         </View>
//                         <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{app.label}</Text>
//                       </View>
//                     </TouchableOpacity>
//                   )
//                 })}
//               </View>
//               <Text style={styles.helpNote}>Tap an app to open it for payment once your UPI ID is entered.</Text>
//             </View>
//           )}

//           {selectedPayment === "wallet" && (
//             <View style={styles.paymentDetailsCard}>
//               <Text style={styles.paymentDetailTitle}>Select Wallet</Text>
//               {walletOptions.map((wallet) => {
//                 const selected = selectedWallet === wallet.id
//                 return (
//                   <TouchableOpacity
//                     key={wallet.id}
//                     style={[styles.walletOption, selected && styles.walletOptionSelected]}
//                     onPress={() => setSelectedWallet(wallet.id)}
//                   >
//                     <View style={styles.paymentLeft}>
//                       <View style={[styles.paymentIcon, selected && styles.paymentIconSelected]}>
//                         <Ionicons
//                           name="wallet-outline"
//                           size={18}
//                           color={selected ? "white" : Colors.primary}
//                         />
//                       </View>
//                       <Text style={styles.paymentName}>{wallet.label}</Text>
//                     </View>
//                     <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
//                       {selected && <View style={styles.radioInner} />}
//                     </View>
//                   </TouchableOpacity>
//                 )
//               })}
//               <Text style={styles.helpNote}>You will be redirected to the wallet app to complete the payment.</Text>
//             </View>
//           )}

//           {selectedPayment === "cash" && (
//             <View style={styles.paymentDetailsCard}>
//               <Text style={styles.paymentDetailTitle}>Cash on Service</Text>
//               <Text style={styles.paymentDescription}>Pay with cash when the worker arrives. Please keep exact change ready for a smooth delivery.</Text>
//             </View>
//           )}
//         </View>

//         {/* Order Summary */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Order Summary</Text>
//           <View style={styles.summaryCard}>
//             {isBidFlow ? (
//               <>
//                 <View style={styles.summaryItem}>
//                   <Text style={styles.summaryItemName}>Worker Bid (Agreed)</Text>
//                   <View style={styles.bidAmountContainer}>
//                     <Text style={styles.currencySymbol}>Rs. </Text>
//                     <TextInput
//                       style={styles.bidAmountInput}
//                       value={bidAmount}
//                       onChangeText={setBidAmount}
//                       keyboardType="numeric"
//                       placeholder="0"
//                       placeholderTextColor={textSecondaryColor}
//                     />
//                   </View>
//                 </View>
//                 {bidAmount !== activeJob?.budget && (
//                   <View style={styles.bidAdjustmentNote}>
//                     <Ionicons name="information-circle-outline" size={14} color="#FF9800" />
//                     <Text style={styles.bidAdjustmentText}>Price adjusted from agreed amount</Text>
//                   </View>
//                 )}
//               </>
//             ) : (
//               cart.map((item) => (
//                 <View key={item.service.id} style={styles.summaryItem}>
//                   <Text style={styles.summaryItemName}>
//                     {item.service.name} x{item.quantity}
//                   </Text>
//                   <Text style={styles.summaryItemPrice}>Rs. {item.service.price * item.quantity}</Text>
//                 </View>
//               ))
//             )}
//             <View style={styles.divider} />
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Subtotal</Text>
//               <Text style={styles.summaryValue}>Rs. {subtotal}</Text>
//             </View>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Discount</Text>
//               <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>-Rs. {discount}</Text>
//             </View>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Tax (18%)</Text>
//               <Text style={styles.summaryValue}>Rs. {tax}</Text>
//             </View>
//             <View style={styles.divider} />
//             <View style={styles.summaryRow}>
//               <Text style={styles.totalLabel}>Total</Text>
//               <Text style={styles.totalValue}>Rs. {total}</Text>
//             </View>
//           </View>
//         </View>

//         <View style={{ height: 100 }} />
//       </ScrollView>

//       {/* Bottom Bar */}
//       <View style={styles.bottomBar}>
//         <View style={styles.totalContainer}>
//           <Text style={styles.bottomTotalLabel}>Total Amount</Text>
//           <Text style={styles.bottomTotalValue}>Rs. {total}</Text>
//         </View>
//         <TouchableOpacity
//           style={[styles.confirmButton, ((!selectedDate || !selectedTime) || isProcessing) && styles.confirmButtonDisabled]}
//           onPress={handleConfirmBooking}
//           disabled={!selectedDate || !selectedTime || isProcessing}
//         >
//           {isProcessing ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.confirmButtonText}>Confirm Booking</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   )
// }
import { Colors } from "@/constants/Colors"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

const { width } = Dimensions.get("window")

interface CheckoutScreenProps {
  onBack: () => void
  onConfirm: () => void
  params?: any
}

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: "card-outline" },
  { id: "upi", name: "UPI Payment", icon: "phone-portrait-outline" },
  { id: "wallet", name: "Digital Wallet", icon: "wallet-outline" },
  { id: "cash", name: "Cash on Service", icon: "cash-outline" },
]

export default function CheckoutScreen({ onBack, onConfirm, params }: CheckoutScreenProps) {
  // 1. Get data from Global Store
  const { cart, getCartTotal, currentLocation, addBooking, clearCart, activeJobs, clearJobs, darkMode, user } = useAppStore()
  
  // Extract params for hiring flow  
  const hirableJobId = params?.jobId || null;
  const hirableWorkerId = params?.workerId || null;
  const hirableBidId = params?.bidId || null;
  const workerName = params?.workerName || "";
  const workerAmount = params?.amount || "";
  
  // Determine if this is a hiring flow (requires all three IDs + bidId specifically)
  const isHiringFlow = !!(hirableJobId && hirableWorkerId && hirableBidId);
  
  // Debug logging
  const [debugInfo] = React.useState(() => {
    console.log('[CHECKOUT] Params received:', {
      jobId: hirableJobId,
      workerId: hirableWorkerId,
      bidId: hirableBidId,
      workerName,
      amount: workerAmount,
      isHiringFlow
    });
    return null;
  });
  
  // Get the first/most recent active job for checkout
  const activeJob = activeJobs[0]

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>("card")
  const [bidAmount, setBidAmount] = useState(isHiringFlow ? workerAmount : (activeJob?.budget || ""))
  const [isProcessing, setIsProcessing] = useState(false)

  // Theme colors
  const backgroundColor = darkMode ? Colors.backgroundDark : Colors.background
  const surfaceColor = darkMode ? Colors.surfaceDark : Colors.surface
  const textColor = darkMode ? Colors.textDark : Colors.text
  const textSecondaryColor = darkMode ? Colors.textSecondaryDark : Colors.textSecondary
  const borderColor = darkMode ? Colors.borderDark : Colors.border
  const surfaceVariantColor = darkMode ? Colors.gray[800] : Colors.gray[100]
  const primaryLightColor = darkMode ? "#1E3A5F" : "#E3F2FD"

  // DEBUG: Log cart contents
  React.useEffect(() => {
    console.log('[CHECKOUT] Current cart items:', cart.map(item => ({ name: item.service.name, category: item.service.category })));
  }, [cart]);

  // --- DYNAMIC PRICING LOGIC ---
  // Check if we are checking out a Bid from CreateRequestScreen or a standard Service
  const isBidFlow = !!activeJob?.budget && !!bidAmount
  const subtotal = isBidFlow ? parseFloat(bidAmount) || 0 : getCartTotal()

  const discount = 50
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal - discount + tax

  // --- HELPERS ---
  const getNextDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const formatDate = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
    }
  }

  const handleConfirmBooking = async () => {
    if (selectedDate && selectedTime) {
      setIsProcessing(true);
      try {
        if (isHiringFlow) {
          // HIRING FLOW: Call the hire API endpoint
          const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
          
          // Get current user ID
          const hirerId = user?._id || user?.id;
          
          // Validate all required IDs before making API call
          if (!hirableBidId) {
            throw new Error('Missing Bid ID - cannot proceed with hiring');
          }
          if (!hirerId) {
            throw new Error('User not logged in - cannot identify hirer');
          }

          const hireUrl = `${API_BASE_URL}/api/bids/${hirableBidId}/hire`;
          console.log('[HIRE API] Calling:', hireUrl, {
            jobId: hirableJobId,
            workerId: hirableWorkerId,
            hirerId: hirerId,
            bidAmount: parseFloat(workerAmount || "0"),
            scheduledDate: selectedDate.toDateString(),
            scheduledTime: selectedTime
          });

          const hireResponse = await fetch(hireUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jobId: hirableJobId,
              workerId: hirableWorkerId,
              hirerId: hirerId,
              bidAmount: parseFloat(workerAmount || "0"),
              scheduledDate: selectedDate.toDateString(),
              scheduledTime: selectedTime,
              paymentMethod: paymentMethods.find(p => p.id === selectedPayment)?.name || "Cash on Service",
            })
          });

          const hireData = await hireResponse.json();
          
          console.log('[HIRE API] Response:', hireResponse.status, hireData);

          if (!hireResponse.ok || !hireData.success) {
            // @ts-ignore
            throw new Error(hireData.message || `Failed to hire worker (${hireResponse.status})`);
          }

          // Success - proceed to confirmation
          // Note: The worker notification is sent by the backend
          clearCart();
          clearJobs();
          onConfirm();
        } else {
          // REGULAR BOOKING FLOW
          // Determine if this is truly a bid/custom-request flow.
          // IMPORTANT: Only treat as bid flow if the cart is EMPTY (no predefined service selected).
          // If the cart has items, the user booked a predefined service — always use cart data,
          // never the uploaded job description, even if an active job exists with a budget.
          const hasBidAmount = cart.length === 0 && bidAmount && bidAmount !== "" && parseFloat(bidAmount) > 0;
          
          // Helper: clean up description names (remove repeated "service booking" text)
          const cleanName = (desc: string | undefined): string => {
            if (!desc) return "";
            return desc.replace(/\s*service\s+booking.*$/gi, "").trim();
          };
          
          // Get payment method name from ID
          const paymentMethodName = paymentMethods.find(p => p.id === selectedPayment)?.name || "Cash on Service";
          
          // Extract service category from cart or active job
          const serviceCategory = hasBidAmount 
            ? 'custom'
            : (cart[0]?.service?.category || cart[0]?.service?.name?.toLowerCase() || 'general');
          
          // ENSURE ONLY THE CORRECT SERVICE IS BOOKED
          // Use ONLY the first cart item (most recent service selected)
          const correctBookingItems = hasBidAmount && activeJob?.description
              ? [
                  {
                    service: {
                      id: "bid-" + Date.now(),
                      name: cleanName(activeJob?.description) || "Custom Service Request",
                      description: cleanName(activeJob?.description) || "",
                      price: subtotal,
                      duration: "N/A",
                      image: "",
                      rating: 0,
                      reviews: 0,
                      category: "Bid",
                    },
                    quantity: 1,
                  },
                ]
              : cart.slice(0, 1).map(item => ({
                  ...item,
                  service: {
                    ...item.service,
                    name: item.service.name || item.service.category || "Service",
                  }
                }));

          console.log('[CHECKOUT] Creating booking with items:', correctBookingItems.map(i => ({ name: i.service.name, id: i.service.id })));

          const newBooking = {
            id: Math.random().toString(36).substr(2, 9),
            userId: user?._id || user?.id || '', // Add userId to associate booking with user
            items: correctBookingItems,
            total: total,
            status: "confirmed" as const,
            date: selectedDate.toDateString(),
            time: selectedTime,
            address: currentLocation?.address || "Default Address",
            paymentMethod: paymentMethodName,
            serviceCategory: serviceCategory, // Store category for worker matching
          }

          addBooking(newBooking)
          clearCart()
          clearJobs() // Clear active jobs to prevent old job data from interfering with future bookings
          onConfirm()
        }
      } catch (error) {
        console.error('Booking/Hiring error:', error);
        // @ts-ignore
        const errorMessage = error.message || 'Failed to complete the booking';
        // Check if it's a "job already assigned" error
        if (errorMessage.includes('already been assigned') || errorMessage.includes('already hired')) {
          alert('This job is no longer available. Another worker may have been hired.');
        } else {
          alert('Error: ' + errorMessage);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  }

  // Dynamic styles
  const getStyles = () => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 50,
      paddingBottom: 16,
      backgroundColor: surfaceColor,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: surfaceVariantColor,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: textColor,
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: surfaceColor,
      marginTop: 8,
      padding: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: textColor,
      marginBottom: 12,
    },
    changeText: {
      fontSize: 14,
      color: Colors.primary,
      fontWeight: "500",
    },
    addressCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      backgroundColor: primaryLightColor,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.primary,
    },
    addressIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: surfaceColor,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    addressDetails: {
      flex: 1,
    },
    addressType: {
      fontSize: 14,
      fontWeight: "600",
      color: textColor,
      marginBottom: 2,
    },
    addressText: {
      fontSize: 13,
      color: textSecondaryColor,
      lineHeight: 18,
    },
    dateScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },
    dateCard: {
      width: 70,
      padding: 12,
      borderRadius: 12,
      backgroundColor: surfaceVariantColor,
      alignItems: "center",
      marginRight: 10,
      borderWidth: 1,
      borderColor: borderColor,
    },
    dateCardSelected: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    dateDay: {
      fontSize: 12,
      color: textSecondaryColor,
      marginBottom: 4,
    },
    dateNumber: {
      fontSize: 20,
      fontWeight: "700",
      color: textColor,
      marginBottom: 2,
    },
    dateMonth: {
      fontSize: 12,
      color: textSecondaryColor,
    },
    dateTextSelected: {
      color: Colors.white,
    },
    timeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -5,
    },
    timeSlot: {
      width: "23%",
      margin: "1%",
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: surfaceVariantColor,
      alignItems: "center",
      borderWidth: 1,
      borderColor: borderColor,
    },
    timeSlotSelected: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    timeText: {
      fontSize: 12,
      color: textColor,
      fontWeight: "500",
    },
    timeTextSelected: {
      color: Colors.white,
    },
    paymentCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
      backgroundColor: surfaceVariantColor,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: borderColor,
    },
    paymentCardSelected: {
      borderColor: Colors.primary,
      backgroundColor: primaryLightColor,
    },
    paymentLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    paymentIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: surfaceColor,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    paymentIconSelected: {
      backgroundColor: Colors.primary,
    },
    paymentName: {
      fontSize: 14,
      fontWeight: "500",
      color: textColor,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: darkMode ? Colors.gray[600] : "#CCC",
      alignItems: "center",
      justifyContent: "center",
    },
    radioOuterSelected: {
      borderColor: Colors.primary,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: Colors.primary,
    },
    summaryCard: {
      backgroundColor: surfaceVariantColor,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: borderColor,
    },
    summaryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    summaryItemName: {
      fontSize: 14,
      color: textSecondaryColor,
    },
    summaryItemPrice: {
      fontSize: 14,
      fontWeight: "600",
      color: textColor,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 14,
      color: textSecondaryColor,
    },
    summaryValue: {
      fontSize: 14,
      color: textColor,
      fontWeight: "500",
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: textColor,
    },
    totalValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors.primary,
    },
    divider: {
      height: 1,
      backgroundColor: borderColor,
      marginVertical: 12,
    },
    bidAmountContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    currencySymbol: {
      fontSize: 16,
      fontWeight: "600",
      color: textColor,
    },
    bidAmountInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: textColor,
      padding: 4,
    },
    bidAdjustmentNote: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      padding: 8,
      backgroundColor: darkMode ? "#3D2A1A" : "#FFF3E0",
      borderRadius: 8,
    },
    bidAdjustmentText: {
      fontSize: 12,
      color: "#FF9800",
      marginLeft: 4,
    },
    bottomBar: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: surfaceColor,
      borderTopWidth: 1,
      borderTopColor: borderColor,
      paddingBottom: Platform.OS === "ios" ? 24 : 16,
    },
    totalContainer: {
      marginRight: 16,
    },
    bottomTotalLabel: {
      fontSize: 12,
      color: textSecondaryColor,
    },
    bottomTotalValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: textColor,
    },
    confirmButton: {
      flex: 1,
      backgroundColor: Colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    confirmButtonDisabled: {
      backgroundColor: Colors.gray[400],
    },
    confirmButtonText: {
      color: Colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
  })

  const styles = getStyles()

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Debug Info for Hiring Flow */}
        {isHiringFlow && (
          <View style={{ 
            backgroundColor: '#E3F2FD', 
            padding: 12, 
            marginBottom: 12,
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: Colors.primary
          }}>
            <Text style={{ fontSize: 12, color: '#1565C0', fontWeight: '600', marginBottom: 4 }}>Hiring Mode: Active</Text>
            <Text style={{ fontSize: 11, color: '#0D47A1', marginBottom: 2 }}>Bid ID: {hirableBidId}</Text>
            <Text style={{ fontSize: 11, color: '#0D47A1', marginBottom: 2 }}>Job ID: {hirableJobId}</Text>
            <Text style={{ fontSize: 11, color: '#0D47A1' }}>Worker: {workerName} (₹{workerAmount})</Text>
          </View>
        )}

        {!isHiringFlow && (
          <View style={{ 
            backgroundColor: '#FFF3E0', 
            padding: 12, 
            marginBottom: 12,
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#FF9800'
          }}>
            <Text style={{ fontSize: 12, color: '#E65100', fontWeight: '600' }}>Regular Booking Mode</Text>
          </View>
        )}

        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Address</Text>
            <TouchableOpacity>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons name="location" size={24} color={Colors.primary} />
            </View>
            <View style={styles.addressDetails}>
              <Text style={styles.addressType}>Home</Text>
              <Text style={styles.addressText}>
                {currentLocation?.address || "123 Main Street, Apt 4B, New York, NY"}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {getNextDays().map((date, index) => {
              const formatted = formatDate(date)
              const isSelected = selectedDate?.toDateString() === date.toDateString()
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>{formatted.day}</Text>
                  <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>{formatted.date}</Text>
                  <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>{formatted.month}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time
              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>{time}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => {
            const isSelected = selectedPayment === method.id
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={styles.paymentLeft}>
                  <View style={[styles.paymentIcon, isSelected && styles.paymentIconSelected]}>
                    <Ionicons
                      name={method.icon as any}
                      size={20}
                      color={isSelected ? "white" : Colors.primary}
                    />
                  </View>
                  <Text style={styles.paymentName}>{method.name}</Text>
                </View>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            {isBidFlow ? (
              <>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemName}>Worker Bid (Agreed)</Text>
                  <View style={styles.bidAmountContainer}>
                    <Text style={styles.currencySymbol}>Rs. </Text>
                    <TextInput
                      style={styles.bidAmountInput}
                      value={bidAmount}
                      onChangeText={setBidAmount}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={textSecondaryColor}
                    />
                  </View>
                </View>
                {bidAmount !== activeJob?.budget && (
                  <View style={styles.bidAdjustmentNote}>
                    <Ionicons name="information-circle-outline" size={14} color="#FF9800" />
                    <Text style={styles.bidAdjustmentText}>Price adjusted from agreed amount</Text>
                  </View>
                )}
              </>
            ) : (
              cart.map((item) => (
                <View key={item.service.id} style={styles.summaryItem}>
                  <Text style={styles.summaryItemName}>
                    {item.service.name} x{item.quantity}
                  </Text>
                  <Text style={styles.summaryItemPrice}>Rs. {item.service.price * item.quantity}</Text>
                </View>
              ))
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>Rs. {subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>-Rs. {discount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (18%)</Text>
              <Text style={styles.summaryValue}>Rs. {tax}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Rs. {total}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalValue}>Rs. {total}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmButton, ((!selectedDate || !selectedTime) || isProcessing) && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          disabled={!selectedDate || !selectedTime || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}