// import { useState } from "react"
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { useAppStore } from "@/lib/store"
// import { Colors } from "@/constants/Colors"

// interface CheckoutScreenProps {
//     onBack: () => void
//     onConfirm: () => void
// }

// const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]

// const paymentMethods = [
//     { id: "card", name: "Credit/Debit Card", icon: "card-outline" },
//     { id: "upi", name: "UPI Payment", icon: "phone-portrait-outline" },
//     { id: "wallet", name: "Digital Wallet", icon: "wallet-outline" },
//     { id: "cash", name: "Cash on Service", icon: "cash-outline" },
// ]

// export default function CheckoutScreen({ onBack, onConfirm }: CheckoutScreenProps) {
//     // FIX 1: Destructure 'currentLocation' (not userLocation) and 'addBooking' (not createBooking)
//     const { cart, getCartTotal, currentLocation, addBooking, clearCart } = useAppStore()

//     const [selectedDate, setSelectedDate] = useState<Date | null>(null)
//     const [selectedTime, setSelectedTime] = useState<string | null>(null)
//     const [selectedPayment, setSelectedPayment] = useState<string>("card")

//     const getNextDays = () => {
//         const days = []
//         for (let i = 0; i < 7; i++) {
//             const date = new Date()
//             date.setDate(date.getDate() + i)
//             days.push(date)
//         }
//         return days
//     }

//     const formatDate = (date: Date) => {
//         const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
//         return {
//             day: days[date.getDay()],
//             date: date.getDate(),
//             month: date.toLocaleString("default", { month: "short" }),
//         }
//     }

//     const subtotal = getCartTotal()
//     const discount = 50
//     const tax = Math.round(subtotal * 0.18)
//     const total = subtotal - discount + tax

//     const handleConfirmBooking = () => {
//         if (selectedDate && selectedTime) {
//             // FIX 3: Construct the booking object matching your Store interface
//             const newBooking = {
//                 id: Math.random().toString(36).substr(2, 9),
//                 items: cart,
//                 total: total,
//                 status: "confirmed" as const,
//                 date: selectedDate.toDateString(),
//                 time: selectedTime,
//                 address: currentLocation?.address || "Default Address",
//             }

//             addBooking(newBooking)
//             clearCart() // Optional: Clear cart after booking
//             onConfirm()
//         }
//     }

//     return (
//         <View style={styles.container}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={onBack} style={styles.backButton}>
//                     <Ionicons name="arrow-back" size={24} color={Colors.text} />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Checkout</Text>
//                 <View style={{ width: 40 }} />
//             </View>

//             <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//                 {/* Address Section */}
//                 <View style={styles.section}>
//                     <View style={styles.sectionHeader}>
//                         <Text style={styles.sectionTitle}>Service Address</Text>
//                         <TouchableOpacity>
//                             <Text style={styles.changeText}>Change</Text>
//                         </TouchableOpacity>
//                     </View>
//                     <View style={styles.addressCard}>
//                         <View style={styles.addressIcon}>
//                             <Ionicons name="location" size={24} color={Colors.primary} />
//                         </View>
//                         <View style={styles.addressDetails}>
//                             <Text style={styles.addressType}>Home</Text>
//                             {/* FIX 1: Use currentLocation?.address */}
//                             <Text style={styles.addressText}>
//                                 {currentLocation?.address || "123 Main Street, Apt 4B, New York, NY"}
//                             </Text>
//                         </View>
//                     </View>
//                 </View>

//                 {/* Date Selection */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>Select Date</Text>
//                     <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
//                         {getNextDays().map((date, index) => {
//                             const formatted = formatDate(date)
//                             const isSelected = selectedDate?.toDateString() === date.toDateString()
//                             return (
//                                 <TouchableOpacity
//                                     key={index}
//                                     style={[styles.dateCard, isSelected && styles.dateCardSelected]}
//                                     onPress={() => setSelectedDate(date)}
//                                 >
//                                     <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>{formatted.day}</Text>
//                                     <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>{formatted.date}</Text>
//                                     <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>{formatted.month}</Text>
//                                 </TouchableOpacity>
//                             )
//                         })}
//                     </ScrollView>
//                 </View>

