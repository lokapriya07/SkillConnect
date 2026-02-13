import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";

export default function PhoneAuthScreen({ onSubmit, onSkip }: any) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 REAL OTP SEND LOGIC (Twilio backend)
  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      Alert.alert("Error", "Enter a 10-digit number");
      return;
    }

    const fullPhone = `+91${phone}`;

    try {
      setLoading(true);

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: fullPhone,
        }),
      });

      const data = await response.json();

      setLoading(false);

      if (data.success) {
        Alert.alert("Success", "OTP sent to " + fullPhone);

        // move to OTP screen
        onSubmit(fullPhone);
      } else {
        Alert.alert("Error", data.error || "Failed to send OTP");
      }

    } catch (err) {
      setLoading(false);
      Alert.alert("Network Error", "Server not reachable");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ServiceHub</Text>
         {onSkip && (
  <Pressable
    onPress={() => {
      console.log("SKIP BUTTON CLICKED");
      onSkip();
    }}
    hitSlop={10}
  >
    <Text style={styles.skipText}>Skip</Text>
  </Pressable>
)}

        </View>

        <View style={styles.illustrationContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="phone-portrait-outline" size={48} color="#0066CC" />
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Phone Verification</Text>
          <Text style={styles.subtitle}>Enter your 10-digit phone number</Text>
        </View>

        <View style={styles.phoneInputWrapper}>
          <View style={styles.countryCode}>
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={styles.countryCodeText}>+91</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="00000 00000"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          <Button
            title={loading ? "Sending..." : "Continue"}
            onPress={handleSendOtp}
            disabled={phone.length !== 10 || loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { flex: 1, paddingHorizontal: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#0066CC" },
  skipText: { fontSize: 16, color: "#0066CC" },
  illustrationContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0066CC",
  },
  titleContainer: { marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#6E7A8A", textAlign: "center" },
  phoneInputWrapper: { flexDirection: "row", gap: 12 },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#DCE6F1",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 6,
  },
  countryCodeText: { fontSize: 16, fontWeight: "500" },
  flag: { fontSize: 20 },
});
