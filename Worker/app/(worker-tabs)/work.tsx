import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { VideoView, useVideoPlayer } from "expo-video";
import { Colors } from "@/constants/Colors";

export default function WorkerJobDetails() {
    const { jobId } = useLocalSearchParams();
    const router = useRouter();

    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState("");
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Helper to fix Windows file paths from backend
    const getFullUrl = (path: string) => {
        if (!path) return null;
        const normalizedPath = path.replace(/\\/g, '/');
        return `${process.env.EXPO_PUBLIC_API_URL}/${normalizedPath}`;
    };

    useEffect(() => {
        if (jobId) {
            fetchJobDetails();
        }
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [jobId]); // Added jobId dependency

    const fetchJobDetails = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/all-jobs`);
            const result = await response.json();

            // Find the specific job that matches the jobId from the URL
            const foundJob = result.jobs.find((j: any) => j._id === jobId);

            if (foundJob) {
                setJob(foundJob);
                if (foundJob.budget) setBidAmount(foundJob.budget.toString());
            } else {
                Alert.alert("Error", "Job not found.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not load job details.");
        } finally {
            setLoading(false);
        }
    };

    // Correctly initialize Video Player only when job data exists
    const videoUri = useMemo(() => getFullUrl(job?.videoPath), [job?.videoPath]);
    const player = useVideoPlayer(videoUri, (p) => {
        p.loop = true;
    });

    const playAudio = async () => {
        const audioUrl = getFullUrl(job?.audioPath);
        if (!audioUrl) return;

        try {
            if (sound) {
                await sound.replayAsync();
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    { shouldPlay: true }
                );
                setSound(newSound);
                setIsPlaying(true);
                newSound.setOnPlaybackStatusUpdate((status: any) => {
                    if (status.didJustFinish) setIsPlaying(false);
                });
            }
        } catch (e) {
            Alert.alert("Error", "Could not play audio.");
        }
    };

    const submitBid = async () => {
        if (!bidAmount) return Alert.alert("Wait", "Please enter a bid amount.");

        // logic for backend POST here
        Alert.alert("Success", "Your bid has been sent to the user!", [
            { text: "OK", onPress: () => router.back() }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingCenter}>
                <ActivityIndicator size="large" color={Colors.primary || "#007AFF"} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Image Preview */}
                {job?.imagePath && (
                    <Image
                        source={{ uri: getFullUrl(job.imagePath) as string }}
                        style={styles.mainImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.content}>
                    <Text style={styles.title}>Job Details</Text>

                    <View style={styles.tagRow}>
                        {job?.skillsRequired?.map((skill: string) => (
                            <View key={skill} style={styles.skillBadge}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.description}>{job?.description}</Text>

                    {/* Media Players */}
                    <View style={styles.mediaRow}>
                        {job?.audioPath && (
                            <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
                                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
                                <Text style={styles.btnText}>Listen to Voice Note</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {job?.videoPath && (
                        <View style={styles.videoContainer}>
                            <Text style={styles.label}>Problem Video:</Text>
                            <VideoView
                                style={styles.video}
                                player={player}
                                allowsFullscreen
                                allowsPictureInPicture
                            />
                        </View>
                    )}

                    <View style={styles.divider} />

                    {/* Bidding Section */}
                    <Text style={styles.label}>User Budget: ₹{job?.budget}</Text>
                    <Text style={styles.label}>Your Bid Amount:</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.currency}>₹</Text>
                        <TextInput
                            style={styles.input}
                            value={bidAmount}
                            onChangeText={setBidAmount}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={submitBid}>
                        <Text style={styles.submitBtnText}>Submit Bid</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mainImage: { width: '100%', height: 250 },
    content: { padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    skillBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    skillText: { color: '#1976D2', fontWeight: '600', textTransform: 'capitalize' },
    description: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 20 },
    mediaRow: { marginBottom: 20 },
    audioBtn: {
        backgroundColor: "#007AFF",
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        gap: 10
    },
    btnText: { color: 'white', fontWeight: 'bold' },
    videoContainer: { marginBottom: 20 },
    video: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#000' },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 15
    },
    currency: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    input: { flex: 1, padding: 15, fontSize: 18, fontWeight: 'bold' },
    submitBtn: { backgroundColor: '#28A745', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 25 },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});