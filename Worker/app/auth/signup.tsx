// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// // --- Configuration ---
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

// // --- Types ---
// type Role = "client" | "worker";

// const colors = {
//   background: "#F0F4F8",
//   cardBg: "#FFFFFF",
//   primaryBlue: "#0066CC",
//   darkText: "#1A2A3A",
//   mutedText: "#6E7A8A",
//   inputBorder: "#DCE6F1",
//   lightBlue: "#E1F0FF",
// };

// export default function Signup() {
//   const router = useRouter();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   // Fixed to 'worker' for the Worker folder app
//   const [role, setRole] = useState<Role>("worker"); 
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!API_URL) {
//       console.error(
//         "❌ SIGNUP ERROR: API_URL is undefined. Run 'npx expo start -c'",
//       );
//     }
//   }, []);

//   async function handleSignup() {
//     if (!name.trim() || !email.trim() || !password.trim()) {
//       Alert.alert("Missing Info", "Please fill in all details.");
//       return;
//     }

//     if (!API_URL) {
//       Alert.alert("Config Error", "API URL not found in .env");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(`${API_URL}/api/auth/signup`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: name.trim(),
//           email: email.toLowerCase().trim(),
//           password,
//           role, // This sends "worker" to the skillconnect database
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Account Created", `Successfully joined as a ${role}`, [
//           {
//             text: "Go to Login",
//             onPress: () => router.replace("/auth/login"),
//           },
//         ]);
//       } else {
//         Alert.alert("Signup Failed", data.msg || "Server error");
//       }
//     } catch (error) {
//       Alert.alert(
//         "Network Error",
//         "Cannot connect to server. Check IP in .env and Wi-Fi.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={styles.container}
//     >
//       <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

//       <View style={styles.contentContainer}>
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
          
//           {/* ---------- HEADER ---------- */}
//           <View style={styles.header}>
//             <View style={styles.logoContainer}>
//               <Ionicons
//                 name="construct-outline"
//                 size={40}
//                 color={colors.primaryBlue}
//               />
//             </View>
//             <Text style={styles.title}>Worker Signup</Text>
//             <Text style={styles.subtitle}>Showcase your skills today</Text>
//           </View>

//           {/* ---------- CARD ---------- */}
//           <View style={styles.card}>
//             <Text style={styles.inputLabel}>Full Name</Text>
//             <View style={styles.inputContainer}>
//               <Ionicons name="person-outline" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
//               <TextInput
//                 placeholder="John Doe"
//                 value={name}
//                 onChangeText={setName}
//                 style={styles.input}
//                 editable={!loading}
//               />
//             </View>

//             <Text style={styles.inputLabel}>Email</Text>
//             <View style={styles.inputContainer}>
//               <Ionicons name="mail-outline" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
//               <TextInput
//                 placeholder="worker@example.com"
//                 value={email}
//                 onChangeText={setEmail}
//                 style={styles.input}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 editable={!loading}
//               />
//             </View>

//             <Text style={styles.inputLabel}>Password</Text>
//             <View style={styles.inputContainer}>
//               <Ionicons name="lock-closed-outline" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
//               <TextInput
//                 placeholder="Create a password"
//                 value={password}
//                 onChangeText={setPassword}
//                 style={styles.input}
//                 secureTextEntry={!showPassword}
//                 editable={!loading}
//               />
//               <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                 <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={colors.mutedText} />
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               style={[styles.primaryButton, loading && { opacity: 0.7 }]}
//               onPress={handleSignup}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#FFF" />
//               ) : (
//                 <Text style={styles.primaryButtonText}>Create Worker Account</Text>
//               )}
//             </TouchableOpacity>
//           </View>

//           <View style={styles.footer}>
//             <Text style={styles.footerText}>Already have an account?</Text>
//             <TouchableOpacity onPress={() => router.replace("/auth/login")}>
//               <Text style={styles.loginText}> Log In</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.background },
//   contentContainer: { flex: 1 },
//   scrollContent: { flexGrow: 1, justifyContent: "center", padding: 25 },
//   rolePicker: { flexDirection: 'row', backgroundColor: '#E1F0FF', borderRadius: 12, padding: 5, marginBottom: 25 },
//   roleBtn: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10 },
//   activeBtn: { backgroundColor: colors.primaryBlue },
//   roleText: { color: colors.primaryBlue, fontWeight: 'bold' },
//   activeText: { color: '#FFF' },
//   header: { alignItems: "center", marginBottom: 30 },
//   logoContainer: { backgroundColor: colors.lightBlue, padding: 15, borderRadius: 50, marginBottom: 15 },
//   title: { fontSize: 28, fontWeight: "bold", color: colors.darkText },
//   subtitle: { fontSize: 16, color: colors.mutedText, marginTop: 5 },
//   card: { backgroundColor: colors.cardBg, borderRadius: 20, padding: 25, elevation: 5 },
//   inputLabel: { color: colors.darkText, fontSize: 14, fontWeight: "600", marginBottom: 8, marginLeft: 5 },
//   inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: colors.inputBorder, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, height: 55 },
//   inputIcon: { marginRight: 12 },
//   input: { flex: 1, fontSize: 16, color: colors.darkText },
//   primaryButton: { backgroundColor: colors.primaryBlue, borderRadius: 12, height: 55, justifyContent: "center", alignItems: "center" },
//   primaryButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
//   footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
//   footerText: { color: colors.mutedText, fontSize: 15 },
//   loginText: { color: colors.primaryBlue, fontWeight: "bold", fontSize: 15 },
// });
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- Configuration ---
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// --- Types ---
type Role = "client" | "worker";

const colors = {
  background: "#F0F4F8",
  cardBg: "#FFFFFF",
  primaryBlue: "#0066CC",
  darkText: "#1A2A3A",
  mutedText: "#6E7A8A",
  inputBorder: "#DCE6F1",
  lightBlue: "#E1F0FF",
};

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // Added phone state
  const [password, setPassword] = useState("");
  // Fixed to 'worker' for the Worker folder app
  const [role, setRole] = useState<Role>("worker"); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!API_URL) {
      console.error(
        "❌ SIGNUP ERROR: API_URL is undefined. Run 'npx expo start -c'",
      );
    }
  }, []);

  async function handleSignup() {
    // Added phone.trim() to validation
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Missing Info", "Please fill in all details.");
      return;
    }

    if (!API_URL) {
      Alert.alert("Config Error", "API URL not found in .env");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(), // Sending phone to skillconnect database
          password,
          role, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Account Created", `Successfully joined as a ${role}`, [
          {
            text: "Go to Login",
            onPress: () => router.replace("/auth/login"),
          },
        ]);
      } else {
        Alert.alert("Signup Failed", data.msg || "Server error");
      }
    } catch (error) {
      Alert.alert(
        "Network Error",
        "Cannot connect to server. Check IP in .env and Wi-Fi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* ---------- HEADER ---------- */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="construct-outline"
                size={40}
                color={colors.primaryBlue}
              />
            </View>
            <Text style={styles.title}>Worker Signup</Text>
            <Text style={styles.subtitle}>Showcase your skills today</Text>
          </View>

          {/* ---------- CARD ---------- */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
              <TextInput
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                style={styles.input}
                editable={!loading}
              />
            </View>

            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
              <TextInput
                placeholder="worker@example.com"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* ---------- PHONE NUMBER INPUT ---------- */}
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
              <TextInput
                placeholder="+1 234 567 890"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primaryBlue} style={styles.inputIcon} />
              <TextInput
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={colors.mutedText} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Worker Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/auth/login")}>
              <Text style={styles.loginText}> Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 25 },
  header: { alignItems: "center", marginBottom: 30 },
  logoContainer: { backgroundColor: colors.lightBlue, padding: 15, borderRadius: 50, marginBottom: 15 },
  title: { fontSize: 28, fontWeight: "bold", color: colors.darkText },
  subtitle: { fontSize: 16, color: colors.mutedText, marginTop: 5 },
  card: { backgroundColor: colors.cardBg, borderRadius: 20, padding: 25, elevation: 5 },
  inputLabel: { color: colors.darkText, fontSize: 14, fontWeight: "600", marginBottom: 8, marginLeft: 5 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: colors.inputBorder, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, height: 55 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: colors.darkText },
  primaryButton: { backgroundColor: colors.primaryBlue, borderRadius: 12, height: 55, justifyContent: "center", alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  footerText: { color: colors.mutedText, fontSize: 15 },
  loginText: { color: colors.primaryBlue, fontWeight: "bold", fontSize: 15 },
});