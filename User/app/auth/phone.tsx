"use client"

import PhoneAuthScreen from "@/components/screens/phone-auth-screen"
import { useRouter } from "expo-router"

export default function PhonePage() {
  const router = useRouter()

  return (
    <PhoneAuthScreen />
  )
}