"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"

interface PhoneAuthScreenProps {
    onSubmit: (phone: string) => void
    onSkip?: () => void
}

export default function PhoneAuthScreen({ onSubmit, onSkip }: PhoneAuthScreenProps) {
    const [phone, setPhone] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = () => {
        if (phone.length !== 10) {
            setError("Please enter a valid 10-digit phone number")
            return
        }
        setError("")
        onSubmit(phone)
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {/* Header with Skip */}
                <View style={styles.header}>
                    <View style={{ width: 60 }} />
                    <Text style={styles.headerTitle}>ServiceHub</Text>
                    {onSkip ? (
                        <TouchableOpacity onPress={onSkip}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 60 }} />
                    )}
                </View>

                {/* Logo and Illustration */}
                <View style={styles.illustrationContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="phone-portrait-outline" size={48} color={Colors.primary} />
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Enter your phone number</Text>
                    <Text style={styles.subtitle}>We will send you a verification code to confirm your number</Text>
                </View>

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                    <View style={styles.phoneInputWrapper}>
                        <View style={styles.countryCode}>
                            <Text style={styles.flag}>🇮🇳</Text>
                            <Text style={styles.countryCodeText}>+91</Text>
                            <Ionicons name="chevron-down" size={16} color={Colors.gray[500]} />
                        </View>
                        <View style={styles.phoneInput}>
                            <Input
                                placeholder="Phone number"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={phone}
                                onChangeText={(text:string) => {
                                    setPhone(text.replace(/[^0-9]/g, ""))
                                    setError("")
                                }}
                                error={error}
                                containerStyle={{ marginBottom: 0, flex: 1 }}
                            />
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <View style={styles.buttonContainer}>
                    <Button title="Continue" onPress={handleSubmit} fullWidth disabled={phone.length !== 10} size="lg" />
                </View>

                {/* Terms */}
                <Text style={styles.terms}>
                    By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.primary,
    },
    skipText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: "500",
    },
    illustrationContainer: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 32,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.gray[50],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    titleContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: Colors.gray[900],
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.gray[500],
        textAlign: "center",
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 24,
    },
    phoneInputWrapper: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    countryCode: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.gray[50],
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 14,
        gap: 6,
    },
    flag: {
        fontSize: 20,
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: "500",
        color: Colors.gray[900],
    },
    phoneInput: {
        flex: 1,
    },
    buttonContainer: {
        marginBottom: 24,
    },
    terms: {
        fontSize: 13,
        color: Colors.gray[500],
        textAlign: "center",
        lineHeight: 20,
    },
    termsLink: {
        color: Colors.primary,
        fontWeight: "500",
    },
})