//                 {/* Time Selection */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>Select Time Slot</Text>
//                     <View style={styles.timeGrid}>
//                         {timeSlots.map((time) => {
//                             const isSelected = selectedTime === time
//                             return (
//                                 <TouchableOpacity
//                                     key={time}
//                                     style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
//                                     onPress={() => setSelectedTime(time)}
//                                 >
//                                     <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>{time}</Text>
//                                 </TouchableOpacity>
//                             )
//                         })}
//                     </View>
//                 </View>

//                 {/* Payment Method */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>Payment Method</Text>
//                     {paymentMethods.map((method) => {
//                         const isSelected = selectedPayment === method.id
//                         return (
//                             <TouchableOpacity
//                                 key={method.id}
//                                 style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
//                                 onPress={() => setSelectedPayment(method.id)}
//                             >
//                                 <View style={styles.paymentLeft}>
//                                     <View style={[styles.paymentIcon, isSelected && styles.paymentIconSelected]}>
//                                         <Ionicons name={method.icon as any} size={20} color={isSelected ? Colors.white : Colors.primary} />
//                                     </View>
//                                     <Text style={styles.paymentName}>{method.name}</Text>
//                                 </View>
//                                 <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
//                                     {isSelected && <View style={styles.radioInner} />}
//                                 </View>
//                             </TouchableOpacity>
//                         )
//                     })}
//                 </View>

//                 {/* Order Summary */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>Order Summary</Text>
//                     <View style={styles.summaryCard}>
//                         {/* FIX 2: Access properties via item.service.* */}
//                         {cart.map((item) => (
//                             <View key={item.service.id} style={styles.summaryItem}>
//                                 <Text style={styles.summaryItemName}>
//                                     {item.service.name} x{item.quantity}
//                                 </Text>
//                                 <Text style={styles.summaryItemPrice}>Rs. {item.service.price * item.quantity}</Text>
//                             </View>
//                         ))}
//                         <View style={styles.divider} />
//                         <View style={styles.summaryRow}>
//                             <Text style={styles.summaryLabel}>Subtotal</Text>
//                             <Text style={styles.summaryValue}>Rs. {subtotal}</Text>
//                         </View>
//                         <View style={styles.summaryRow}>
//                             <Text style={styles.summaryLabel}>Discount</Text>
//                             <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>-Rs. {discount}</Text>
//                         </View>
//                         <View style={styles.summaryRow}>
//                             <Text style={styles.summaryLabel}>Tax (18%)</Text>
//                             <Text style={styles.summaryValue}>Rs. {tax}</Text>
//                         </View>
//                         <View style={styles.divider} />
//                         <View style={styles.summaryRow}>
//                             <Text style={styles.totalLabel}>Total</Text>
//                             <Text style={styles.totalValue}>Rs. {total}</Text>
//                         </View>
//                     </View>
//                 </View>

//                 <View style={{ height: 100 }} />
//             </ScrollView>

