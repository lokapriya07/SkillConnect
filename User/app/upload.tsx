// import React, { useState, useEffect, useRef, useCallback } from "react"
// import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { Colors } from "@/constants/Colors"
// import { useRouter } from "expo-router"
// import { useAppStore } from "@/lib/store"
// import { useSafeAreaInsets } from "react-native-safe-area-context"

// import * as ImagePicker from "expo-image-picker"
// import { Audio } from "expo-av"
// import { useVideoPlayer, VideoView } from "expo-video"
// import { Image } from "react-native"

// export default function CreateRequestScreen() {
//     const router = useRouter()
//     const insets = useSafeAreaInsets()

//     // --- STATE ---
//     const [videoUri, setVideoUri] = useState<string | null>(null)
//     const [imageUri, setImageUri] = useState<string | null>(null) // ✅ NEW: Image state
//     const [audioUri, setAudioUri] = useState<string | null>(null)
//     const [isRecording, setIsRecording] = useState(false)
//     const [playingAudio, setPlayingAudio] = useState(false)
//     const [description, setDescription] = useState("")
//     const [budget, setBudget] = useState("")
//     const [sound, setSound] = useState<Audio.Sound | null>(null)
//     const { setActiveJob } = useAppStore()

//     // 🔧 RECORDING MANAGER
//     const recordingRef = useRef<Audio.Recording | null>(null)
//     const isProcessingRef = useRef(false)

//     // ✅ NEW: IMAGE/VIDEO PICKER - Unified handler
//     const pickMedia = async (mediaType: 'photo' | 'video') => {
//         const permissionType = mediaType === 'photo'
//             ? ImagePicker.requestMediaLibraryPermissionsAsync()
//             : ImagePicker.requestMediaLibraryPermissionsAsync()

//         const { status } = await permissionType
//         if (status !== 'granted') {
//             Alert.alert("Permission needed", `Need access to gallery for ${mediaType}.`)
//             return
//         }

//         const result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: mediaType === 'photo'
//                 ? ImagePicker.MediaTypeOptions.Images
//                 : ImagePicker.MediaTypeOptions.Videos,
//             allowsEditing: true,
//             aspect: mediaType === 'photo' ? [1, 1] : [16, 9],
//             quality: 0.7,
//             ...(mediaType === 'video' && { videoMaxDuration: 15 })
//         })

//         if (!result.canceled) {
//             const uri = result.assets[0].uri
//             if (mediaType === 'photo') {
//                 setImageUri(uri)
//             } else {
//                 setVideoUri(uri)
//             }
//         }
//     }

//     // --- VIDEO PLAYER ---
//     const player = useVideoPlayer(videoUri, player => {
//         player.loop = true
//         player.muted = false
//     })

//     // 🔧 AUDIO FUNCTIONS (unchanged - working)
//     const cleanupRecording = useCallback(async () => {
//         if (recordingRef.current) {
//             try {
//                 await recordingRef.current.stopAndUnloadAsync()
//             } catch (e) { }
//             recordingRef.current = null
//         }
//     }, [])

//     const startRecording = useCallback(async () => {
//         if (isProcessingRef.current) return
//         isProcessingRef.current = true

//         try {
//             await cleanupRecording()
//             await new Promise(r => setTimeout(r, 1000))

//             await Audio.setAudioModeAsync({
//                 allowsRecordingIOS: true,
//                 playsInSilentModeIOS: true,
//             })

//             const permission = await Audio.requestPermissionsAsync()
//             if (permission.status !== "granted") return

//             const newRecording = await Audio.Recording.createAsync(
//                 Audio.RecordingOptionsPresets.HIGH_QUALITY
//             )

//             recordingRef.current = newRecording.recording
//             setIsRecording(true)

//         } catch (err: any) {
//             console.error("Recording error:", err.message)
//         } finally {
//             isProcessingRef.current = false
//         }
//     }, [cleanupRecording])

//     const stopRecording = useCallback(async () => {
//         if (!recordingRef.current) return

