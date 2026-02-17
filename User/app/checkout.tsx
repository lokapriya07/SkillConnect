import CheckoutScreen from "@/components/screens/checkout-screen"
import { useRouter, useLocalSearchParams } from "expo-router"

export default function CheckoutPage() {
    const router = useRouter()
    const params = useLocalSearchParams()

    return (
        <CheckoutScreen
            params={params}
            onBack={() => router.back()}
            // FIX: Add 'as any' here too
            onConfirm={() => router.replace("/booking-confirmation" as any)}
        />
    )
}