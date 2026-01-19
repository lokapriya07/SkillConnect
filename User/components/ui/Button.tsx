import { TouchableOpacity, Text, ActivityIndicator, type ViewStyle, type TextStyle } from "react-native"
import {Colors}  from "@/constants/Colors"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    }

    // Size
    switch (size) {
      case "sm":
        base.paddingVertical = 8
        base.paddingHorizontal = 16
        break
      case "lg":
        base.paddingVertical = 16
        base.paddingHorizontal = 32
        break
      default:
        base.paddingVertical = 12
        base.paddingHorizontal = 24
    }

    // Variant
    switch (variant) {
      case "secondary":
        base.backgroundColor = Colors.gray[100]
        break
      case "outline":
        base.backgroundColor = "transparent"
        base.borderWidth = 1
        base.borderColor = Colors.primary
        break
      case "ghost":
        base.backgroundColor = "transparent"
        break
      default:
        base.backgroundColor = Colors.primary
    }

    if (disabled || loading) {
      base.opacity = 0.6
    }

    if (fullWidth) {
      base.width = "100%"
    }

    return base
  }

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: "600",
    }

    // Size
    switch (size) {
      case "sm":
        base.fontSize = 14
        break
      case "lg":
        base.fontSize = 18
        break
      default:
        base.fontSize = 16
    }

    // Variant
    switch (variant) {
      case "secondary":
        base.color = Colors.gray[800]
        break
      case "outline":
      case "ghost":
        base.color = Colors.primary
        break
      default:
        base.color = Colors.white
    }

    return base
  }

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? Colors.white : Colors.primary} style={{ marginRight: 8 }} />
      ) : null}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  )
}
export default Button
