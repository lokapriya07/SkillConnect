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
    TextInput,
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
  const { cart, getCartTotal, currentLocation, addBooking, clearCart, activeJobs, clearJobs, darkMode } = useAppStore()
  
  // Get the first/most recent active job for checkout
  const activeJob = activeJobs[0]

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>("card")
  const [bidAmount, setBidAmount] = useState(activeJob?.budget || "")

  // Theme colors
  const backgroundColor = darkMode ? Colors.backgroundDark : Colors.background
  const surfaceColor = darkMode ? Colors.surfaceDark : Colors.surface
  const textColor = darkMode ? Colors.textDark : Colors.text
  const textSecondaryColor = darkMode ? Colors.textSecondaryDark : Colors.textSecondary
  const borderColor = darkMode ? Colors.borderDark : Colors.border
  const surfaceVariantColor = darkMode ? Colors.gray[800] : Colors.gray[100]
  const primaryLightColor = darkMode ? "#1E3A5F" : "#E3F2FD"

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

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime) {
      // Determine if this is truly a bid flow (user submitted a custom bid amount)
      const hasBidAmount = bidAmount && bidAmount !== "" && parseFloat(bidAmount) > 0;
      
      const newBooking = {
        id: Math.random().toString(36).substr(2, 9),
        items: hasBidAmount && activeJob?.description
          ? [
              {
                service: {
                  id: "bid-" + Date.now(),
                  name: activeJob?.description || "Custom Service Request",
                  description: activeJob?.description || "",
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
          : cart,
        total: total,
        status: "confirmed" as const,
        date: selectedDate.toDateString(),
        time: selectedTime,
        address: currentLocation?.address || "Default Address",
      }

      addBooking(newBooking)
      clearCart()
      clearJobs() // Clear active jobs to prevent old job data from interfering with future bookings
      onConfirm()
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
