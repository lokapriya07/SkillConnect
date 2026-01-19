"use client"

import LocationScreen from "@/components/screens/location-screen"
import { useRouter } from "expo-router"

export default function LocationPage() {
  const router = useRouter()

  return (
    <LocationScreen
      onLocationSelected={() => router.replace("/(tabs)")}
      // FIXED: Updated path to include '/auth/' since the file is in the auth folder
      onManualEntry={() => router.push("/manual-location")}
      onSkip={() => router.replace("/(tabs)")}
    />
  )
}