//         setIsRecording(false)
//         try {
//             await recordingRef.current.stopAndUnloadAsync()
//             const uri = recordingRef.current.getURI()
//             setAudioUri(uri)
//             recordingRef.current = null
//         } catch (err) { }
//     }, [])

//     const playRecordedAudio = async () => {
//         if (!audioUri || sound) return
//         try {
//             setPlayingAudio(true)
//             const { sound: newSound } = await Audio.Sound.createAsync(
//                 { uri: audioUri },
//                 { shouldPlay: true }
//             )
//             setSound(newSound)

//             newSound.setOnPlaybackStatusUpdate(async (status: any) => {
//                 if (status.isLoaded && status.didJustFinish) {
//                     setPlayingAudio(false)
//                     await newSound.unloadAsync()
//                     setSound(null)
//                 }
//             })
//         } catch (error) {
//             setPlayingAudio(false)
//         }
//     }

//     useEffect(() => {
//         return () => {
//             cleanupRecording()
//             if (sound) sound.unloadAsync().catch(() => { })
//         }
//     }, [])

//     const handleRecordPress = () => {
//         if (isRecording) {
//             stopRecording()
//         } else {
//             startRecording()
//         }
//     }

//     const handleSubmit = () => {
//         if (!description.trim() || !budget.trim()) {
//             Alert.alert("Missing Info", "Please add description and budget.")
//             return
//         }

//         setActiveJob({
//             description: description.trim(),
//             budget: budget.trim(),
//             imageUri,  // ✅ Added to store
//             videoUri,
//             audioUri,
//             status: "finding_workers",
//             createdAt: new Date().toISOString(),
//         })

//         Alert.alert("Success!", "Job posted to nearby workers!", [
//             { text: "OK", onPress: () => router.replace("/(tabs)/" as any) }
//         ])
//     }

//     return (
//         <View style={[styles.container, { paddingTop: insets.top }]}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//                     <Ionicons name="close" size={24} color={Colors.text || '#000'} />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>New Request</Text>
//                 <View style={{ width: 40 }} />
//             </View>

//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 <Text style={styles.helperText}>
//                     Add photo/video + voice note for faster responses
//                 </Text>

//                 {/* ✅ 1. IMAGE UPLOAD - NEW */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionLabel}>1. Problem Photo</Text>
//                     {imageUri ? (
//                         <View style={styles.mediaContainer}>
//                             <Image source={{ uri: imageUri }} style={styles.imagePreview} />
//                             <TouchableOpacity
//                                 style={styles.removeMediaBtn}
//                                 onPress={() => setImageUri(null)}
//                             >
//                                 <Ionicons name="trash" size={18} color="white" />
//                             </TouchableOpacity>
//                         </View>
//                     ) : (
//                         <TouchableOpacity style={styles.uploadBox} onPress={() => pickMedia('photo')}>
//                             <View style={styles.uploadIconCircle}>
//                                 <Ionicons name="camera" size={28} color={Colors.primary || '#007AFF'} />
//                             </View>
//                             <Text style={styles.uploadText}>Tap for Photo</Text>
//                             <Text style={styles.uploadSubText}>Clear photo of problem</Text>
//                         </TouchableOpacity>
//                     )}
//                 </View>

//                 {/* 2. VIDEO UPLOAD */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionLabel}>2. Problem Video (Optional)</Text>
//                     {videoUri ? (
//                         <View style={styles.videoContainer}>
//                             <VideoView style={styles.videoPreview} player={player} contentFit="cover" />
//                             <TouchableOpacity
//                                 style={styles.removeMediaBtn}
//                                 onPress={() => setVideoUri(null)}
//                             >
//                                 <Ionicons name="trash" size={18} color="white" />
//                             </TouchableOpacity>
//                         </View>
//                     ) : (
//                         <TouchableOpacity style={styles.uploadBox} onPress={() => pickMedia('video')}>
//                             <View style={styles.uploadIconCircle}>
//                                 <Ionicons name="videocam" size={28} color={Colors.primary || '#007AFF'} />
//                             </View>
//                             <Text style={styles.uploadText}>Tap for Video</Text>
//                             <Text style={styles.uploadSubText}>Max 15 seconds</Text>
//                         </TouchableOpacity>
//                     )}
//                 </View>

