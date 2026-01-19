"use client"

import OtpVerificationScreen from "@/components/screens/otp-verification-screen"
import { useRouter, useLocalSearchParams } from "expo-router"

export default function OtpPage() {
  const router = useRouter()
  const { phone } = useLocalSearchParams<{ phone: string }>()

  return (
    // <OtpVerificationScreen
    //   phone={phone || ""}
    //   onVerify={() => router.push("/location")}
    //   onBack={() => router.back()}
    //   onResend={() => {}}
    // />
    <OtpVerificationScreen
  phone="1234567890"
  onVerify={(otp) => {
    if (otp === "123456") {
      router.push("/location")
    } else {
      alert("Invalid OTP")
    }
  }}
  onBack={() => {}}
  onResend={() => {}}
/>

  )
}
