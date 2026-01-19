import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'
import { useAppStore } from '@/lib/store'
import * as ImagePicker from 'expo-image-picker'

export default function EditProfileScreen() {
    const router = useRouter()
    const { user, updateUser } = useAppStore()

    // Local state initialized from store
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face')
    const [isLoading, setIsLoading] = useState(false)

    // Sync with store on mount
    useEffect(() => {
        if (user) {
            setName(user.name || '')
            setPhone(user.phone || '')
            setEmail(user.email || '')
        }
    }, [user])

    // Pick profile image
    const pickProfileImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photos.')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (!result.canceled) {
            setAvatar(result.assets[0].uri)
        }
    }

    const saveProfile = async () => {
        if (!phone.trim()) {
            Alert.alert('Error', 'Phone number is required.')
            return
        }

        setIsLoading(true)
        try {
            updateUser({
                name: name.trim() || undefined,
                phone: phone.trim(),
                email: email.trim() || undefined
            })

            Alert.alert('Success', 'Profile updated successfully!', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ])
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                    onPress={saveProfile}
                    disabled={isLoading}
                >
                    <Text style={styles.saveButtonText}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Image - EXACTLY like your screenshot */}
                <View style={styles.profileImageSection}>
                    <TouchableOpacity style={styles.profileImageContainer} onPress={pickProfileImage}>
                        <Image source={{ uri: avatar }} style={styles.profileImage} />
                        <View style={styles.editImageOverlay}>
                            <Ionicons name="camera-outline" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Tap to change photo</Text>
                </View>

                {/* Name Field */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                        autoCapitalize="words"
                    />
                </View>

                {/* Phone Field - REQUIRED */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.textInput, !phone && styles.errorInput]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Email Field */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email (Optional)</Text>
                    <TextInput
                        style={styles.textInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    <View style={styles.infoItem}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
                        <Text style={styles.infoText}>Your data is securely stored</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
                        <Text style={styles.infoText}>Changes sync across devices</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background || '#f8f9fa'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary || '#2563eb',
        // Reduced paddingTop and paddingBottom
        paddingTop: Platform.OS === 'android' ? 20 : 50,
        paddingBottom: 12,
        paddingHorizontal: 20
    },
    backButton: {
        padding: 8,
        marginRight: 15
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center'
    },
    saveButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc'
    },
    saveButtonText: {
        color: Colors.primary || '#2563eb',
        fontSize: 14,
        fontWeight: '600'
    },
    content: {
        flex: 1,
        padding: 20
    },
    // EXACT PROFILE IMAGE STYLES - Matches your screenshot
    profileImageSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: '#f1f5f9',
        backgroundColor: '#f1f5f9'
    },
    editImageOverlay: {
        position: 'absolute',
        bottom: -8,        // Slightly overlapping bottom edge
        right: -8,         // Slightly overlapping right edge
        backgroundColor: Colors.primary || '#3b82f6',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    changePhotoText: {
        fontSize: 14,
        color: Colors.textSecondary || '#6b7280',
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text || '#111',
        marginBottom: 8
    },
    required: {
        color: '#ef4444'
    },
    textInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text || '#111',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1
    },
    errorInput: {
        borderColor: '#ef4444'
    },
    infoSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginTop: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text || '#111',
        marginBottom: 15
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary || '#6b7280',
        marginLeft: 12,
        flex: 1
    }
})
