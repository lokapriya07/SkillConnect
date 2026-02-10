import { Platform } from 'react-native';

const tintColorLight = '#007BFF';
const tintColorDark = '#fff';

export const Colors = {
  primary: "#007BFF",
  primaryLight: "#46A3FF",
  primaryDark: "#0056b3",
  white: "#FFFFFF",
  black: "#000000",
  text: "#1A1A1A",
  textDark: "#FFFFFF",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  success: "#10B981",
  textSecondary: "#666666",
  textSecondaryDark: "#9CA3AF",
  warning: "#F59E0B",
  error: "#EF4444",
  background: "#FFFFFF",
  backgroundDark: "#000000",
  surface: "#F9FAFB",
  surfaceDark: "#1C1C1E",
  border: "#E5E7EB",
  borderDark: "#38383A",
  
  // Theme colors for navigation
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Helper function to get colors based on dark mode
export const getColors = (isDark: boolean) => {
  return isDark ? Colors.dark : Colors.light;
};

// Helper to get theme-aware color
export const useThemeColor = (isDark: boolean, lightColor: string, darkColor: string) => {
  return isDark ? darkColor : lightColor;
};