//                 {/* 3. AUDIO - WORKING */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionLabel}>3. Explain it (Voice Note)</Text>
//                     {!audioUri ? (
//                         <TouchableOpacity
//                             style={[
//                                 styles.recordBtn,
//                                 isRecording && styles.recordingActive,
//                                 isProcessingRef.current && styles.processing
//                             ]}
//                             onPress={handleRecordPress}
//                             activeOpacity={0.8}
//                             disabled={isProcessingRef.current}
//                         >
//                             <Ionicons
//                                 name={isRecording ? "mic" : "mic-outline"}
//                                 size={32}
//                                 color={isRecording ? "white" : Colors.primary || '#007AFF'}
//                             />
//                             <Text style={[styles.recordText, isRecording && { color: 'white' }]}>
//                                 {isRecording ? "Recording..." : "Tap to Record"}
//                             </Text>
//                         </TouchableOpacity>
//                     ) : (
//                         <View style={styles.audioPreview}>
//                             <TouchableOpacity style={styles.playBtn} onPress={playRecordedAudio}>
//                                 <Ionicons
//                                     name={playingAudio ? "pause" : "play"}
//                                     size={24}
//                                     color={Colors.primary || '#007AFF'}
//                                 />
//                             </TouchableOpacity>
//                             <View style={styles.waveformVisual}>
//                                 <View style={styles.dummyWave} />
//                                 <Text style={styles.audioSavedText}>Voice Note Ready</Text>
//                             </View>
//                             <TouchableOpacity onPress={() => setAudioUri(null)}>
//                                 <Ionicons name="close-circle" size={24} color="#666" />
//                             </TouchableOpacity>
//                         </View>
//                     )}
//                 </View>

//                 {/* 4. DETAILS */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionLabel}>4. Job Details</Text>
//                     <TextInput
//                         style={styles.input}
//                         placeholder="E.g., Kitchen faucet leaking from base..."
//                         placeholderTextColor="#999"
//                         multiline
//                         value={description}
//                         onChangeText={setDescription}
//                     />
//                     <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Budget</Text>
//                     <View style={styles.moneyInputWrapper}>
//                         <Text style={styles.currencySymbol}>₹</Text>
//                         <TextInput
//                             style={styles.moneyInput}
//                             placeholder="500"
//                             keyboardType="numeric"
//                             value={budget}
//                             onChangeText={setBudget}
//                         />
//                     </View>
//                 </View>
//             </ScrollView>

//             <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
//                 <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
//                     <Text style={styles.submitBtnText}>Post Request</Text>
//                     <Ionicons name="arrow-forward" size={20} color="white" />
//                 </TouchableOpacity>
//             </View>
//         </View>
//     )
// }

// // STYLES (updated for image support)
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: Colors.background || '#fff' },
//     header: {
//         flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//         paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1,
//         borderBottomColor: '#eee', backgroundColor: 'white'
//     },
//     backBtn: { padding: 8, marginLeft: -8 },
//     headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text || '#000' },
//     scrollContent: { padding: 20, paddingBottom: 100 },
//     helperText: { fontSize: 14, color: Colors.textSecondary || '#666', marginBottom: 20, lineHeight: 20 },

//     section: { marginBottom: 25 },
//     sectionLabel: { fontSize: 16, fontWeight: '700', color: Colors.text || '#000', marginBottom: 12 },

//     // ✅ MEDIA STYLES
//     uploadBox: {
//         height: 180, borderRadius: 16, borderWidth: 2, borderColor: '#E0E0E0',
//         borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9F9'
//     },
//     uploadIconCircle: {
//         width: 60, height: 60, borderRadius: 30, backgroundColor: '#E6F0FF',
//         justifyContent: 'center', alignItems: 'center', marginBottom: 10
//     },
//     uploadText: { fontSize: 15, fontWeight: '600', color: Colors.primary || '#007AFF' },
//     uploadSubText: { fontSize: 12, color: Colors.textSecondary || '#666', marginTop: 4 },

