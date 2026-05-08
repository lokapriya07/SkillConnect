import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import 'react-native-reanimated';
import { useAppStore } from '@/lib/store';

// Ensure Reanimated is properly initialized
try {
  require('react-native-reanimated');
} catch (e) {
  console.warn('Reanimated not available:', e);
}

export default function RootLayout() {
  const { darkMode } = useAppStore();
  const theme = darkMode ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme}>
        <Stack>
          {/* 🔐 Auth Screens */}
          <Stack.Screen name="auth/login" options={{ headerShown: false, title: 'Login' }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false, title: 'Sign Up' }} />

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
          <Stack.Screen name="contact-support" options={{ headerShown: false }} />
          <Stack.Screen name="help" options={{ headerShown: false }} />
        </Stack>

        <StatusBar style={darkMode ? "light" : "dark"} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}