//             {/* Bottom Bar */}
//             <View style={styles.bottomBar}>
//                 <View style={styles.totalContainer}>
//                     <Text style={styles.bottomTotalLabel}>Total Amount</Text>
//                     <Text style={styles.bottomTotalValue}>Rs. {total}</Text>
//                 </View>
//                 <TouchableOpacity
//                     style={[styles.confirmButton, (!selectedDate || !selectedTime) && styles.confirmButtonDisabled]}
//                     onPress={handleConfirmBooking}
//                     disabled={!selectedDate || !selectedTime}
//                 >
//                     <Text style={styles.confirmButtonText}>Confirm Booking</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: Colors.background,
//     },
//     header: {
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//         paddingHorizontal: 16,
//         paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
//         paddingBottom: 16,
//         backgroundColor: Colors.white,
//         borderBottomWidth: 1,
//         borderBottomColor: Colors.border,
//     },
//     backButton: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: Colors.background,
//         alignItems: "center",
//         justifyContent: "center",
//     },
//     headerTitle: {
//         fontSize: 18,
//         fontWeight: "600",
//         color: Colors.text,
//     },
//     content: {
//         flex: 1,
//     },
//     section: {
//         backgroundColor: Colors.white,
//         marginTop: 8,
//         padding: 16,
//     },
//     sectionHeader: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         marginBottom: 12,
//     },
//     sectionTitle: {
//         fontSize: 16,
//         fontWeight: "600",
//         color: Colors.text,
//         marginBottom: 12,
//     },
//     changeText: {
//         fontSize: 14,
//         color: Colors.primary,
//         fontWeight: "500",
//     },
//     addressCard: {
//         flexDirection: "row",
//         alignItems: "center",
//         padding: 12,
//         backgroundColor: "#E3F2FD", // Fixed color for PrimaryLight
//         borderRadius: 12,
//         borderWidth: 1,
//         borderColor: Colors.primary,
//     },
//     addressIcon: {
//         width: 44,
//         height: 44,
//         borderRadius: 22,
//         backgroundColor: Colors.white,
//         alignItems: "center",
//         justifyContent: "center",
//         marginRight: 12,
//     },
//     addressDetails: {
//         flex: 1,
//     },
//     addressType: {
//         fontSize: 14,
//         fontWeight: "600",
//         color: Colors.text,
//         marginBottom: 2,
//     },
//     addressText: {
//         fontSize: 13,
//         color: Colors.textSecondary,
//         lineHeight: 18,
//     },
//     dateScroll: {
//         marginHorizontal: -16,
//         paddingHorizontal: 16,
//     },
//     dateCard: {
//         width: 70,
//         padding: 12,
//         borderRadius: 12,
//         backgroundColor: Colors.background,
//         alignItems: "center",
//         marginRight: 10,
//         borderWidth: 1,
//         borderColor: Colors.border,
//     },
//     dateCardSelected: {
//         backgroundColor: Colors.primary,
//         borderColor: Colors.primary,
//     },
//     dateDay: {
//         fontSize: 12,
//         color: Colors.textSecondary,
//         marginBottom: 4,
//     },
//     dateNumber: {
//         fontSize: 20,
//         fontWeight: "700",
//         color: Colors.text,
//         marginBottom: 2,
//     },
//     dateMonth: {
//         fontSize: 12,
//         color: Colors.textSecondary,
//     },
//     dateTextSelected: {
//         color: Colors.white,
//     },
//     timeGrid: {
//         flexDirection: "row",
//         flexWrap: "wrap",
//         marginHorizontal: -5,
//     },
//     timeSlot: {
//         width: "23%",
//         margin: "1%",
//         paddingVertical: 12,
//         borderRadius: 8,
//         backgroundColor: Colors.background,
//         alignItems: "center",
//         borderWidth: 1,
//         borderColor: Colors.border,
//     },
//     timeSlotSelected: {
//         backgroundColor: Colors.primary,
//         borderColor: Colors.primary,
//     },
//     timeText: {
//         fontSize: 12,
//         color: Colors.text,
//         fontWeight: "500",
//     },
//     timeTextSelected: {
//         color: Colors.white,
//     },
//     paymentCard: {
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//         padding: 14,
//         backgroundColor: Colors.background,
//         borderRadius: 12,
//         marginBottom: 10,
//         borderWidth: 1,
//         borderColor: Colors.border,
//     },
//     paymentCardSelected: {
//         borderColor: Colors.primary,
//         backgroundColor: "#E3F2FD",
//     },
//     paymentLeft: {
//         flexDirection: "row",
//         alignItems: "center",
//     },
//     paymentIcon: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: "#E3F2FD",
//         alignItems: "center",
//         justifyContent: "center",
//         marginRight: 12,
//     },
//     paymentIconSelected: {
//         backgroundColor: Colors.primary,
//     },
//     paymentName: {
//         fontSize: 14,
//         fontWeight: "500",
//         color: Colors.text,
//     },
//     radioOuter: {
//         width: 22,
//         height: 22,
//         borderRadius: 11,
//         borderWidth: 2,
//         borderColor: Colors.border,
//         alignItems: "center",
//         justifyContent: "center",
//     },
//     radioOuterSelected: {
//         borderColor: Colors.primary,
//     },
//     radioInner: {
//         width: 12,
//         height: 12,
//         borderRadius: 6,
//         backgroundColor: Colors.primary,
//     },
//     summaryCard: {
//         backgroundColor: Colors.background,
//         borderRadius: 12,
//         padding: 16,
//     },
//     summaryItem: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         marginBottom: 8,
//     },
//     summaryItemName: {
//         fontSize: 14,
//         color: Colors.text,
//         flex: 1,
//     },
//     summaryItemPrice: {
//         fontSize: 14,
//         fontWeight: "500",
//         color: Colors.text,
//     },
//     divider: {
//         height: 1,
//         backgroundColor: Colors.border,
//         marginVertical: 12,
//     },
//     summaryRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         marginBottom: 8,
//     },
//     summaryLabel: {
//         fontSize: 14,
//         color: Colors.textSecondary,
//     },
//     summaryValue: {
//         fontSize: 14,
//         color: Colors.text,
//     },
//     totalLabel: {
//         fontSize: 16,
//         fontWeight: "600",
//         color: Colors.text,
//     },
//     totalValue: {
//         fontSize: 18,
//         fontWeight: "700",
//         color: Colors.primary,
//     },
//     bottomBar: {
//         position: "absolute",
//         bottom: 0,
//         left: 0,
//         right: 0,
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//         padding: 16,
//         paddingBottom: Platform.OS === 'ios' ? 30 : 16,
//         backgroundColor: Colors.white,
//         borderTopWidth: 1,
//         borderTopColor: Colors.border,
//     },
//     totalContainer: {},
//     bottomTotalLabel: {
//         fontSize: 12,
//         color: Colors.textSecondary,
//     },
//     bottomTotalValue: {
//         fontSize: 20,
//         fontWeight: "700",
//         color: Colors.text,
//     },
//     confirmButton: {
//         backgroundColor: Colors.primary,
//         paddingHorizontal: 32,
//         paddingVertical: 14,
//         borderRadius: 12,
//     },
//     confirmButtonDisabled: {
//         backgroundColor: Colors.textSecondary,
//     },
//     confirmButtonText: {
//         fontSize: 16,
//         fontWeight: "600",
//         color: Colors.white,
//     },
// })
import { Colors } from "@/constants/Colors"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"

