"use client"

import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar, SafeAreaView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { BlurView } from 'expo-blur'
import { Colors } from "@/constants/Colors"


const { width, height } = Dimensions.get("window")
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const STATUS_STEPS = [
  { key: 'assigned', label: 'Order Accepted', icon: 'shield-checkmark-outline' },
  { key: 'scheduled', label: 'On the Way', icon: 'bicycle-outline' },
  { key: 'in_progress', label: 'Service in Progress', icon: 'hammer-outline' },
  { key: 'completed', label: 'Job Finished', icon: 'checkmark-circle-outline' },
]

export default function BookingDetailsScreen() {
  const router = useRouter()
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const darkMode = useAppStore(state => state.darkMode)
  const storeBooking = useAppStore(s => s.bookings.find(b => b.id === bookingId))

  const [liveJob, setLiveJob] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // Get the correct job ID: prefer jobId from booking (for assigned jobs), fallback to bookingId
  const getJobIdToFetch = () => {
    // First check if the booking has a linked jobId from assign-worker
    if (storeBooking?.jobId) {
      console.log('Using jobId from booking:', storeBooking.jobId);
      return storeBooking.jobId;
    }
    
    // Otherwise, strip prefixes from the bookingId to get the job ID
    let cleanId = typeof bookingId === 'string' ? bookingId : '';
    cleanId = cleanId.replace(/^hired_/, '').replace(/^assigned_/, '').replace(/^booking_/, '');
    console.log('Using cleaned bookingId as jobId:', cleanId);
    return cleanId;
  };

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>

    const fetchStatus = async () => {
      try {
        // Get the correct job ID (from booking.jobId or from cleaned bookingId)
        const cleanId = getJobIdToFetch();
        
        console.log('Fetching job status for ID:', cleanId, 'original:', bookingId);
        
        if (!cleanId || cleanId.length < 10) {
          console.log('Invalid job ID, skipping fetch');
          return;
        }
        
        // Use the correct endpoint that actually exists in the backend
        const res = await fetch(`${API_URL}/api/jobs/get-job/${cleanId}`);
        const data = await res.json();
        
        console.log('Job fetch response:', data);
        
        if (data.success && data.job) {
          // Log the job status for debugging
          console.log('Job status from API:', data.job.status);
          console.log('Job assignedWorker:', data.job.assignedWorker);
          console.log('Job hiredWorker:', data.job.hiredWorker);
          
          setLiveJob(data.job);
          setIsSyncing(true);
        } else {
          console.log('Job not found or fetch failed');
          setIsSyncing(false);
        }
      } catch (e) { 
        console.error('Error fetching job status:', e);
        setIsSyncing(false); 
      }
    };
    fetchStatus();
    // Poll every 5 seconds for status updates
    interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const displayData = liveJob || storeBooking || {};
  
  // Handle all possible status values from backend
  // Map various statuses to our tracking steps
  const rawStatus = displayData?.status || 'assigned';
  
  // Map status to step: 
  // - 'finding_workers', 'bidding', 'finding' -> 'assigned' (waiting for worker)
  // - 'hired', 'booked' -> 'assigned' (worker assigned)
  // - 'assigned' -> 'assigned' (confirmed)
  // - 'scheduled' -> 'scheduled' (on the way)
  // - 'in_progress' -> 'in_progress' (service in progress)
  // - 'completed' -> 'completed' (job finished)
  const statusMap: { [key: string]: string } = {
    'finding_workers': 'assigned',
    'bidding': 'assigned',
    'finding': 'assigned',
    'hired': 'assigned',
    'booked': 'assigned',
    'assigned': 'assigned',
    'scheduled': 'scheduled',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };
  
  const currentStatus = statusMap[rawStatus?.toLowerCase()] || 'assigned';
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);
  // Prefer hiredWorker name, then assignedWorker name
  const workerName = displayData?.hiredWorker?.workerName ||
    displayData?.assignedWorker?.workerName ||
    displayData?.assignedWorker?.name ||
    "Professional";
  const initials = workerName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  const totalDisplay = displayData?.totalAmount || displayData?.budget || displayData?.total || '0';

  const styles = getStyles(darkMode);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* 1. SEPARATE HEADER (Fixed Overlap) */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={24} color={darkMode ? "#FFF" : "#1A1C1E"} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.navTitle}>Tracking Service</Text>
            <View style={styles.liveTag}>
              <View style={[styles.pulseDot, { backgroundColor: isSyncing ? '#10B981' : '#94A3B8' }]} />
              <Text style={styles.liveLabel}>{isSyncing ? 'LIVE' : 'OFFLINE'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.navBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={darkMode ? "#FFF" : "#1A1C1E"} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* 2. MAP VIEW (Now below the header) */}
        <View style={styles.mapWrapper}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: 12.9716,
              longitude: 77.5946,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker coordinate={{ latitude: 12.9716, longitude: 77.5946 }}>
              <View style={styles.proMarker}>
                <Ionicons name="bicycle" size={18} color="white" />
              </View>
            </Marker>
          </MapView>
        </View>

        {/* 3. CONTENT SECTION (Floating up slightly over map) */}
        <View style={styles.contentContainer}>

          {/* STEPPER */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>ACTIVITY TIMELINE</Text>
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.indicatorCol}>
                    <View style={[styles.stepCircle, isActive && styles.circleActive]}>
                      <Ionicons name={step.icon as any} size={14} color={isActive ? "white" : "#94A3B8"} />
                    </View>
                    {index !== 3 && <View style={[styles.stepLine, isActive && styles.lineActive]} />}
                  </View>
                  <View style={styles.stepTextCol}>
                    <Text style={[styles.stepLabel, isActive && styles.labelActive]}>{step.label}</Text>
                    {isCurrent && <Text style={styles.currentDesc}>In progress • Updating now</Text>}
                  </View>
                </View>
              )
            })}
          </View>

          {/* WORKER BADGE - shows for both assignedWorker and hiredWorker */}
          {(displayData?.assignedWorker || displayData?.hiredWorker) && (
            <View style={styles.workerBadgeCard}>
              <View style={styles.initialsCircle}>
                <Text style={styles.initialsText}>{initials}</Text>
                <View style={styles.verifiedIcon}>
                  <Ionicons name="checkmark" size={10} color="white" />
                </View>
              </View>
              <View style={styles.workerInfo}>
                <Text style={styles.workerNameText}>{workerName}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}> 4.9 • Verified Partner</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.callFab}>
                <Ionicons name="call" size={22} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* PAYMENT SUMMARY */}
          <View style={styles.card}>
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalVal}>₹{totalDisplay}</Text>
            </View>
            <Text style={styles.paymentSub}>Include all taxes and service fees</Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/")}>
          <Text style={styles.primaryBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const getStyles = (darkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: darkMode ? "#000" : "#F8FAFC" },

  // Header Fix
  headerSafeArea: { backgroundColor: darkMode ? "#000" : "#FFF", zIndex: 10 },
  navHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
  },
  titleContainer: { alignItems: 'center' },
  navTitle: { fontSize: 16, fontWeight: '800', color: darkMode ? "#FFF" : "#1E293B" },
  liveTag: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  liveLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginLeft: 4 },
  pulseDot: { width: 6, height: 6, borderRadius: 3 },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Map Layout
  mapWrapper: { height: 240, width: '100%', overflow: 'hidden' },
  map: { flex: 1 },
  proMarker: { backgroundColor: Colors.primary, padding: 8, borderRadius: 14, borderWidth: 3, borderColor: 'white' },

  // Content
  contentContainer: { marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: darkMode ? "#000" : "#F8FAFC", paddingTop: 10 },
  card: { backgroundColor: darkMode ? "#111" : "#FFF", marginHorizontal: 16, marginBottom: 16, borderRadius: 24, padding: 20, elevation: 1 },
  cardHeader: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 20, letterSpacing: 1 },

  stepper: { marginLeft: 5 },
  stepRow: { flexDirection: 'row', minHeight: 65 },
  indicatorCol: { alignItems: 'center', marginRight: 16 },
  stepCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: darkMode ? "#222" : "#F1F5F9", alignItems: 'center', justifyContent: 'center' },
  circleActive: { backgroundColor: Colors.primary },
  stepLine: { width: 2, flex: 1, backgroundColor: '#F1F5F9', marginVertical: -4 },
  lineActive: { backgroundColor: Colors.primary },

  stepTextCol: { paddingTop: 6 },
  stepLabel: { fontSize: 15, fontWeight: '700', color: '#94A3B8' },
  labelActive: { color: darkMode ? "#FFF" : "#1E293B" },
  currentDesc: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginTop: 2 },

  workerBadgeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: darkMode ? "#111" : "#FFF", marginHorizontal: 16, padding: 16, borderRadius: 24, marginBottom: 16 },
  initialsCircle: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 18, fontWeight: '800', color: '#475569' },
  verifiedIcon: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary, borderWidth: 2, borderColor: 'white', alignItems: 'center', justifyContent: 'center' },
  workerInfo: { flex: 1, marginLeft: 16 },
  workerNameText: { fontSize: 17, fontWeight: '800', color: darkMode ? "#FFF" : "#1E293B" },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  callFab: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', elevation: 4 },

  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  totalVal: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  paymentSub: { fontSize: 11, color: '#94A3B8', marginTop: 4 },

  footer: { position: 'absolute', bottom: 30, width: '100%', paddingHorizontal: 20 },
  primaryBtn: { backgroundColor: '#1E293B', height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '800' }
})