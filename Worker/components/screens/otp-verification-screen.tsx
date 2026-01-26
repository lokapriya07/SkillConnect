"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { Button } from "@/components/ui/button"

interface OtpVerificationScreenProps {
  phone: string // Expects format "+91XXXXXXXXXX"
  onVerify: () => void
  onBack: () => void
  onResend?: () => void
}

export default function OtpVerificationScreen({ phone, onVerify, onBack }: OtpVerificationScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [timer, setTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputRefs = useRef<Array<TextInput | null>>([])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const digits = value.replace(/[^0-9]/g, "").split("").slice(0, 6)
      const newOtp = [...otp]
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit
      })
      setOtp(newOtp)
      inputRefs.current[Math.min(index + digits.length, 5)]?.focus()
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value.replace(/[^0-9]/g, "")
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // 🔥 FIXED: Uses correct API path and phone prop
  const handleResend = async () => {
    try {
      setTimer(30)
      setCanResend(false)

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone }),
      })

      const data = await response.json();
      if (data.success) {
        Alert.alert("OTP Sent", "New OTP sent to " + phone)
      } else {
        Alert.alert("Error", data.error || "Failed to resend")
      }
    } catch {
      Alert.alert("Error", "Failed to resend OTP")
    }
  }

  // 🔥 FIXED: Ensures phone is sent exactly as received in props
  const handleVerify = async () => {
    const code = otp.join("")
    if (code.length !== 6) return

    try {
      setLoading(true)
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone, // This must include the +91
          otp: code,
        }),
      })

      const data = await res.json()
      setLoading(false)

      if (data.success) {
        Alert.alert("Success", "Phone verified successfully ✅")
        onVerify()
      } else {
        Alert.alert("Invalid OTP", data.message || "Please try again")
      }
    } catch (err) {
      setLoading(false)
      Alert.alert("Server Error", "Could not verify OTP")
    }
  }

  const isComplete = otp.every((digit) => digit !== "")

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Phone</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={48} color="#0066CC" />
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            We have sent a 6-digit code to{"\n"}
            {/* 🔥 NO MORE HARDCODED NUMBER */}
            <Text style={styles.phoneNumber}>{phone}</Text>
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend code in <Text style={styles.timerNumber}>{timer}s</Text>
            </Text>
          )}
        </View>

        <Button
          title={loading ? "Verifying..." : "Verify"}
          onPress={handleVerify}
          disabled={!isComplete || loading}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[50],
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray[900],
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gray[50],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.gray[900],
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: "center",
    lineHeight: 24,
  },
  phoneNumber: {
    color: Colors.gray[900],
    fontWeight: "600",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 24,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: Colors.gray[50],
    color: Colors.gray[900],
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  resendText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
  timerText: {
    fontSize: 15,
    color: Colors.gray[500],
  },
  timerNumber: {
    color: Colors.primary,
    fontWeight: "600",
  },
})
