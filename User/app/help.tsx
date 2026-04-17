// import { useRouter } from "expo-router";
// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { Colors } from '@/constants/Colors';
// import { useAppStore } from '@/lib/store';

// // Enable LayoutAnimation for Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// const HelpSupport = () => {
//     const darkMode = useAppStore((state) => state.darkMode);
//     const router = useRouter();
//     const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

//     const faqs = [
//         {
//             question: "How do I cancel my booking?",
//             answer: "You can cancel your booking up to 2 hours before the scheduled time through the 'My Bookings' section. A full refund will be processed to your original payment method."
//         },
//         {
//             question: "My payment failed but money was deducted.",
//             answer: "Don't worry! This usually happens due to banking delays. The amount is typically refunded automatically within 3-5 business days. If not, please share your transaction ID with us via Live Chat."
//         },
//         {
//             question: "What if the professional doesn't arrive?",
//             answer: "If your service provider is more than 15 minutes late, you can call them directly through the app. If they are unreachable, contact support and we will reassign your task immediately."
//         },
//         {
//             question: "How are the service prices calculated?",
//             answer: "Prices are based on the standard market rates for the specific service, the complexity of the task, and the estimated time required for completion."
//         },
//         {
//             question: "Is there a warranty on the services?",
//             answer: "Yes! Most of our repair services come with a 30-day service guarantee. If the issue persists after our professional leaves, we will fix it for free."
//         }
//     ];

//     const toggleExpand = (index: number) => {
//         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//         setExpandedIndex(expandedIndex === index ? null : index);
//     };

//     const styles = getStyles(darkMode);

//     return (
//         <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//             {/* Header Section */}
//             <View style={styles.headerGradient}>
//                 <Text style={styles.headerTitle}>How can we help?</Text>
                
//             </View>

//             <View style={styles.content}>
//                 {/* Quick Contact Options */}
//                 <Text style={styles.sectionTitle}>Quick Support</Text>
//                 <View style={styles.row}>
//                     <TouchableOpacity style={styles.supportBox}>
//                         <View style={[styles.iconCircle, { backgroundColor: darkMode ? '#1E3A5F' : Colors.primaryLight }]}>
//                             <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
//                         </View>
//                         <Text style={styles.supportText}>Live Chat</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.supportBox}>
//                         <View style={[styles.iconCircle, { backgroundColor: darkMode ? '#1E3A5F' : '#E8F5E9' }]}>
//                             <Ionicons name="call" size={24} color="#4CAF50" />
//                         </View>
//                         <Text style={styles.supportText}>Call Us</Text>
//                     </TouchableOpacity>
//                 </View>

//                 {/* FAQ Section with Answers */}
//                 <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
//                 {faqs.map((faq, i) => (
//                     <View key={i} style={styles.faqWrapper}>
//                         <TouchableOpacity
//                             style={[styles.faqItem, expandedIndex === i && styles.faqItemActive]}
//                             onPress={() => toggleExpand(i)}
//                             activeOpacity={0.7}
//                         >
//                             <Text style={styles.faqText}>{faq.question}</Text>
//                             <Ionicons
//                                 name={expandedIndex === i ? "remove" : "add"}
//                                 size={20}
//                                 color={Colors.primary}
//                             />
//                         </TouchableOpacity>

//                         {expandedIndex === i && (
//                             <View style={styles.answerContainer}>
//                                 <Text style={styles.answerText}>{faq.answer}</Text>
//                             </View>
//                         )}
//                     </View>
//                 ))}

//                 <View style={styles.footerInfo}>
//                     <Text style={styles.footerText}>Still need help?</Text>
//                     <Text style={styles.emailText}>support@skillconnect.com</Text>
//                 </View>
//             </View>
//             <View style={{ height: 40 }} />
//         </ScrollView>
//     );
// };

