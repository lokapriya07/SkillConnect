// import { useAppStore } from "@/lib/store";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     KeyboardAvoidingView,
//     Platform,
//     StatusBar,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";

// const API_URL = process.env.EXPO_PUBLIC_API_URL;

// const colors = {
//   background: "#F0F4F8",
//   cardBg: "#FFFFFF",
//   primaryBlue: "#0066CC",
//   darkText: "#1A2A3A",
//   mutedText: "#6E7A8A",
//   inputBorder: "#DCE6F1",
// };

// export default function Login() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { setAuthenticated, setUser } = useAppStore();

//   useEffect(() => {
//     if (!API_URL) {
//       console.warn("⚠️ EXPO_PUBLIC_API_URL is missing! Check your .env file.");
//     }
//   }, []);

//   async function handleLogin() {
//     if (!email.trim() || !password.trim()) {
//       Alert.alert("Required", "Please enter your email and password.");
//       return;
//     }

//     if (!API_URL) {
//       Alert.alert(
//         "Config Error",
//         "API URL not found. Restart with: npx expo start -c",
//       );
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: email.toLowerCase().trim(),
//           password: password,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setAuthenticated(true);
//         setUser({
//           name: data.user.name,
//           email: data.user.email,
//           phone: data.user.phone || "",
//         });
//         router.replace("/welcome");
//       } else {
//         Alert.alert("Login Failed", data.msg || "Check your credentials.");
//       }
//     } catch (error) {
//       Alert.alert("Error", "Cannot reach server. Check Wi-Fi and IP address.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={styles.container}
//     >
//       <StatusBar barStyle="dark-content" />
//       <View style={styles.contentContainer}>
//         <View style={styles.header}>
//           <View style={styles.logoContainer}>
//             <Ionicons name="water" size={40} color={colors.primaryBlue} />
//           </View>
//           <Text style={styles.title}>Welcome Back</Text>
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.inputLabel}>Email</Text>
//           <View style={styles.inputContainer}>
//             <Ionicons
//               name="mail-outline"
//               size={20}
//               color={colors.primaryBlue}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               placeholder="name@example.com"
//               value={email}
//               onChangeText={setEmail}
//               style={styles.input}
//               autoCapitalize="none"
//               keyboardType="email-address"
//               editable={!loading}
//             />
//           </View>

//           <Text style={styles.inputLabel}>Password</Text>
//           <View style={styles.inputContainer}>
//             <Ionicons
//               name="lock-closed-outline"
//               size={20}
//               color={colors.primaryBlue}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               placeholder="Enter password"
//               value={password}
//               onChangeText={setPassword}
//               style={styles.input}
//               secureTextEntry={!showPassword}
//               editable={!loading}
//             />
//             <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//               <Ionicons
//                 name={showPassword ? "eye-outline" : "eye-off-outline"}
//                 size={22}
//                 color={colors.mutedText}
//               />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={[styles.primaryButton, loading && { opacity: 0.7 }]}
//             onPress={handleLogin}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#FFF" />
//             ) : (
//               <Text style={styles.primaryButtonText}>Sign In</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         <View style={styles.footer}>
//           <Text style={styles.footerText}>Don't have an account?</Text>
//           <TouchableOpacity onPress={() => router.push("/auth/signup")}>
//             <Text style={styles.signupText}> Create Account</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.background },
//   contentContainer: { flex: 1, justifyContent: "center", padding: 25 },
//   header: { alignItems: "center", marginBottom: 30 },
//   logoContainer: {
//     backgroundColor: "#E1F0FF",
//     padding: 15,
//     borderRadius: 50,
//     marginBottom: 15,
//   },
//   title: { fontSize: 28, fontWeight: "bold", color: colors.darkText },
//   card: {
//     backgroundColor: colors.cardBg,
//     borderRadius: 20,
//     padding: 25,
//     elevation: 5,
//   },
//   inputLabel: {
//     color: colors.darkText,
//     fontSize: 14,
//     fontWeight: "600",
//     marginBottom: 8,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8FAFC",
//     borderWidth: 1.5,
//     borderColor: colors.inputBorder,
//     borderRadius: 12,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     height: 55,
//   },
//   inputIcon: { marginRight: 12 },
//   input: { flex: 1, fontSize: 16, color: colors.darkText, height: "100%" },
//   primaryButton: {
//     backgroundColor: colors.primaryBlue,
//     borderRadius: 12,
//     height: 55,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   primaryButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
//   footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
//   footerText: { color: colors.mutedText, fontSize: 15 },
//   signupText: { color: colors.primaryBlue, fontWeight: "bold", fontSize: 15 },
// });
import { useAppStore } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- Configuration ---
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const colors = {
  background: "#F0F4F8",
  cardBg: "#FFFFFF",
  primaryBlue: "#0066CC",
  darkText: "#1A2A3A",
  mutedText: "#6E7A8A",
  inputBorder: "#DCE6F1",
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Destructuring store methods
  const { setAuthenticated, setUser } = useAppStore();

  useEffect(() => {
    if (!API_URL) {
      console.warn("⚠️ EXPO_PUBLIC_API_URL is missing! Check your .env file.");
    }
  }, []);

  async function handleLogin() {
    // 1. Client-side Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }

    if (!API_URL) {
      Alert.alert(
        "Config Error",
        "API URL not found. Restart with: npx expo start -c",
      );
      return;
    }

    setLoading(true);

    try {
      // 2. API Call with Role Validation
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
          role: "client", // <--- CRITICAL: Identifies this app as the User/Client portal
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Success: Update Global State
        setAuthenticated(true);
        setUser({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
          role: data.user.role, // Storing the role returned by the backend
        });
        
        router.replace("/welcome");
      } else {
        // 4. Handle Role Mismatch or Wrong Credentials
        // Backend will return 403 if a 'worker' tries to login here
        Alert.alert("Login Failed", data.msg || "Check your credentials.");
      }
    } catch (error) {
      Alert.alert("Error", "Cannot reach server. Check Wi-Fi and IP address.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="water" size={40} color={colors.primaryBlue} />
          </View>
          <Text style={styles.title}>User Login</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.primaryBlue}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.primaryBlue}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color={colors.mutedText}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/signup")}>
            <Text style={styles.signupText}> Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { flex: 1, justifyContent: "center", padding: 25 },
  header: { alignItems: "center", marginBottom: 30 },
  logoContainer: {
    backgroundColor: "#E1F0FF",
    padding: 15,
    borderRadius: 50,
    marginBottom: 15,
  },
  title: { fontSize: 28, fontWeight: "bold", color: colors.darkText },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 25,
    elevation: 5,
  },
  inputLabel: {
    color: colors.darkText,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 55,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: colors.darkText, height: "100%" },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  footerText: { color: colors.mutedText, fontSize: 15 },
  signupText: { color: colors.primaryBlue, fontWeight: "bold", fontSize: 15 },
});