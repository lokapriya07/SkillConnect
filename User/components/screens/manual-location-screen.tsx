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
  TextInput,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import  {Colors} from "@/constants/Colors"
import { Button } from "@/components/ui/Button"
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
  const darkMode = useAppStore((state) => state.darkMode)

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

  const styles = getStyles(darkMode)

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={darkMode ? Colors.textDark : Colors.gray[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter Address</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Input - Single unified box */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchIcon}>
              <Ionicons name="search" size={20} color={darkMode ? Colors.gray[400] : Colors.gray[400]} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for area, street name..."
              placeholderTextColor={darkMode ? Colors.gray[500] : Colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
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
                  <View style={styles.locationIcon}>
                    <Ionicons name="location-outline" size={20} color={Colors.primary} />
                  </View>
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
                  <View style={[styles.typeIcon, addressType === type && styles.typeIconActive]}>
                    <Ionicons
                      name={type === "home" ? "home" : type === "work" ? "briefcase" : "location"}
                      size={16}
                      color={addressType === type ? Colors.white : (darkMode ? Colors.gray[400] : Colors.gray[600])}
                    />
                  </View>
                  <Text style={[styles.typeText, addressType === type && styles.typeTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Full Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Address</Text>
              <TextInput
                style={styles.textArea}
                placeholder="House/Flat No., Building Name, Street"
                placeholderTextColor={darkMode ? Colors.gray[500] : Colors.gray[400]}
                value={fullAddress}
                onChangeText={setFullAddress}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Landmark Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nearby landmark for easy navigation"
                placeholderTextColor={darkMode ? Colors.gray[500] : Colors.gray[400]}
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, !fullAddress && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!fullAddress}
          >
            <Text style={styles.saveButtonText}>Save & Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const getStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? Colors.backgroundDark : Colors.background,
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
    borderBottomColor: darkMode ? Colors.borderDark : Colors.gray[100],
    backgroundColor: darkMode ? Colors.backgroundDark : Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkMode ? Colors.surfaceDark : Colors.gray[50],
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: darkMode ? Colors.textDark : Colors.gray[900],
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: darkMode ? Colors.surfaceDark : Colors.gray[50],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: darkMode ? Colors.borderDark : Colors.gray[200],
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: darkMode ? Colors.textDark : Colors.gray[900],
  },
  suggestions: {
    backgroundColor: darkMode ? Colors.surfaceDark : Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkMode ? Colors.borderDark : Colors.gray[200],
    marginTop: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? Colors.borderDark : Colors.gray[100],
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: darkMode ? '#1E3A5F' : '#E3F2FD',
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionText: {
    fontSize: 15,
    color: darkMode ? Colors.textDark : Colors.gray[700],
    flex: 1,
  },
  formSection: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: darkMode ? Colors.textDark : Colors.gray[900],
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: darkMode ? Colors.textSecondaryDark : Colors.gray[700],
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: darkMode ? Colors.surfaceDark : Colors.gray[100],
    borderWidth: 1,
    borderColor: darkMode ? Colors.borderDark : 'transparent',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: darkMode ? Colors.gray[700] : Colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
  },
  typeIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    color: darkMode ? Colors.textSecondaryDark : Colors.gray[600],
  },
  typeTextActive: {
    color: Colors.white,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: darkMode ? Colors.textSecondaryDark : Colors.gray[700],
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: darkMode ? Colors.surfaceDark : Colors.gray[50],
    borderWidth: 1,
    borderColor: darkMode ? Colors.borderDark : Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: darkMode ? Colors.textDark : Colors.gray[900],
  },
  textArea: {
    backgroundColor: darkMode ? Colors.surfaceDark : Colors.gray[50],
    borderWidth: 1,
    borderColor: darkMode ? Colors.borderDark : Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: darkMode ? Colors.textDark : Colors.gray[900],
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: darkMode ? Colors.borderDark : Colors.gray[100],
    backgroundColor: darkMode ? Colors.backgroundDark : Colors.background,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
})
