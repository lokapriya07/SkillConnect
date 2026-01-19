import CheckoutScreen from "@/components/screens/checkout-screen"
import { useRouter } from "expo-router"

export default function CheckoutPage() {
    const router = useRouter()

    return (
        <CheckoutScreen
            onBack={() => router.back()}
            // FIX: Add 'as any' here too
            onConfirm={() => router.replace("/booking-confirmation" as any)}
        />
    )
}