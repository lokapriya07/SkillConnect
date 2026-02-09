import React, { useState, useEffect, useRef, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors"
import { useRouter } from "expo-router"
import { useAppStore } from "@/lib/store"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import * as ImagePicker from "expo-image-picker"
import { Audio } from "expo-av"
import { useVideoPlayer, VideoView } from "expo-video"

export default function CreateRequestScreen() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const darkMode = useAppStore((state) => state.darkMode)

    // --- STATE ---
    const [videoUri, setVideoUri] = useState<string | null>(null)
    const [imageUri, setImageUri] = useState<string | null>(null)
    const [audioUri, setAudioUri] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [playingAudio, setPlayingAudio] = useState(false)
    const [description, setDescription] = useState("")
    const [budget, setBudget] = useState("")
    const [loading, setLoading] = useState(false)
    const [sound, setSound] = useState<Audio.Sound | null>(null)
    const user = useAppStore((state) => state.user);
    // ✅ Use the correct keys from your Zustand store
    const { addActiveJob, currentLocation } = useAppStore()

    // 🔧 RECORDING MANAGER
    const recordingRef = useRef<Audio.Recording | null>(null)
    const isProcessingRef = useRef(false)

    // IMAGE/VIDEO PICKER
    const pickMedia = async (mediaType: 'photo' | 'video') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert("Permission needed", `Need access to gallery for ${mediaType}.`)
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: mediaType === 'photo'
                ? ImagePicker.MediaTypeOptions.Images
                : ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: mediaType === 'photo' ? [1, 1] : [16, 9],
            quality: 0.7,
            ...(mediaType === 'video' && { videoMaxDuration: 15 })
        })

        if (!result.canceled) {
            const uri = result.assets[0].uri
            if (mediaType === 'photo') {
                setImageUri(uri)
            } else {
                setVideoUri(uri)
            }
        }
    }

    const player = useVideoPlayer(videoUri, player => {
        player.loop = true
        player.muted = false
    })

    const cleanupRecording = useCallback(async () => {
        if (recordingRef.current) {
            try { await recordingRef.current.stopAndUnloadAsync() } catch (e) { }
            recordingRef.current = null
        }
    }, [])

    const startRecording = useCallback(async () => {
        if (isProcessingRef.current) return
        isProcessingRef.current = true
        try {
            await cleanupRecording()
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
            const permission = await Audio.requestPermissionsAsync()
            if (permission.status !== "granted") return
            const newRecording = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
            recordingRef.current = newRecording.recording
            setIsRecording(true)
        } catch (err: any) {
            console.error("Recording error:", err.message)
        } finally {
            isProcessingRef.current = false
        }
    }, [cleanupRecording])

    const stopRecording = useCallback(async () => {
        if (!recordingRef.current) return
        setIsRecording(false)
        try {
            await recordingRef.current.stopAndUnloadAsync()
            setAudioUri(recordingRef.current.getURI())
            recordingRef.current = null
        } catch (err) { }
    }, [])

    const playRecordedAudio = async () => {
        if (!audioUri || sound) return
        try {
            setPlayingAudio(true)
            const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true })
            setSound(newSound)
            newSound.setOnPlaybackStatusUpdate(async (status: any) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingAudio(false)
                    await newSound.unloadAsync()
                    setSound(null)
                }
            })
        } catch (error) { setPlayingAudio(false) }
    }

    useEffect(() => {
        return () => {
            cleanupRecording()
            if (sound) sound.unloadAsync().catch(() => { })
        }
    }, [])

    const handleRecordPress = () => {
        isRecording ? stopRecording() : startRecording()
    }

    // ✅ UPDATED SUBMIT LOGIC (NO CHANGES TO UI)
    // CreateRequestScreen.tsx

    const handleSubmit = async () => {
        // 📍 Validation: Handle media/description
        const hasMedia = imageUri || audioUri || videoUri;
        if (!description.trim() && !hasMedia) {
            Alert.alert("Missing Info", "Please describe the problem or record a voice note.");
            return;
        }

        if (!budget.trim()) {
            Alert.alert("Missing Info", "Please add a budget.");
            return;
        }

        // 📍 Extract Coordinates
        const lat = currentLocation?.coordinates?.lat;
        const lng = currentLocation?.coordinates?.lng;

        if (lat === undefined || lng === undefined) {
            Alert.alert("Location Not Set", "Please set your location on the home screen first.");
            return;
        }

        // 🛑 userId Fix: Try both ID formats
        const userId = user?._id || user?.id;

        if (!userId) {
            console.log("Current User Store State:", user); // Debugging
            Alert.alert("Error", "User session not found. Please log in again.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("userId", userId);
            formData.append("description", description.trim() || "Multimodal Request");
            formData.append("budget", budget.trim());
            formData.append("longitude", String(lng));
            formData.append("latitude", String(lat));

            const appendFile = (uri: string | null, fieldName: string) => {
                if (uri) {
                    const filename = uri.split('/').pop() || "upload";
                    const match = /\.(\w+)$/.exec(filename);
                    const ext = match ? match[1] : (fieldName === 'image' ? 'jpg' : fieldName === 'video' ? 'mp4' : 'm4a');
                    const type = fieldName === 'image' ? `image/${ext}` : fieldName === 'video' ? `video/${ext}` : `audio/${ext}`;

                    // @ts-ignore
                    formData.append(fieldName, { uri: uri, name: filename, type: type });
                }
            };

            appendFile(imageUri, "image");
            appendFile(audioUri, "audio");
            appendFile(videoUri, "video"); // Don't forget the video!

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/upload`, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "multipart/form-data"
                },
            });

            const result = await response.json();

            if (response.ok) {
                addActiveJob({ ...result.job, status: "finding_workers" });
                Alert.alert("Success!", "Job posted successfully!", [
                    { text: "OK", onPress: () => router.replace("/(tabs)/" as any) }
                ]);
            } else {
                Alert.alert("Upload Failed", result.error || "Server error");
            }
        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert("Connection Error", "Check your internet or server status.");
        } finally {
            setLoading(false);
        }
    };

    const styles = getStyles(darkMode);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color={Colors.text || '#000'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Request</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.helperText}>Add photo/video + voice note for faster responses</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>1. Problem Photo</Text>
                    {imageUri ? (
                        <View style={styles.mediaContainer}>
                            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setImageUri(null)}>
                                <Ionicons name="trash" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.uploadBox} onPress={() => pickMedia('photo')}>
                            <View style={styles.uploadIconCircle}>
                                <Ionicons name="camera" size={28} color={Colors.primary || '#007AFF'} />
                            </View>
                            <Text style={styles.uploadText}>Tap for Photo</Text>
                            <Text style={styles.uploadSubText}>Clear photo of problem</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>2. Problem Video (Optional)</Text>
                    {videoUri ? (
                        <View style={styles.videoContainer}>
                            <VideoView style={styles.videoPreview} player={player} contentFit="cover" />
                            <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setVideoUri(null)}>
                                <Ionicons name="trash" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.uploadBox} onPress={() => pickMedia('video')}>
                            <View style={styles.uploadIconCircle}>
                                <Ionicons name="videocam" size={28} color={Colors.primary || '#007AFF'} />
                            </View>
                            <Text style={styles.uploadText}>Tap for Video</Text>
                            <Text style={styles.uploadSubText}>Max 15 seconds</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>3. Explain it (Voice Note)</Text>
                    {!audioUri ? (
                        <TouchableOpacity
                            style={[styles.recordBtn, isRecording && styles.recordingActive]}
                            onPress={handleRecordPress}
                        >
                            <Ionicons name={isRecording ? "mic" : "mic-outline"} size={32} color={isRecording ? "white" : Colors.primary || '#007AFF'} />
                            <Text style={[styles.recordText, isRecording && { color: 'white' }]}>
                                {isRecording ? "Recording..." : "Tap to Record"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.audioPreview}>
                            <TouchableOpacity style={styles.playBtn} onPress={playRecordedAudio}>
                                <Ionicons name={playingAudio ? "pause" : "play"} size={24} color={Colors.primary || '#007AFF'} />
                            </TouchableOpacity>
                            <View style={styles.waveformVisual}>
                                <View style={styles.dummyWave} />
                                <Text style={styles.audioSavedText}>Voice Note Ready</Text>
                            </View>
                            <TouchableOpacity onPress={() => setAudioUri(null)}>
                                <Ionicons name="close-circle" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>4. Job Details</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="E.g., Kitchen faucet leaking..."
                        multiline
                        value={description}
                        onChangeText={setDescription}
                    />
                    <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Budget</Text>
                    <View style={styles.moneyInputWrapper}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            style={styles.moneyInput}
                            placeholder="500"
                            keyboardType="numeric"
                            value={budget}
                            onChangeText={setBudget}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : (
                        <>
                            <Text style={styles.submitBtnText}>Post Request</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

const getStyles = (isDark: boolean) => {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: isDark ? Colors.backgroundDark : Colors.background },
        header: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingHorizontal: 20, 
            paddingVertical: 15, 
            borderBottomWidth: 1, 
            borderBottomColor: isDark ? Colors.borderDark : Colors.border 
        },
        backBtn: { padding: 8, marginLeft: -8 },
        headerTitle: { fontSize: 18, fontWeight: '700', color: isDark ? Colors.textDark : Colors.text },
        scrollContent: { padding: 20, paddingBottom: 100 },
        helperText: { fontSize: 14, color: isDark ? Colors.textSecondaryDark : Colors.textSecondary, marginBottom: 20 },
        section: { marginBottom: 25 },
        sectionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: isDark ? Colors.textDark : Colors.text },
        uploadBox: { 
            height: 180, 
            borderRadius: 16, 
            borderWidth: 2, 
            borderColor: isDark ? '#404040' : '#E0E0E0', 
            borderStyle: 'dashed', 
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9' 
        },
        uploadIconCircle: { 
            width: 60, 
            height: 60, 
            borderRadius: 30, 
            backgroundColor: isDark ? '#1E3A5F' : '#E6F0FF', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginBottom: 10 
        },
        uploadText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
        uploadSubText: { fontSize: 12, color: isDark ? Colors.textSecondaryDark : '#666', marginTop: 4 },
        mediaContainer: { height: 200, borderRadius: 16, overflow: 'hidden' },
        imagePreview: { width: '100%', height: '100%' },
        videoContainer: { height: 200, borderRadius: 16, overflow: 'hidden' },
        videoPreview: { width: '100%', height: '100%' },
        removeMediaBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 20 },
        recordBtn: { 
            height: 60, 
            backgroundColor: isDark ? '#3A3A3C' : '#F0F0F0', 
            borderRadius: 30, 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 10 
        },
        recordingActive: { backgroundColor: '#FF4444' },
        recordText: { fontSize: 16, fontWeight: '600', color: isDark ? Colors.textDark : Colors.text },
        audioPreview: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: isDark ? '#1E3A5F' : '#F0F4FF', 
            padding: 12, 
            borderRadius: 16, 
            borderWidth: 1, 
            borderColor: Colors.primary 
        },
        playBtn: { 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: isDark ? '#2C2C2E' : 'white', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginRight: 12 
        },
        waveformVisual: { flex: 1 },
        dummyWave: { height: 4, backgroundColor: Colors.primary, borderRadius: 2, width: '60%', opacity: 0.5, marginBottom: 4 },
        audioSavedText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
        input: { 
            backgroundColor: isDark ? '#2C2C2E' : 'white', 
            borderWidth: 1, 
            borderColor: isDark ? '#404040' : '#E0E0E0', 
            borderRadius: 12, 
            padding: 16, 
            fontSize: 16, 
            minHeight: 100, 
            textAlignVertical: 'top',
            color: isDark ? Colors.textDark : Colors.text 
        },
        moneyInputWrapper: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: isDark ? '#2C2C2E' : 'white', 
            borderWidth: 1, 
            borderColor: isDark ? '#404040' : '#E0E0E0', 
            borderRadius: 12, 
            paddingHorizontal: 16, 
            height: 56 
        },
        currencySymbol: { fontSize: 20, fontWeight: '700', marginRight: 8, color: isDark ? Colors.textDark : Colors.text },
        moneyInput: { flex: 1, fontSize: 20, fontWeight: '700', color: isDark ? Colors.textDark : Colors.text },
        footer: { 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            backgroundColor: isDark ? Colors.surfaceDark : 'white', 
            padding: 20, 
            borderTopWidth: 1, 
            borderTopColor: isDark ? Colors.borderDark : '#eee' 
        },
        submitBtn: { 
            backgroundColor: Colors.primary, 
            height: 56, 
            borderRadius: 16, 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8 
        },
        submitBtnText: { color: 'white', fontSize: 18, fontWeight: '700' },
    });
};