const { width } = Dimensions.get("window")

interface CheckoutScreenProps {
  onBack: () => void
  onConfirm: () => void
}

const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: "card-outline" },
  { id: "upi", name: "UPI Payment", icon: "phone-portrait-outline" },
  { id: "wallet", name: "Digital Wallet", icon: "wallet-outline" },
  { id: "cash", name: "Cash on Service", icon: "cash-outline" },
]

export default function CheckoutScreen({ onBack, onConfirm }: CheckoutScreenProps) {
  // 1. Get data from Global Store
  const { cart, getCartTotal, currentLocation, addBooking, clearCart, activeJob } = useAppStore()

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>("card")

  // --- DYNAMIC PRICING LOGIC ---
  // Check if we are checking out a Bid from CreateRequestScreen or a standard Service
  const isBidFlow = !!activeJob?.budget
  const subtotal = isBidFlow ? parseFloat(activeJob.budget || "0") : getCartTotal()

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

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime) {
      const newBooking = {
        id: Math.random().toString(36).substr(2, 9),
        items: isBidFlow
          ? [
              {
                service: {
                  id: "bid-" + Date.now(),
                  name: `Worker Bid: ${activeJob?.description?.substring(0, 20)}...`,
                  price: subtotal,
                },
                quantity: 1,
              },
            ]
          : cart,
        total: total,
        status: "confirmed" as const,
        date: selectedDate.toDateString(),
        time: selectedTime,
        address: currentLocation?.address || "Default Address",
      }

      addBooking(newBooking)
      if (!isBidFlow) clearCart()
      onConfirm()
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemName}>Worker Bid (Accepted)</Text>
                <Text style={styles.summaryItemPrice}>Rs. {subtotal}</Text>
              </View>
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
          style={[styles.confirmButton, (!selectedDate || !selectedTime) && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// STYLES DEFINITION (Fixed and complete)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 50,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
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
    color: "#333",
    marginBottom: 12,
  },
  changeText: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "500",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007BFF",
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
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
    color: "#333",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: "#666",
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
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  dateCardSelected: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },
  dateDay: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  dateMonth: {
    fontSize: 12,
    color: "#666",
  },
  dateTextSelected: {
    color: "white",
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
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  timeSlotSelected: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },
  timeText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  timeTextSelected: {
    color: "white",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#F1F3F5",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  paymentCardSelected: {
    borderColor: "#007BFF",
    backgroundColor: "#E3F2FD",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentIconSelected: {
    backgroundColor: "#007BFF",
  },
  paymentName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CCC",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#007BFF",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007BFF",
  },
  summaryCard: {
    backgroundColor: "#F1F3F5",
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryItemName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#DDD",
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007BFF",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  totalContainer: {},
  bottomTotalLabel: {
    fontSize: 12,
    color: "#666",
  },
  bottomTotalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: "#CCC",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
})