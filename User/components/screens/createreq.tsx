import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {Colors} from "@/constants/Colors"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {useAppStore} from "@/lib/store"

// Media
import * as ImagePicker from "expo-image-picker"
import { Audio } from "expo-av"
import { useVideoPlayer, VideoView } from "expo-video"

export default function CreateRequestScreen() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { setActiveJob } = useAppStore()

    // --- STATE ---
    const [mediaUri, setMediaUri] = useState<string | null>(null)
    const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)

    const [recording, setRecording] = useState<Audio.Recording | null>(null)
    const [audioUri, setAudioUri] = useState<string | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [playingAudio, setPlayingAudio] = useState(false)
    const [sound, setSound] = useState<Audio.Sound | null>(null) // State for sound cleanup

    const [description, setDescription] = useState("")
    const [budget, setBudget] = useState("")

    // Cleanup sound on unmount
    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync()
            }
            : undefined
    }, [sound])

    // --- IMAGE / VIDEO PICKER ---
    const pickMedia = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
            Alert.alert("Permission required", "Allow access to upload image or video")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 0.7,
            videoMaxDuration: 15,
        })

        if (!result.canceled) {
            const asset = result.assets[0]
            setMediaUri(asset.uri)
            setMediaType(asset.type === "video" ? "video" : "image")
        }
    }

    // --- VIDEO PLAYER ---
    const player = useVideoPlayer(
        mediaType === "video" ? mediaUri : null,
        (playerInstance) => {
            playerInstance.loop = true
            playerInstance.muted = false
            // Autoplay is usually preferred for previews
            playerInstance.play()
        }
    )

    // --- AUDIO RECORD ---
    async function startRecording() {
        try {
            const permission = await Audio.requestPermissionsAsync()
            if (permission.status !== "granted") return

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            })

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            )
            setRecording(newRecording)
            setIsRecording(true)
        } catch (err) {
            console.error("Failed to start recording", err)
        }
    }

    async function stopRecording() {
        if (!recording) return
        try {
            setIsRecording(false)
            await recording.stopAndUnloadAsync()
            const uri = recording.getURI()
            setAudioUri(uri)
            setRecording(null)
        } catch (err) {
            console.error("Failed to stop recording", err)
        }
    }

    async function playRecordedAudio() {
        if (!audioUri) return
        try {
            // Unload existing sound if playing
            if (sound) {
                await sound.unloadAsync()
            }

            setPlayingAudio(true)
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUri },
                { shouldPlay: true }
            )
            setSound(newSound)

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingAudio(false)
                }
            })
        } catch (err) {
            console.error("Playback failed", err)
            setPlayingAudio(false)
        }
    }

    // --- SUBMIT ---
    const handleSubmit = () => {
        if (!description || !budget) {
            Alert.alert("Missing Details", "Please add description and budget")
            return
        }

        setActiveJob({
            description,
            budget,
            status: "finding",
        })

        Alert.alert("Success", "Job posted successfully", [
            { text: "OK", onPress: () => router.replace("/") },
        ])
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Request</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.helperText}>
                    Upload an image or 15s video and a voice note
                </Text>

                {/* MEDIA */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>1. Show the problem</Text>

                    {mediaUri ? (
                        <View style={styles.videoContainer}>
                            {mediaType === "video" ? (
                                <VideoView
                                    style={styles.videoPreview}
                                    player={player}
                                    contentFit="cover"
                                />
                            ) : (
                                <Image
                                    source={{ uri: mediaUri }}
                                    style={[styles.videoPreview, { resizeMode: 'cover' }]}
                                />
                            )}

                            <TouchableOpacity
                                style={styles.removeVideoBtn}
                                onPress={() => {
                                    setMediaUri(null)
                                    setMediaType(null)
                                }}
                            >
                                <Ionicons name="trash" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={[styles.uploadBox, { borderColor: Colors.primary }]} onPress={pickMedia}>
                            <Ionicons name="image-outline" size={30} color={Colors.primary} />
                            <Text style={styles.uploadText}>Tap to Upload Image / Video</Text>
                            <Text style={styles.uploadSubText}>Image or 15s video</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* AUDIO */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>2. Explain it (Voice)</Text>

                    {!audioUri ? (
                        <TouchableOpacity
                            style={[styles.recordBtn, isRecording && styles.recordingActive]}
                            onPressIn={startRecording}
                            onPressOut={stopRecording}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isRecording ? "mic" : "mic-outline"}
                                size={28}
                                color={isRecording ? "white" : Colors.primary}
                            />
                            <Text style={[styles.recordText, isRecording && { color: 'white' }]}>
                                {isRecording ? "Release to Stop" : "Hold to Record"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.audioPreview}>
                            <TouchableOpacity style={styles.playIconBtn} onPress={playRecordedAudio}>
                                <Ionicons
                                    name={playingAudio ? "pause" : "play"}
                                    size={24}
                                    color={Colors.primary}
                                />
                            </TouchableOpacity>
                            <Text style={{ flex: 1, marginLeft: 12 }}>Voice note recorded</Text>
                            <TouchableOpacity onPress={() => setAudioUri(null)}>
                                <Ionicons name="close-circle" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* DETAILS */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>3. Job Details</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Describe the problem"
                        placeholderTextColor="#999"
                        multiline
                        value={description}
                        onChangeText={setDescription}
                    />

                    <Text style={styles.sectionLabel}>Budget</Text>
                    <View style={styles.moneyInputWrapper}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                            style={styles.moneyInput}
                            placeholder="0.00"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={budget}
                            onChangeText={setBudget}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* FOOTER */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitBtnText}>Post Request</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    scrollContent: { padding: 20, paddingBottom: 150 },
    helperText: { color: "#666", marginBottom: 20 },

    section: { marginBottom: 24 },
    sectionLabel: { fontSize: 16, fontWeight: "700", marginBottom: 10 },

    uploadBox: {
        height: 180,
        borderWidth: 2,
        borderStyle: "dashed",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#fafafa'
    },
    uploadText: { marginTop: 10, fontWeight: "600" },
    uploadSubText: { fontSize: 12, color: "#666" },

    videoContainer: {
        height: 200,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: '#000'
    },
    videoPreview: { width: "100%", height: "100%" },
    removeVideoBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 8,
        borderRadius: 20,
    },

    recordBtn: {
        height: 60,
        borderRadius: 30,
        backgroundColor: "#f0f0f0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    recordingActive: { backgroundColor: 'red' },
    recordText: { fontWeight: "600" },

    audioPreview: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: '#f8f8f8',
        padding: 12,
        borderRadius: 12,
    },
    playIconBtn: {
        padding: 4
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 16,
        minHeight: 100,
        marginBottom: 16,
        textAlignVertical: 'top',
        backgroundColor: 'white'
    },

    moneyInputWrapper: {
        flexDirection: "row",
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: 'white'
    },
    currencySymbol: { fontSize: 18, marginRight: 8, fontWeight: '700' },
    moneyInput: { fontSize: 18, flex: 1, paddingVertical: 12 },

    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        padding: 16,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    submitBtn: {
        height: 56,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    submitBtnText: { color: "white", fontSize: 18, fontWeight: "700" },
})