//     mediaContainer: { height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
//     imagePreview: { width: '100%', height: '100%', borderRadius: 16 },
//     videoContainer: { height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: 'black', position: 'relative' },
//     videoPreview: { width: '100%', height: '100%' },
//     removeMediaBtn: {
//         position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)',
//         padding: 8, borderRadius: 20
//     },

//     recordBtn: {
//         height: 60, backgroundColor: '#F0F0F0', borderRadius: 30, flexDirection: 'row',
//         alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20
//     },
//     recordingActive: { backgroundColor: '#FF4444' },
//     processing: { backgroundColor: '#FFA500' },
//     recordText: { fontSize: 16, fontWeight: '600', color: Colors.text || '#000' },

//     audioPreview: {
//         flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FF',
//         padding: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.primary || '#007AFF'
//     },
//     playBtn: {
//         width: 40, height: 40, borderRadius: 20, backgroundColor: 'white',
//         justifyContent: 'center', alignItems: 'center', marginRight: 12
//     },
//     waveformVisual: { flex: 1 },
//     dummyWave: {
//         height: 4, backgroundColor: Colors.primary || '#007AFF', borderRadius: 2,
//         width: '60%', opacity: 0.5, marginBottom: 4
//     },
//     audioSavedText: { fontSize: 12, color: Colors.primary || '#007AFF', fontWeight: '600' },

//     input: {
//         backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12,
//         padding: 16, fontSize: 16, color: Colors.text || '#000', minHeight: 100, textAlignVertical: 'top'
//     },
//     moneyInputWrapper: {
//         flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
//         borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, height: 56
//     },
//     currencySymbol: { fontSize: 20, fontWeight: '700', color: Colors.text || '#000', marginRight: 8 },
//     moneyInput: { flex: 1, fontSize: 20, fontWeight: '700', color: Colors.text || '#000' },

//     footer: {
//         position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white',
//         padding: 20, borderTopWidth: 1, borderTopColor: '#eee'
//     },
//     submitBtn: {
//         backgroundColor: Colors.primary || '#007AFF', height: 56, borderRadius: 16,
//         flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
//         shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
//         shadowRadius: 8, elevation: 5
//     },
//     submitBtnText: { color: 'white', fontSize: 18, fontWeight: '700' },
// })




// import React, { useState, useEffect, useRef, useCallback } from "react"
// import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { Colors } from "@/constants/Colors"
// import { useRouter } from "expo-router"
// import { useAppStore } from "@/lib/store"
// import { useSafeAreaInsets } from "react-native-safe-area-context"

// import * as ImagePicker from "expo-image-picker"
// import { Audio } from "expo-av"
// import { useVideoPlayer, VideoView } from "expo-video"
// import { Image } from "react-native"

// export default function CreateRequestScreen() {
//     const router = useRouter()
//     const insets = useSafeAreaInsets()

//     // --- STATE ---
//     const [videoUri, setVideoUri] = useState<string | null>(null)
//     const [imageUri, setImageUri] = useState<string | null>(null) // ✅ NEW: Image state
//     const [audioUri, setAudioUri] = useState<string | null>(null)
//     const [isRecording, setIsRecording] = useState(false)
//     const [playingAudio, setPlayingAudio] = useState(false)
//     const [description, setDescription] = useState("")
//     const [budget, setBudget] = useState("")
//     const [loading, setLoading] = useState(false) // ✅ Added loading state
//     const [sound, setSound] = useState<Audio.Sound | null>(null)

//     // 🔧 RECORDING MANAGER
//     const recordingRef = useRef<Audio.Recording | null>(null)
//     const isProcessingRef = useRef(false)

//     // ✅ NEW: IMAGE/VIDEO PICKER - Unified handler
//     const pickMedia = async (mediaType: 'photo' | 'video') => {
//         const permissionType = mediaType === 'photo'
//             ? ImagePicker.requestMediaLibraryPermissionsAsync()
//             : ImagePicker.requestMediaLibraryPermissionsAsync()

//         const { status } = await permissionType
//         if (status !== 'granted') {
//             Alert.alert("Permission needed", `Need access to gallery for ${mediaType}.`)
//             return
//         }

