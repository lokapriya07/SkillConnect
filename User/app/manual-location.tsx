"use client"

import ManualLocationScreen from "@/components/screens/manual-location-screen"
import { useRouter } from "expo-router"

export default function ManualLocationPage() {
  const router = useRouter()

  // FIXED: Added parentheses () around the return component.
  // Without them, the code fails because 'return' is on its own line.
  return (
    <ManualLocationScreen
      onBack={() => router.back()}
      onLocationSaved={() => router.replace("/(tabs)")}
    />
  )
}