// const getStyles = (darkMode: boolean) => StyleSheet.create({
//     container: { flex: 1, backgroundColor: darkMode ? Colors.backgroundDark : Colors.background },
//     headerGradient: {
//         backgroundColor: Colors.primary,
//         padding: 30,
//         paddingTop: 60,
//         borderBottomLeftRadius: 30,
//         borderBottomRightRadius: 30
//     },
//     headerTitle: { fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 20 },
//     searchBar: {
//         flexDirection: 'row',
//         backgroundColor: darkMode ? Colors.surfaceDark : 'white',
//         borderRadius: 15,
//         padding: 12,
//         alignItems: 'center',
//         elevation: 5,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     input: { marginLeft: 10, flex: 1, fontSize: 16, color: darkMode ? Colors.textDark : Colors.text },
//     content: { padding: 20 },
//     sectionTitle: { fontSize: 18, fontWeight: '700', color: darkMode ? Colors.textDark : Colors.text, marginVertical: 15 },
//     row: { flexDirection: 'row', gap: 15 },
//     supportBox: {
//         flex: 1,
//         backgroundColor: darkMode ? Colors.surfaceDark : 'white',
//         padding: 16,
//         borderRadius: 20,
//         alignItems: 'center',
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 2,
//     },
//     iconCircle: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 8
//     },
//     supportText: { fontSize: 14, fontWeight: '600', color: darkMode ? Colors.textDark : Colors.text },
//     faqWrapper: {
//         marginBottom: 10,
//         backgroundColor: darkMode ? Colors.surfaceDark : 'white',
//         borderRadius: 15,
//         overflow: 'hidden',
//         elevation: 1,
//     },
//     faqItem: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         padding: 20,
//         alignItems: 'center'
//     },
//     faqItemActive: {
//         borderBottomWidth: 1,
//         borderBottomColor: darkMode ? Colors.borderDark : '#F5F5F5',
//     },
//     faqText: { fontSize: 15, fontWeight: '600', color: darkMode ? Colors.textDark : Colors.text, flex: 0.9 },
//     answerContainer: {
//         padding: 20,
//         backgroundColor: darkMode ? '#2C2C2E' : '#FAFAFA',
//     },
//     answerText: {
//         fontSize: 14,
//         color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
//         lineHeight: 20,
//     },
//     footerInfo: {
//         alignItems: 'center',
//         marginTop: 30,
//         padding: 20,
//     },
//     footerText: {
//         fontSize: 14,
//         color: darkMode ? Colors.textSecondaryDark : Colors.textSecondary,
//     },
//     emailText: {
//         fontSize: 16,
//         fontWeight: '700',
//         color: Colors.primary,
//         marginTop: 5,
//     }
// });

// export default HelpSupport;


// import { useRouter } from "expo-router";
// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { Colors } from '@/constants/Colors';
// import { useAppStore } from '@/lib/store';

// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// const HelpSupport = () => {
//     const darkMode = useAppStore((state) => state.darkMode);
//     const router = useRouter();
//     const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

//     const faqs = [
//         {
//             question: "How do I cancel my booking?",
//             answer: "You can cancel your booking up to 2 hours before the scheduled time through the 'My Bookings' section. A full refund will be processed to your original payment method."
//         },
//         {
//             question: "My payment failed but money was deducted.",
//             answer: "Don't worry! This usually happens due to banking delays. The amount is typically refunded automatically within 3-5 business days. If not, please share your transaction ID with us via Live Chat."
//         },
//         {
//             question: "What if the professional doesn't arrive?",
//             answer: "If your service provider is more than 15 minutes late, you can call them directly through the app. If they are unreachable, contact support and we will reassign your task immediately."
//         },
//         {
//             question: "How are the service prices calculated?",
//             answer: "Prices are based on the standard market rates for the specific service, the complexity of the task, and the estimated time required for completion."
//         },
//         {
//             question: "Is there a warranty on the services?",
//             answer: "Yes! Most of our repair services come with a 30-day service guarantee. If the issue persists after our professional leaves, we will fix it for free."
//         }
//     ];

//     const toggleExpand = (index: number) => {
//         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//         setExpandedIndex(expandedIndex === index ? null : index);
//     };

//     const styles = getStyles(darkMode);

//     return (
//         <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

//             {/* HEADER */}
//             <View style={styles.headerGradient}>
//                 <Text style={styles.headerTitle}>How can we help?</Text>
//             </View>

//             <View style={styles.content}>

//                 {/* QUICK SUPPORT */}
//                 <Text style={styles.sectionTitle}>Quick Support</Text>

//                 <View style={styles.row}>

