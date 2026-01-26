"use client"

import PhoneAuthScreen from "@/components/screens/phone-auth-screen"
import { useRouter } from "expo-router"

export default function PhonePage() {
  const router = useRouter()

  return (
    <PhoneAuthScreen
      // onSubmit receives 'fullPhone' from PhoneAuthScreen logic
      onSubmit={(phone: string) =>
        router.push({
          pathname: "/auth/otp",
          params: { phone: phone }
        })
      }
      onSkip={() => router.replace("/(tabs)")}
    />
  )
}