//         const result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: mediaType === 'photo'
//                 ? ImagePicker.MediaTypeOptions.Images
//                 : ImagePicker.MediaTypeOptions.Videos,
//             allowsEditing: true,
//             aspect: mediaType === 'photo' ? [1, 1] : [16, 9],
//             quality: 0.7,
//             ...(mediaType === 'video' && { videoMaxDuration: 15 })
//         })

//         if (!result.canceled) {
//             const uri = result.assets[0].uri
//             if (mediaType === 'photo') {
//                 setImageUri(uri)
//             } else {
//                 setVideoUri(uri)
//             }
//         }
//     }

//     // --- VIDEO PLAYER ---
//     const player = useVideoPlayer(videoUri, player => {
//         player.loop = true
//         player.muted = false
//     })

//     // 🔧 AUDIO FUNCTIONS (unchanged - working)
//     const cleanupRecording = useCallback(async () => {
//         if (recordingRef.current) {
//             try {
//                 await recordingRef.current.stopAndUnloadAsync()
//             } catch (e) { }
//             recordingRef.current = null
//         }
//     }, [])

//     const startRecording = useCallback(async () => {
//         if (isProcessingRef.current) return
//         isProcessingRef.current = true

//         try {
//             await cleanupRecording()
//             await new Promise(r => setTimeout(r, 1000))

//             await Audio.setAudioModeAsync({
//                 allowsRecordingIOS: true,
//                 playsInSilentModeIOS: true,
//             })

//             const permission = await Audio.requestPermissionsAsync()
//             if (permission.status !== "granted") return

//             const newRecording = await Audio.Recording.createAsync(
//                 Audio.RecordingOptionsPresets.HIGH_QUALITY
//             )

//             recordingRef.current = newRecording.recording
//             setIsRecording(true)

//         } catch (err: any) {
//             console.error("Recording error:", err.message)
//         } finally {
//             isProcessingRef.current = false
//         }
//     }, [cleanupRecording])

//     const stopRecording = useCallback(async () => {
//         if (!recordingRef.current) return

//         setIsRecording(false)
//         try {
//             await recordingRef.current.stopAndUnloadAsync()
//             const uri = recordingRef.current.getURI()
//             setAudioUri(uri)
//             recordingRef.current = null
//         } catch (err) { }
//     }, [])

//     const playRecordedAudio = async () => {
//         if (!audioUri || sound) return
//         try {
//             setPlayingAudio(true)
//             const { sound: newSound } = await Audio.Sound.createAsync(
//                 { uri: audioUri },
//                 { shouldPlay: true }
//             )
//             setSound(newSound)

//             newSound.setOnPlaybackStatusUpdate(async (status: any) => {
//                 if (status.isLoaded && status.didJustFinish) {
//                     setPlayingAudio(false)
//                     await newSound.unloadAsync()
//                     setSound(null)
//                 }
//             })
//         } catch (error) {
//             setPlayingAudio(false)
//         }
//     }

//     useEffect(() => {
//         return () => {
//             cleanupRecording()
//             if (sound) sound.unloadAsync().catch(() => { })
//         }
//     }, [])

//     const handleRecordPress = () => {
//         if (isRecording) {
//             stopRecording()
//         } else {
//             startRecording()
//         }
//     }

//     // ✅ UPDATED SUBMIT LOGIC
//     // --- 1. Update the destructuring at the top of your component ---
//     const { setActiveJob, currentLocation } = useAppStore() // Use currentLocation instead of just setActiveJob

//     // --- 2. Replace your handleSubmit with this fixed version ---
//     const handleSubmit = async () => {
//         if (!description.trim() || !budget.trim()) {
//             Alert.alert("Missing Info", "Please add description and budget.")
//             return
//         }

//         // 📍 GET COORDINATES FROM STORE
//         const lat = currentLocation?.coordinates?.lat;
//         const lng = currentLocation?.coordinates?.lng;

//         // 🛑 BLOCK IF LOCATION IS MISSING (Prevents the NaN error)
//         if (lat === undefined || lng === undefined) {
//             Alert.alert("Location Missing", "Please wait for your location to be detected on the home screen.")
//             return
//         }

