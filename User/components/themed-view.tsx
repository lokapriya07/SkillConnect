import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, ScrollView, StatusBar, TouchableOpacity, TextInput } from 'react-native';
import { useAppStore } from '@/lib/store';
import { Colors } from '@/constants/Colors';

// Theme-aware View component - wraps View with dark mode background
export function ThemedView({ 
  style, 
  children,
  darkBg,
  lightBg
}: { 
  style?: ViewStyle; 
  children?: React.ReactNode;
  darkBg?: string;
  lightBg?: string;
}) {
  const { darkMode } = useAppStore();
  
  return (
    <View style={[styles.container, { backgroundColor: darkMode ? (darkBg || Colors.backgroundDark) : (lightBg || Colors.background) }, style]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={darkMode ? Colors.backgroundDark : Colors.background} />
      {children}
    </View>
  );
}

// Theme-aware ScrollView component - wraps ScrollView with dark mode background
export function ThemedScrollView({ 
  style, 
  children,
  darkBg,
  lightBg,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false
}: { 
  style?: ViewStyle; 
  children?: React.ReactNode;
  darkBg?: string;
  lightBg?: string;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}) {
  const { darkMode } = useAppStore();
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: darkMode ? (darkBg || Colors.backgroundDark) : (lightBg || Colors.background) }, style]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
    >
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={darkMode ? Colors.backgroundDark : Colors.background} />
      {children}
    </ScrollView>
  );
}

// Theme-aware Text component
export function ThemedText({ 
  style, 
  children,
  darkColor,
  lightColor,
  type = 'default'
}: { 
  style?: TextStyle; 
  children?: React.ReactNode;
  darkColor?: string;
  lightColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'header' | 'body' | 'caption';
}) {
  const { darkMode } = useAppStore();
  
  const color = darkMode 
    ? (darkColor || Colors.textDark) 
    : (lightColor || Colors.text);
  
  const typeStyle = getTextTypeStyle(type);
  
  return (
    <Text style={[typeStyle, { color }, style]}>
      {children}
    </Text>
  );
}

// Theme-aware TouchableOpacity
export function ThemedTouchableOpacity({
  style,
  children,
  darkBg,
  lightBg,
  ...props
}: {
  style?: ViewStyle;
  children?: React.ReactNode;
  darkBg?: string;
  lightBg?: string;
  onPress?: () => void;
}) {
  const { darkMode } = useAppStore();
  
  return (
    <TouchableOpacity 
      style={[{ backgroundColor: darkMode ? (darkBg || Colors.surfaceDark) : (lightBg || Colors.surface) }, style]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

// Theme-aware TextInput
export function ThemedTextInput({
  style,
  placeholderTextColor,
  darkBg,
  lightBg,
  darkPlaceholder,
  lightPlaceholder,
  ...props
}: {
  style?: TextStyle;
  placeholderTextColor?: string;
  darkBg?: string;
  lightBg?: string;
  darkPlaceholder?: string;
  lightPlaceholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}) {
  const { darkMode } = useAppStore();
  
  return (
    <TextInput
      style={[
        styles.textInput, 
        { 
          backgroundColor: darkMode ? (darkBg || Colors.surfaceDark) : (lightBg || Colors.surface),
          color: darkMode ? Colors.textDark : Colors.text
        }, 
        style
      ]}
      placeholderTextColor={darkMode ? (darkPlaceholder || Colors.textSecondaryDark) : (lightPlaceholder || Colors.textSecondary)}
      {...props}
    />
  );
}

// Helper function to get text type styles
function getTextTypeStyle(type: string): TextStyle {
  switch (type) {
    case 'title':
      return styles.title;
    case 'defaultSemiBold':
      return styles.defaultSemiBold;
    case 'subtitle':
      return styles.subtitle;
    case 'link':
      return styles.link;
    case 'header':
      return styles.header;
    case 'body':
      return styles.body;
    case 'caption':
      return styles.caption;
    default:
      return styles.default;
  }
}

// Pre-styled components for common use cases
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    lineHeight: 28,
    fontSize: 16,
    color: '#0a7ea4',
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

// Export theme colors helper
export const getThemeColors = () => {
  const { darkMode } = useAppStore();
  return {
    background: darkMode ? Colors.backgroundDark : Colors.background,
    surface: darkMode ? Colors.surfaceDark : Colors.surface,
    surfaceVariant: darkMode ? Colors.gray[800] : Colors.gray[100],
    text: darkMode ? Colors.textDark : Colors.text,
    textSecondary: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
    border: darkMode ? Colors.borderDark : Colors.border,
    primary: Colors.primary,
    white: Colors.white,
    black: Colors.black,
  };
};

// Export individual color helpers for easy access
export const getBackgroundColor = () => useAppStore.getState().darkMode ? Colors.backgroundDark : Colors.background;
export const getSurfaceColor = () => useAppStore.getState().darkMode ? Colors.surfaceDark : Colors.surface;
export const getTextColor = () => useAppStore.getState().darkMode ? Colors.textDark : Colors.text;
export const getTextSecondaryColor = () => useAppStore.getState().darkMode ? Colors.textSecondaryDark : Colors.textSecondary;
export const getBorderColor = () => useAppStore.getState().darkMode ? Colors.borderDark : Colors.border;
