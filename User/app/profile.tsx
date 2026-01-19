import ProfileScreen from "@/components/screens/profile-screen"
import { useRouter } from "expo-router"
import { useAppStore } from "@/lib/store"

export default function ProfilePage() {
    const router = useRouter()
    const { logout } = useAppStore()

    const handleLogout = () => {
        logout()
        router.replace("/auth/login")
    }

    return (
        <ProfileScreen
            onLogout={handleLogout}
        // Add other navigation handlers if needed by ProfileScreen
        />
    )
}