//         setLoading(true)

//         try {
//             const formData = new FormData()
//             formData.append("description", description.trim())
//             formData.append("budget", budget.trim())

//             // ✅ ADD COORDINATES TO FORM DATA
//             formData.append("longitude", String(lng))
//             formData.append("latitude", String(lat))

//             // Helper to append files
//             const appendFile = (uri: string | null, fieldName: string) => {
//                 if (uri) {
//                     const filename = uri.split('/').pop() || "upload"
//                     const type = fieldName === 'image' ? 'image/jpeg' : fieldName === 'video' ? 'video/mp4' : 'audio/m4a'

//                     // @ts-ignore
//                     formData.append(fieldName, {
//                         uri: uri,
//                         name: filename,
//                         type: type,
//                     })
//                 }
//             }

//             appendFile(imageUri, "image")
//             appendFile(videoUri, "video")
//             appendFile(audioUri, "audio")

//             const apiUrl = process.env.EXPO_PUBLIC_API_URL;

//             const response = await fetch(`${apiUrl}/api/jobs/upload`, {
//                 method: "POST",
//                 body: formData,
//                 headers: {
//                     "Content-Type": "multipart/form-data",
//                 },
//             })

//             const result = await response.json()

//             if (response.ok) {
//                 setActiveJob({
//                     ...result.job,
//                     status: "finding_workers",
//                 })

//                 Alert.alert("Success!", "Job posted to nearby workers!", [
//                     { text: "OK", onPress: () => router.replace("/(tabs)/" as any) }
//                 ])
//             } else {
//                 Alert.alert("Error", result.error || "Failed to post request")
//             }

//         } catch (error) {
//             console.error("Submission error:", error)
//             Alert.alert("Connection Error", `Could not reach backend at ${process.env.EXPO_PUBLIC_API_URL}`)
//         } finally {
//             setLoading(false)
//         }
//     }

//     return (
//         <View style={[styles.container, { paddingTop: insets.top }]}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//                     <Ionicons name="close" size={24} color={Colors.text || '#000'} />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>New Request</Text>
//                 <View style={{ width: 40 }} />
//             </View>

//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 <Text style={styles.helperText}>
//                     Add photo/video + voice note for faster responses
//                 </Text>

//                 {/* ✅ 1. IMAGE UPLOAD - NEW */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionLabel}>1. Problem Photo</Text>
//                     {imageUri ? (
//                         <View style={styles.mediaContainer}>
//                             <Image source={{ uri: imageUri }} style={styles.imagePreview} />
//                             <TouchableOpacity
//                                 style={styles.removeMediaBtn}
//                                 onPress={() => setImageUri(null)}
//                             >
//                                 <Ionicons name="trash" size={18} color="white" />
//                             </TouchableOpacity>
//                         </View>
//                     ) : (
//                         <TouchableOpacity style={styles.uploadBox} onPress={() => pickMedia('photo')}>
//                             <View style={styles.uploadIconCircle}>
//                                 <Ionicons name="camera" size={28} color={Colors.primary || '#007AFF'} />
//                             </View>
//                             <Text style={styles.uploadText}>Tap for Photo</Text>
//                             <Text style={styles.uploadSubText}>Clear photo of problem</Text>
//                         </TouchableOpacity>
//                     )}
//                 </View>

//                 {/* 2. VIDEO UPLOAD */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionLabel}>2. Problem Video (Optional)</Text>
//                     {videoUri ? (
//                         <View style={styles.videoContainer}>
//                             <VideoView style={styles.videoPreview} player={player} contentFit="cover" />
//                             <TouchableOpacity
//                                 style={styles.removeMediaBtn}
//                                 onPress={() => setVideoUri(null)}
//                             >
//                                 <Ionicons name="trash" size={18} color="white" />
//                             </TouchableOpacity>
//                         </View>
//                     ) : (
//                         <TouchableOpacity style={styles.uploadBox} onPress={() => pickMedia('video')}>
//                             <View style={styles.uploadIconCircle}>
//                                 <Ionicons name="videocam" size={28} color={Colors.primary || '#007AFF'} />
//                             </View>
//                             <Text style={styles.uploadText}>Tap for Video</Text>
//                             <Text style={styles.uploadSubText}>Max 15 seconds</Text>
//                         </TouchableOpacity>
//                     )}
//                 </View>

