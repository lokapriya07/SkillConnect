import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { getPopularServices } from "@/lib/services-data";

export default function PopularServicesScreen() {
  const router = useRouter();
  const popularServices = getPopularServices();



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Popular Services</Text>
      </View>

      {/* List */}
      <FlatList
        data={popularServices}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/service/${item.id}`)}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>₹{item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 10,
  },
  image: {
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
  },
  price: {
    color: Colors.primary,
    marginTop: 4,
    fontWeight: "600",
  },
});
