import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* 🔐 Auth Screens */}
        <Stack.Screen name="auth/login" options={{ headerShown: false, title: 'Login' }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false, title: 'Sign Up' }} />
        {/* ADDED MISSING SCREENS FOR YOUR FLOW */}
        <Stack.Screen name="auth/phone" options={{ headerShown: false }} />
        <Stack.Screen name="auth/otp" options={{ headerShown: false }} />

        {/* 🎉 Welcome & Onboarding */}
        <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="location" options={{ headerShown: false }} />
        <Stack.Screen name="manual-location" options={{ headerShown: false }} />

        {/* 🏠 Main Entry Point */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 📦 Other Screens */}
        <Stack.Screen name="service-detail" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="booking-confirmation" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}