//                 {/* 3. AUDIO - WORKING */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionLabel}>3. Explain it (Voice Note)</Text>
//                     {!audioUri ? (
//                         <TouchableOpacity
//                             style={[
//                                 styles.recordBtn,
//                                 isRecording && styles.recordingActive,
//                                 isProcessingRef.current && styles.processing
//                             ]}
//                             onPress={handleRecordPress}
//                             activeOpacity={0.8}
//                             disabled={isProcessingRef.current}
//                         >
//                             <Ionicons
//                                 name={isRecording ? "mic" : "mic-outline"}
//                                 size={32}
//                                 color={isRecording ? "white" : Colors.primary || '#007AFF'}
//                             />
//                             <Text style={[styles.recordText, isRecording && { color: 'white' }]}>
//                                 {isRecording ? "Recording..." : "Tap to Record"}
//                             </Text>
//                         </TouchableOpacity>
//                     ) : (
//                         <View style={styles.audioPreview}>
//                             <TouchableOpacity style={styles.playBtn} onPress={playRecordedAudio}>
//                                 <Ionicons
//                                     name={playingAudio ? "pause" : "play"}
//                                     size={24}
//                                     color={Colors.primary || '#007AFF'}
//                                 />
//                             </TouchableOpacity>
//                             <View style={styles.waveformVisual}>
//                                 <View style={styles.dummyWave} />
//                                 <Text style={styles.audioSavedText}>Voice Note Ready</Text>
//                             </View>
//                             <TouchableOpacity onPress={() => setAudioUri(null)}>
//                                 <Ionicons name="close-circle" size={24} color="#666" />
//                             </TouchableOpacity>
//                         </View>
//                     )}
//                 </View>

//                 {/* 4. DETAILS */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionLabel}>4. Job Details</Text>
//                     <TextInput
//                         style={styles.input}
//                         placeholder="E.g., Kitchen faucet leaking from base..."
//                         placeholderTextColor="#999"
//                         multiline
//                         value={description}
//                         onChangeText={setDescription}
//                     />
//                     <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Budget</Text>
//                     <View style={styles.moneyInputWrapper}>
//                         <Text style={styles.currencySymbol}>₹</Text>
//                         <TextInput
//                             style={styles.moneyInput}
//                             placeholder="500"
//                             keyboardType="numeric"
//                             value={budget}
//                             onChangeText={setBudget}
//                         />
//                     </View>
//                 </View>
//             </ScrollView>

//             <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
//                 <TouchableOpacity 
//                     style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
//                     onPress={handleSubmit}
//                     disabled={loading}
//                 >
//                     {loading ? (
//                         <ActivityIndicator color="white" />
//                     ) : (
//                         <>
//                             <Text style={styles.submitBtnText}>Post Request</Text>
//                             <Ionicons name="arrow-forward" size={20} color="white" />
//                         </>
//                     )}
//                 </TouchableOpacity>
//             </View>
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: Colors.background || '#fff' },
//     header: {
//         flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//         paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1,
//         borderBottomColor: '#eee', backgroundColor: 'white'
//     },
//     backBtn: { padding: 8, marginLeft: -8 },
//     headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text || '#000' },
//     scrollContent: { padding: 20, paddingBottom: 100 },
//     helperText: { fontSize: 14, color: Colors.textSecondary || '#666', marginBottom: 20, lineHeight: 20 },

//     section: { marginBottom: 25 },
//     sectionLabel: { fontSize: 16, fontWeight: '700', color: Colors.text || '#000', marginBottom: 12 },

//     uploadBox: {
//         height: 180, borderRadius: 16, borderWidth: 2, borderColor: '#E0E0E0',
//         borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9F9'
//     },
//     uploadIconCircle: {
//         width: 60, height: 60, borderRadius: 30, backgroundColor: '#E6F0FF',
//         justifyContent: 'center', alignItems: 'center', marginBottom: 10
//     },
//     uploadText: { fontSize: 15, fontWeight: '600', color: Colors.primary || '#007AFF' },
//     uploadSubText: { fontSize: 12, color: Colors.textSecondary || '#666', marginTop: 4 },

