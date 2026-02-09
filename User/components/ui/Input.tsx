"use client"

import { useState } from "react"
import { View, TextInput, Text, StyleSheet, type ViewStyle, type TextInputProps } from "react-native"
import  {Colors}  from "@/constants/Colors"
import { useAppStore } from "@/lib/store"

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const darkMode = useAppStore((state) => state.darkMode)

  return (
    <View style={[getStyles(darkMode).container, containerStyle]}>
      {label && <Text style={getStyles(darkMode).label}>{label}</Text>}
      <TextInput
        style={[getStyles(darkMode).input, isFocused && getStyles(darkMode).inputFocused, error && getStyles(darkMode).inputError, style]}
        placeholderTextColor={darkMode ? Colors.gray[500] : Colors.gray[400]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && <Text style={getStyles(darkMode).error}>{error}</Text>}
    </View>
  )
}

const getStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: darkMode ? Colors.textSecondaryDark : Colors.gray[700],
    marginBottom: 6,
  },
  input: {
    backgroundColor: darkMode ? Colors.surfaceDark : Colors.gray[50],
    borderWidth: 1,
    borderColor: darkMode ? Colors.borderDark : Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: darkMode ? Colors.textDark : Colors.gray[900],
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: darkMode ? '#2C2C2E' : Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
})
export default Input
