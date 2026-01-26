"use client"

import OtpVerificationScreen from "@/components/screens/otp-verification-screen"
import { useRouter, useLocalSearchParams } from "expo-router"

export default function OtpPage() {
  const router = useRouter()

  // Extract the phone param from the URL
  const { phone } = useLocalSearchParams<{ phone: string }>()

  // Fallback to avoid 'undefined' if someone navigates here directly
  const displayPhone = phone ?? "No number provided";

  return (
    <OtpVerificationScreen
      phone={displayPhone}
      onVerify={() => {
        // This runs AFTER the fetch call inside OtpVerificationScreen is successful
        router.push("/location")
      }}
      onBack={() => router.back()}
      // Optional: Add logic here if you want to handle resend at the page level
      onResend={() => console.log("Resend requested for:", displayPhone)}
    />
  )
}