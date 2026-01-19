import CartScreen from "@/components/screens/cart-screen"
import { useRouter } from "expo-router"

export default function CartPage() {
    const router = useRouter()
    return (
        <CartScreen
            onBack={() => router.back()}
            onCheckout={() => router.push("/checkout" as any)}
        />
    )
}