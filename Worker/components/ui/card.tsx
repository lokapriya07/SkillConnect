// import React from "react";
// import { View, StyleSheet, ViewStyle } from "react-native";

// interface CardProps {
//   children: React.ReactNode;
//   style?: ViewStyle;
// }

// export const Card: React.FC<CardProps> = ({ children, style }) => {
//   return <View style={[styles.card, style]}>{children}</View>;
// };

// export const CardContent: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => {
//   return <View style={[styles.content, style]}>{children}</View>;
// };



// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 8,
//     marginVertical: 8,
//     marginHorizontal: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   content: {
//     padding: 8,
//   },
// });


// components/ui/Card.tsx
import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

interface CardTextProps {
  children: React.ReactNode;
  style?: TextStyle;
}

// Main Card wrapper
export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

// Card content with padding
export const CardContent: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

// Card header, usually holds title and description
export const CardHeader: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.header, style]}>{children}</View>;
};

// Card title, larger bold text
export const CardTitle: React.FC<CardTextProps> = ({ children, style }) => {
  return <Text style={[styles.title, style]}>{children}</Text>;
};

// Card description, smaller muted text
export const CardDescription: React.FC<CardTextProps> = ({ children, style }) => {
  return <Text style={[styles.description, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  content: {
    padding: 12,
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb", // light gray
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827", // dark text
  },
  description: {
    fontSize: 12,
    color: "#6b7280", // muted gray
    marginTop: 2,
  },
});
