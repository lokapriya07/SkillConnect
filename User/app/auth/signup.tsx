
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

// const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
//   const [role, setRole] = useState<Role>("client"); // Default role
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   async function handleSignup() {
//     if (!name.trim() || !email.trim() || !password.trim()) {
//       Alert.alert("Missing Info", "Please fill in all details.");
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
//           role, // Sends the role selected at the top
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Account Created", `Successfully joined as a ${role}`, [
//           { text: "Go to Login", onPress: () => router.replace("/auth/login") },
//         ]);
//       } else {
//         Alert.alert("Signup Failed", data.msg || "Server error");
//       }
//     } catch (error) {
//       Alert.alert("Network Error", "Cannot reach server. Check your IP address in .env");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
//       <StatusBar barStyle="dark-content" />
//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        
//         <View style={styles.header}>
//           <Text style={styles.title}>Create Account</Text>
//           <Text style={styles.subtitle}>Sign up to get started</Text>
//         </View>



//         <View style={styles.card}>
//           <Text style={styles.inputLabel}>Full Name</Text>
//           <TextInput placeholder="John Doe" value={name} onChangeText={setName} style={styles.input} />

//           <Text style={styles.inputLabel}>Email</Text>
//           <TextInput placeholder="name@example.com" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />

//           <Text style={styles.inputLabel}>Password</Text>
//           <View style={styles.passwordContainer}>
//             <TextInput placeholder="Create a password" value={password} onChangeText={setPassword} style={styles.flexInput} secureTextEntry={!showPassword} />
//             <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//               <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={colors.mutedText} />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity style={styles.primaryButton} onPress={handleSignup} disabled={loading}>
//             {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Sign Up</Text>}
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {  backgroundColor: colors.background },
//   scrollContent: { padding: 25, flexGrow: 1, justifyContent: 'center' },
//   rolePicker: { flexDirection: 'row', backgroundColor: '#E1F0FF', borderRadius: 12, padding: 5, marginBottom: 30 },
//   roleOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
//   roleActive: { backgroundColor: colors.primaryBlue },
//   roleText: { color: colors.primaryBlue, fontWeight: 'bold' },
//   roleTextActive: { color: '#FFF' },
//   header: { alignItems: "center", marginBottom: 30 },
//   title: { fontSize: 28, fontWeight: "bold", color: colors.darkText },
//   subtitle: { fontSize: 16, color: colors.mutedText },
//   card: { top: 40, backgroundColor: colors.cardBg, borderRadius: 20, padding: 30, elevation: 5 },
//   inputLabel: { fontWeight: "600", marginBottom: 8, color: colors.darkText },
//   input: { backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: colors.inputBorder, borderRadius: 12, padding: 15, marginBottom: 20 },
//   passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: colors.inputBorder, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
//   flexInput: { flex: 1, paddingVertical: 15 },
//   primaryButton: { backgroundColor: colors.primaryBlue, borderRadius: 12, padding: 18, alignItems: "center" },
//   primaryButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
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

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
  const [role, setRole] = useState<Role>("client"); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    // Updated validation to include phone
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Missing Info", "Please fill in all details.");
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
          phone: phone.trim(), // Sending phone to backend
          password,
          role, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Account Created", `Successfully joined as a ${role}`, [
          { text: "Go to Login", onPress: () => router.replace("/auth/login") },
        ]);
      } else {
        Alert.alert("Signup Failed", data.msg || "Server error");
      }
    } catch (error) {
      Alert.alert("Network Error", "Cannot reach server. Check your IP address in .env");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput 
            placeholder="John Doe" 
            value={name} 
            onChangeText={setName} 
            style={styles.input} 
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput 
            placeholder="name@example.com" 
            value={email} 
            onChangeText={setEmail} 
            style={styles.input} 
            autoCapitalize="none" 
            keyboardType="email-address" 
          />

          {/* New Phone Number Input */}
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput 
            placeholder="+1 234 567 890" 
            value={phone} 
            onChangeText={setPhone} 
            style={styles.input} 
            keyboardType="phone-pad" 
          />

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              placeholder="Create a password" 
              value={password} 
              onChangeText={setPassword} 
              style={styles.flexInput} 
              secureTextEntry={!showPassword} 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={colors.mutedText} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 25, paddingBottom: 50, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: "center", marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "bold", color: colors.darkText },
  subtitle: { fontSize: 16, color: colors.mutedText },
  card: { backgroundColor: colors.cardBg, borderRadius: 20, padding: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  inputLabel: { fontWeight: "600", marginBottom: 8, color: colors.darkText },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: colors.inputBorder, borderRadius: 12, padding: 15, marginBottom: 20 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: colors.inputBorder, borderRadius: 12, paddingHorizontal: 15, marginBottom: 25 },
  flexInput: { flex: 1, paddingVertical: 15 },
  primaryButton: { backgroundColor: colors.primaryBlue, borderRadius: 12, padding: 18, alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});