//                     {/* ✅ LIVE CHAT FIXED */}
//                     <TouchableOpacity
//                         style={styles.supportBox}
//                         onPress={() => {
//                             router.push({
//                                 pathname: "/chat",
//                                 params: {
//                                     workerId: "support",
//                                     workerName: "Support Team"
//                                 }
//                             });
//                         }}
//                     >
//                         <View style={[styles.iconCircle, { backgroundColor: darkMode ? '#1E3A5F' : Colors.primaryLight }]}>
//                             <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
//                         </View>
//                         <Text style={styles.supportText}>Live Chat</Text>
//                     </TouchableOpacity>

//                     {/* ✅ CALL BUTTON FIXED */}
//                     <TouchableOpacity
//                         style={styles.supportBox}
//                         onPress={() => {
//                             console.log("Call clicked");
//                         }}
//                     >
//                         <View style={[styles.iconCircle, { backgroundColor: darkMode ? '#1E3A5F' : '#E8F5E9' }]}>
//                             <Ionicons name="call" size={24} color="#4CAF50" />
//                         </View>
//                         <Text style={styles.supportText}>Call Us</Text>
//                     </TouchableOpacity>

//                 </View>

//                 {/* FAQ SECTION */}
//                 <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

//                 {faqs.map((faq, i) => (
//                     <View key={i} style={styles.faqWrapper}>
//                         <TouchableOpacity
//                             style={[styles.faqItem, expandedIndex === i && styles.faqItemActive]}
//                             onPress={() => toggleExpand(i)}
//                         >
//                             <Text style={styles.faqText}>{faq.question}</Text>
//                             <Ionicons
//                                 name={expandedIndex === i ? "remove" : "add"}
//                                 size={20}
//                                 color={Colors.primary}
//                             />
//                         </TouchableOpacity>

//                         {expandedIndex === i && (
//                             <View style={styles.answerContainer}>
//                                 <Text style={styles.answerText}>{faq.answer}</Text>
//                             </View>
//                         )}
//                     </View>
//                 ))}

//                 <View style={styles.footerInfo}>
//                     <Text style={styles.footerText}>Still need help?</Text>
//                     <Text style={styles.emailText}>support@skillconnect.com</Text>
//                 </View>

//             </View>

//             <View style={{ height: 40 }} />
//         </ScrollView>
//     );
// };

// export default HelpSupport;
// const getStyles = (darkMode: boolean) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: darkMode ? "#121212" : "#FFFFFF",
//     },

//     headerGradient: {
//       backgroundColor: Colors.primary,
//       padding: 30,
//       paddingTop: 60,
//       borderBottomLeftRadius: 30,
//       borderBottomRightRadius: 30,
//     },

//     headerTitle: {
//       fontSize: 26,
//       fontWeight: "bold",
//       color: "#fff",
//     },

//     content: {
//       padding: 20,
//     },

//     sectionTitle: {
//       fontSize: 18,
//       fontWeight: "700",
//       marginVertical: 15,
//       color: darkMode ? "#fff" : "#000",
//     },

//     row: {
//       flexDirection: "row",
//       gap: 15,
//     },

//     supportBox: {
//       flex: 1,
//       backgroundColor: darkMode ? "#1E1E1E" : "#fff",
//       padding: 16,
//       borderRadius: 20,
//       alignItems: "center",
//       elevation: 2,
//     },

//     iconCircle: {
//       width: 50,
//       height: 50,
//       borderRadius: 25,
//       justifyContent: "center",
//       alignItems: "center",
//       marginBottom: 8,
//     },

//     supportText: {
//       fontSize: 14,
//       fontWeight: "600",
//       color: darkMode ? "#fff" : "#000",
//     },

//     faqWrapper: {
//       marginBottom: 10,
//       backgroundColor: darkMode ? "#1E1E1E" : "#fff",
//       borderRadius: 15,
//       overflow: "hidden",
//     },

//     faqItem: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       padding: 20,
//       alignItems: "center",
//     },

//     faqItemActive: {
//       borderBottomWidth: 1,
//       borderBottomColor: "#333",
//     },

//     faqText: {
//       fontSize: 15,
//       fontWeight: "600",
//       flex: 0.9,
//       color: darkMode ? "#fff" : "#000",
//     },

//     answerContainer: {
//       padding: 20,
//       backgroundColor: darkMode ? "#2C2C2C" : "#FAFAFA",
//     },

