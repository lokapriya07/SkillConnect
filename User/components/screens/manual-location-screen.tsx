"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import  {Colors} from "@/constants/Colors"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAppStore } from "@/lib/store"

interface ManualLocationScreenProps {
  onBack: () => void
  onLocationSaved: () => void
}

export default function ManualLocationScreen({ onBack, onLocationSaved }: ManualLocationScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [addressType, setAddressType] = useState<"home" | "work" | "other">("home")
  const [fullAddress, setFullAddress] = useState("")
  const [landmark, setLandmark] = useState("")
  const { setCurrentLocation, addAddress } = useAppStore()

  const suggestedLocations = [
    "HSR Layout, Bangalore",
    "Koramangala 5th Block, Bangalore",
    "Indiranagar, Bangalore",
    "Whitefield, Bangalore",
    "Electronic City, Bangalore",
  ].filter((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleLocationSelect = (location: string) => {
    setFullAddress(location)
    setSearchQuery("")
  }

  const handleSave = () => {
    if (fullAddress) {
      setCurrentLocation({ address: fullAddress })
      addAddress({
        id: Date.now().toString(),
        type: addressType,
        fullAddress,
        landmark,
        isDefault: false,
      })
      onLocationSaved()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter Address</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color={Colors.gray[400]} />
              <Input
                placeholder="Search for area, street name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                containerStyle={styles.searchInput}
              />
            </View>
          </View>

          {/* Suggested Locations */}
          {searchQuery.length > 0 && suggestedLocations.length > 0 && (
            <View style={styles.suggestions}>
              {suggestedLocations.map((location, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleLocationSelect(location)}
                >
                  <Ionicons name="location-outline" size={20} color={Colors.gray[400]} />
                  <Text style={styles.suggestionText}>{location}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Address Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Complete Address Details</Text>

            {/* Address Type */}
            <Text style={styles.label}>Save as</Text>
            <View style={styles.typeContainer}>
              {(["home", "work", "other"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, addressType === type && styles.typeButtonActive]}
                  onPress={() => setAddressType(type)}
                >
                  <Ionicons
                    name={type === "home" ? "home" : type === "work" ? "briefcase" : "location"}
                    size={18}
                    color={addressType === type ? Colors.white : Colors.gray[600]}
                  />
                  <Text style={[styles.typeText, addressType === type && styles.typeTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Full Address */}
            <Input
              label="Full Address"
              placeholder="House/Flat No., Building Name, Street"
              value={fullAddress}
              onChangeText={setFullAddress}
              multiline
              numberOfLines={3}
              style={styles.addressInput}
            />

            {/* Landmark */}
            <Input
              label="Landmark (Optional)"
              placeholder="Nearby landmark for easy navigation"
              value={landmark}
              onChangeText={setLandmark}
            />
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button title="Save & Continue" onPress={handleSave} fullWidth disabled={!fullAddress} size="lg" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[50],
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray[900],
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    paddingVertical: 16,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  suggestions: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  suggestionText: {
    fontSize: 15,
    color: Colors.gray[700],
  },
  formSection: {
    paddingTop: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray[900],
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[700],
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[600],
  },
  typeTextActive: {
    color: Colors.white,
  },
  addressInput: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
})
