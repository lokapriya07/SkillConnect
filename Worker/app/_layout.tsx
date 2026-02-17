import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"
import { useColorScheme } from "react-native"
import { VerificationProvider } from "@/context/VerificationContext"

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <VerificationProvider>
        <Stack>
          {/* 🔐 AUTH FLOW */}
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="auth/phone" options={{ headerShown: false }} />
          <Stack.Screen name="auth/otp" options={{ headerShown: false }} />

          {/* 🎉 ONBOARDING FLOW */}
          <Stack.Screen
            name="welcome"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen name="location" options={{ headerShown: false }} />
          <Stack.Screen name="manual-location" options={{ headerShown: false }} />

          {/* 👷 WORKER MAIN APP */}
          <Stack.Screen
            name="(worker-tabs)"
            options={{ headerShown: false }}
          />
        </Stack>

        <StatusBar style="auto" />
      </VerificationProvider>
    </ThemeProvider>
  )
}