//     mediaContainer: { height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
//     imagePreview: { width: '100%', height: '100%', borderRadius: 16 },
//     videoContainer: { height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: 'black', position: 'relative' },
//     videoPreview: { width: '100%', height: '100%' },
//     removeMediaBtn: {
//         position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)',
//         padding: 8, borderRadius: 20
//     },

//     recordBtn: {
//         height: 60, backgroundColor: '#F0F0F0', borderRadius: 30, flexDirection: 'row',
//         alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20
//     },
//     recordingActive: { backgroundColor: '#FF4444' },
//     processing: { backgroundColor: '#FFA500' },
//     recordText: { fontSize: 16, fontWeight: '600', color: Colors.text || '#000' },

//     audioPreview: {
//         flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FF',
//         padding: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.primary || '#007AFF'
//     },
//     playBtn: {
//         width: 40, height: 40, borderRadius: 20, backgroundColor: 'white',
//         justifyContent: 'center', alignItems: 'center', marginRight: 12
//     },
//     waveformVisual: { flex: 1 },
//     dummyWave: {
//         height: 4, backgroundColor: Colors.primary || '#007AFF', borderRadius: 2,
//         width: '60%', opacity: 0.5, marginBottom: 4
//     },
//     audioSavedText: { fontSize: 12, color: Colors.primary || '#007AFF', fontWeight: '600' },

//     input: {
//         backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12,
//         padding: 16, fontSize: 16, color: Colors.text || '#000', minHeight: 100, textAlignVertical: 'top'
//     },
//     moneyInputWrapper: {
//         flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
//         borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, height: 56
//     },
//     currencySymbol: { fontSize: 20, fontWeight: '700', color: Colors.text || '#000', marginRight: 8 },
//     moneyInput: { flex: 1, fontSize: 20, fontWeight: '700', color: Colors.text || '#000' },

//     footer: {
//         position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white',
//         padding: 20, borderTopWidth: 1, borderTopColor: '#eee'
//     },
//     submitBtn: {
//         backgroundColor: Colors.primary || '#007AFF', height: 56, borderRadius: 16,
//         flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
//         shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
//         shadowRadius: 8, elevation: 5
//     },
//     submitBtnText: { color: 'white', fontSize: 18, fontWeight: '700' },
// })
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    helperText: { fontSize: 14, color: '#666', marginBottom: 20 },
    section: { marginBottom: 25 },
    sectionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    uploadBox: { height: 180, borderRadius: 16, borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9F9' },
    uploadIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E6F0FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    uploadText: { fontSize: 15, fontWeight: '600', color: '#007AFF' },
    uploadSubText: { fontSize: 12, color: '#666', marginTop: 4 },
    mediaContainer: { height: 200, borderRadius: 16, overflow: 'hidden' },
    imagePreview: { width: '100%', height: '100%' },
    videoContainer: { height: 200, borderRadius: 16, overflow: 'hidden' },
    videoPreview: { width: '100%', height: '100%' },
    removeMediaBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 20 },
    recordBtn: { height: 60, backgroundColor: '#F0F0F0', borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    recordingActive: { backgroundColor: '#FF4444' },
    recordText: { fontSize: 16, fontWeight: '600' },
    audioPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FF', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#007AFF' },
    playBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    waveformVisual: { flex: 1 },
    dummyWave: { height: 4, backgroundColor: '#007AFF', borderRadius: 2, width: '60%', opacity: 0.5, marginBottom: 4 },
    audioSavedText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 16, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
    moneyInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, height: 56 },
    currencySymbol: { fontSize: 20, fontWeight: '700', marginRight: 8 },
    moneyInput: { flex: 1, fontSize: 20, fontWeight: '700' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
    submitBtn: { backgroundColor: '#007AFF', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    submitBtnText: { color: 'white', fontSize: 18, fontWeight: '700' },
})