//     answerText: {
//       fontSize: 14,
//       color: darkMode ? "#ccc" : "#555",
//     },

//     footerInfo: {
//       alignItems: "center",
//       marginTop: 30,
//       padding: 20,
//     },

//     footerText: {
//       color: darkMode ? "#ccc" : "#555",
//     },

//     emailText: {
//       fontSize: 16,
//       fontWeight: "700",
//       color: Colors.primary,
//       marginTop: 5,
//     },
//   });



import { useRouter } from "expo-router";
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import * as Linking from "expo-linking";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/lib/store';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HelpSupport = () => {
  const darkMode = useAppStore((state) => state.darkMode);
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // ✅ Dynamic Support Number (can come from API later)
  const supportPhone = "1600009751";

  const handleCall = async () => {
    try {
      const url = `tel:${supportPhone}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        alert("Calling not supported on this device");
      }
    } catch (error) {
      console.log("Call error:", error);
    }
  };

  const faqs = [
    {
      question: "How do I cancel my booking?",
      answer: "You can cancel your booking up to 2 hours before the scheduled time."
    },
    {
      question: "My payment failed but money was deducted.",
      answer: "Amount will be refunded within 3-5 business days."
    },
    {
      question: "What if the professional doesn't arrive?",
      answer: "Contact support and we will reassign your task."
    },
    {
      question: "How are the service prices calculated?",
      answer: "Based on service type, complexity, and time required."
    },
    {
      question: "Is there a warranty on the services?",
      answer: "Yes, most services include a 30-day guarantee."
    }
  ];

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const styles = getStyles(darkMode);

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.headerGradient}>
        <Text style={styles.headerTitle}>How can we help?</Text>
      </View>

      <View style={styles.content}>

        {/* QUICK SUPPORT */}
        <Text style={styles.sectionTitle}>Quick Support</Text>

        <View style={styles.row}>

          {/* LIVE CHAT */}
          <TouchableOpacity
            style={styles.supportBox}
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: {
                  workerId: "support",
                  workerName: "Support Team",
                  workerPhone: supportPhone
                }
              })
            }
          >
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.supportText}>Live Chat</Text>
          </TouchableOpacity>

          {/* CALL BUTTON */}
          <TouchableOpacity
            style={styles.supportBox}
            onPress={handleCall}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="call" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.supportText}>Call Us</Text>
          </TouchableOpacity>

        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {faqs.map((faq, i) => (
          <View key={i} style={styles.faqWrapper}>
            <TouchableOpacity
              style={styles.faqItem}
              onPress={() => toggleExpand(i)}
            >
              <Text style={styles.faqText}>{faq.question}</Text>
              <Ionicons
                name={expandedIndex === i ? "remove" : "add"}
                size={20}
                color={Colors.primary}
              />
            </TouchableOpacity>

            {expandedIndex === i && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}

      </View>
    </ScrollView>
  );
};

export default HelpSupport;

const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: darkMode ? "#121212" : "#fff" },

    headerGradient: {
      backgroundColor: Colors.primary,
      padding: 30,
      paddingTop: 60,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },

    headerTitle: { fontSize: 26, color: "#fff", fontWeight: "bold" },

    content: { padding: 20 },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginVertical: 15,
      color: darkMode ? "#fff" : "#000",
    },

    row: { flexDirection: "row", gap: 15 },

    supportBox: {
      flex: 1,
      backgroundColor: darkMode ? "#1E1E1E" : "#fff",
      padding: 16,
      borderRadius: 20,
      alignItems: "center",
      elevation: 2,
    },

    iconCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      backgroundColor: "#E3F2FD"
    },

    supportText: {
      fontSize: 14,
      fontWeight: "600",
      color: darkMode ? "#fff" : "#000",
    },

    faqWrapper: {
      marginBottom: 10,
      backgroundColor: darkMode ? "#1E1E1E" : "#fff",
      borderRadius: 15,
    },

    faqItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 20,
    },

    faqText: {
      fontSize: 15,
      fontWeight: "600",
      flex: 0.9,
      color: darkMode ? "#fff" : "#000",
    },

    answerContainer: {
      padding: 20,
      backgroundColor: darkMode ? "#2C2C2C" : "#FAFAFA",
    },

    answerText: {
      fontSize: 14,
      color: darkMode ? "#ccc" : "#555",
    },
  });