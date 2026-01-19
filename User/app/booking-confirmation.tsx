// Location: app/booking-confirmation.tsx
import BookingConfirmationScreen from "@/components/screens/booking-confirmation-screen"
import { useRouter } from "expo-router"

export default function BookingConfirmationPage() {
    const router = useRouter()

    return (
        <BookingConfirmationScreen
            // FIX: Use "/" for home (index of tabs)
            onGoHome={() => router.replace("/")}

            // FIX: Use "/bookings". We add 'as any' to stop the red line 
            // if Expo hasn't updated its types yet.
            onViewBookings={() => router.replace("/bookings" as any)}
        />
    )
}