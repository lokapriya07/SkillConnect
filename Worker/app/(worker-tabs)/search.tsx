import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Image,
} from "react-native";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Star,
  X,
  Zap,
  DollarSign,
  ChevronDown,
  Check,
  Calendar,
  CheckCircle,
  Phone,
  User,
  Wrench,
  Scissors,
  Sparkles,
  Hammer,
  Navigation,
  FileText,
  PlayCircle,
  Mic,
  Play,
  Pause,
  ZoomIn,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height, width } = Dimensions.get("window");

// --- Interfaces ---
// Defining this interface resolves the "Property does not exist" error
interface Job {
  _id?: string;
  id?: string;
  title?: string;
  description: string;
  client?: {
    name: string;
    rating: number;
    jobs: number;
  };
  userId?: {
    _id?: string;
    name?: string;
    rating?: number;
    jobsPosted?: number;
  };
  budget?:
    | number
    | {
        min: number;
        max: number;
        type: "fixed" | "hourly";
      };
  amount?: number;
  duration?: string;
  hours?: string | number;
  location: string;
  distance?: number;
  skills?: string[];
  skillsRequired?: string[];
  postedAt?: string;
  createdAt?: string;
  proposals?: number;
  category?: string;
  isUrgent?: boolean;
  matchScore?: number;
  // Enhanced fields for comprehensive display
  serviceName?: string;
  userName?: string;
  userPhone?: string;
  totalAmount?: number;
  scheduledDate?: string;
  scheduledTime?: string;
  fullAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  imagePath?: string;
  videoPath?: string;
  audioPath?: string;
  status?: string;
}

const CATEGORIES = ["All Categories", "Plumbing", "Electrical", "HVAC", "Carpentry", "Painting"];
const JOB_TYPES = ["All Types", "On-site", "Remote"];
const DISTANCES = [5, 10, 15, 25, 50, 100];

// --- Dynamic Icon & Color Mappers ---
const getServiceIcon = (serviceName: string) => {
  const name = serviceName?.toLowerCase() || "";
  if (name.includes("haircut") || name.includes("salon") || name.includes("beauty")) return Scissors;
  if (name.includes("cleaning") || name.includes("kitchen") || name.includes("bathroom") || name.includes("sofa")) return Sparkles;
  if (name.includes("plumbing") || name.includes("tap") || name.includes("drain")) return Wrench;
  if (name.includes("electrical") || name.includes("wiring") || name.includes("power")) return Zap;
  if (name.includes("carpentry") || name.includes("wood") || name.includes("furniture")) return Hammer;
  return Wrench;
};

const getServiceColor = (serviceName: string) => {
  const name = serviceName?.toLowerCase() || "";
  if (name.includes("haircut") || name.includes("salon") || name.includes("beauty")) return "#EC4899";
  if (name.includes("cleaning") || name.includes("kitchen") || name.includes("bathroom") || name.includes("sofa")) return "#007BFF";
  if (name.includes("plumbing") || name.includes("tap") || name.includes("drain")) return "#46A3FF";
  if (name.includes("electrical") || name.includes("wiring") || name.includes("power")) return "#FFB800";
  if (name.includes("carpentry") || name.includes("wood") || name.includes("furniture")) return "#8B4513";
  return "#2563eb";
};

// Avatar color palette based on first letter
const AVATAR_COLORS = [
  "#2563eb", "#16a34a", "#dc2626", "#9333ea",
  "#ea580c", "#0891b2", "#be185d", "#d97706",
];
const getAvatarColor = (name: string) => {
  const code = (name || "C").charCodeAt(0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

// Helper function to format time
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return dateString;
};

// Helper function to extract location string from GeoJSON or location object
const getLocationString = (location: any) => {
  if (!location) return "Location TBD";

  // If it's a string, return it directly
  if (typeof location === "string") return location;

  // If it's a GeoJSON object (has type and coordinates)
  if (location.type && location.coordinates) {
    return "Current Location"; // or return coordinates if needed
  }

  // If it's an object with address property
  if (location.address) return location.address;

  // Default fallback
  return "Location TBD";
};

const getJobBudgetLabel = (job: any) => {
  if (typeof job.budget === "number") {
    return `₹${job.budget}`;
  }

  if (job.budget?.min || job.budget?.max) {
    const min = job.budget.min ?? 0;
    const max = job.budget.max ?? min;
    return max > min ? `₹${min} - ₹${max}` : `₹${min}`;
  }

  if (job.totalAmount || job.amount || job.hiredAmount) {
    return `₹${job.totalAmount || job.amount || job.hiredAmount}`;
  }

  return "₹0";
};

const getJobBudgetType = (job: any) => {
  if (typeof job.budget === "object" && job.budget?.type === "hourly") return "Hourly";
  if (typeof job.budget === "object" && job.budget?.type === "fixed") return "Fixed";
  return job.totalAmount || job.amount || job.hiredAmount ? "Fixed" : "Hourly";
};

const getJobHoursLabel = (job: any) => {
  if (job.duration) return job.duration;
  if (job.hours) return `${job.hours}`;
  if (job.estimatedHours) return `${job.estimatedHours}`;
  if (job.scheduledTime) return `${job.scheduledTime}`;
  if (job.scheduledDate) return `${job.scheduledDate}`;
  return null;
};

// Enhanced address resolution with multiple fallbacks
const resolveAddress = (job: any) => {
  // Check job address fields in order of priority
  if (job.fullAddress?.trim()) return job.fullAddress.trim();
  if (job.address?.trim()) return job.address.trim();

  // Build address from city/state if available
  const parts = [];
  if (job.address?.trim()) parts.push(job.address.trim());
  if (job.city?.trim()) parts.push(job.city.trim());
  if (job.state?.trim()) parts.push(job.state.trim());

  if (parts.length > 0) return parts.join(', ');

  // Check user address as fallback
  const userAddress = job.userId?.fullAddress || job.userId?.address;
  if (userAddress?.trim()) return userAddress.trim();

  const userParts = [];
  if (job.userId?.address?.trim()) userParts.push(job.userId.address.trim());
  if (job.userId?.city?.trim()) userParts.push(job.userId.city.trim());
  if (job.userId?.state?.trim()) userParts.push(job.userId.state.trim());

  if (userParts.length > 0) return userParts.join(', ');

  // If coordinates exist, return coordinates as fallback
  const lat = job.location?.coordinates?.[1];
  const lng = job.location?.coordinates?.[0];
  if (lat && lng) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  // Return "No Address" only if nothing is available
  return "No Address";
};

// Smart title generation
const getSmartName = (job: any) => {
  if (job.serviceName?.trim()) return job.serviceName.trim();
  if (job.skillsRequired?.[0]) return job.skillsRequired[0];
  if (job.description?.trim()) return job.description.trim().split(/\s+/).slice(0, 5).join(' ');
  return 'Service Booking';
};

export default function JobsPage() {
  // Dynamic state for jobs
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("recommended");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [category, setCategory] = useState("All Categories");
  const [jobType, setJobType] = useState("All Types");
  const [distance, setDistance] = useState(25);
  const [activePicker, setActivePicker] = useState<"category" | "jobType" | null>(null);
  // Enhanced modal states
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  // Fetch jobs from backend
  const fetchJobs = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (!allJobs.length) setLoading(true);
      setError(null);
      
      const workerId = await AsyncStorage.getItem("userId") || await AsyncStorage.getItem("workerId");
      
      if (!workerId) {
        setError("Worker ID not found");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/jobs/worker-feed/${workerId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      console.log('[SEARCH] Fetched jobs:', data.length);
      setAllJobs(data || []);
    } catch (err) {
      console.error('[SEARCH] Fetch error:', err);
      setError(err instanceof Error ? err.message : "Failed to load jobs");
      if (!isRefresh) setAllJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [allJobs.length]);

  // Initial load + polling every 15 seconds
  useEffect(() => {
    fetchJobs();
    pollingRef.current = setInterval(() => fetchJobs(), 15000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchJobs]);

  const onRefresh = useCallback(() => fetchJobs(true), [fetchJobs]);

  // Build media URL safely
  const getMediaUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/^\//, "")}`;
  };

  // --- Image Preview Functions ---
  const openImagePreview = (url: string) => {
    setPreviewImageUrl(url);
    setImageZoom(1);
    setImagePreviewVisible(true);
  };

  const closeImagePreview = () => {
    setImagePreviewVisible(false);
    setPreviewImageUrl(null);
    setImageZoom(1);
  };

  const toggleZoom = () => {
    setImageZoom(prev => prev === 1 ? 2 : 1);
  };

  // --- Google Maps Integration ---
  const openInMaps = (job: Job) => {
    const lat = job.latitude;
    const lng = job.longitude;
    const label = encodeURIComponent(job.serviceName || job.title || "Service Location");

    let url: string;

    if (lat && lng) {
      // Use coordinates when available (most accurate)
      if (Platform.OS === "ios") {
        url = `maps:0,0?q=${lat},${lng}(${label})`;
      } else {
        url = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
      }
    } else if (job.address && job.address !== "Address not available") {
      // Fallback: search by address string
      const encodedAddress = encodeURIComponent(job.address);
      url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    } else {
      Alert.alert("No Location", "This job doesn't have a location yet.");
      return;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Final fallback: Google Maps web
          const encodedAddress = encodeURIComponent(job.address || "");
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
        }
      })
      .catch(() => Alert.alert("Error", "Could not open maps"));
  };

  const filteredJobs = useMemo(() => {
    let list = activeTab === "recommended" ? allJobs.slice(0, 5) : allJobs;

    if (searchQuery) {
      list = list.filter((j) =>
        j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.skillsRequired?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (category !== "All Categories") {
      list = list.filter((j) =>
        j.category === category ||
        j.skillsRequired?.some(skill => skill.toLowerCase().includes(category.toLowerCase())) ||
        j.serviceName?.toLowerCase().includes(category.toLowerCase())
      );
    }

    return list;
  }, [searchQuery, activeTab, allJobs, category]);

  // --- MODAL COMPONENTS ---

  const DetailsModal = () => {
    if (!selectedJob) return null;

    const clientName = selectedJob.client?.name || selectedJob.userId?.name || selectedJob.userName || "Unknown Client";
    const clientRating = selectedJob.client?.rating || selectedJob.userId?.rating || 0;
    const clientJobs = selectedJob.client?.jobs || selectedJob.userId?.jobsPosted || 0;
    const skills = selectedJob.skills || selectedJob.skillsRequired || [];
    const postedTime = formatTimeAgo(selectedJob.createdAt || selectedJob.postedAt || new Date().toISOString());
    const jobTitle = getSmartName(selectedJob);
    const serviceColor = getServiceColor(jobTitle);
    const ServiceIcon = getServiceIcon(jobTitle);
    const resolvedAddress = resolveAddress(selectedJob);

    return (
      <Modal visible={!!selectedJob} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: height * 0.9 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>{jobTitle}</Text>
              <TouchableOpacity onPress={() => setSelectedJob(null)}>
                <X size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {/* Service Header with Icon */}
              <View style={styles.serviceHeader}>
                <View style={[styles.serviceIconWrap, { backgroundColor: serviceColor + '20' }]}>
                  <ServiceIcon size={24} color={serviceColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceTitle}>{jobTitle}</Text>
                  {selectedJob?.isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Zap size={12} color="#ea580c" fill="#ea580c" />
                      <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Meta Information */}
              <View style={styles.detailsMetaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={16} color="#64748b" />
                  <Text style={styles.metaText}>{resolvedAddress}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={16} color="#64748b" />
                  <Text style={styles.metaText}>Posted {postedTime}</Text>
                </View>
              </View>

              {/* Pricing Card */}
              <View style={styles.detailsPricingCard}>
                <View>
                  <Text style={styles.detailsLabel}>Budget</Text>
                  <Text style={styles.detailsValue}>{getJobBudgetLabel(selectedJob)}</Text>
                </View>
                <View style={styles.dividerVertical} />
                <View>
                  <Text style={styles.detailsLabel}>Type</Text>
                  <Text style={styles.detailsValue}>{getJobBudgetType(selectedJob)}{selectedJob?.budget?.type === 'hourly' ? ' Rate' : ''}</Text>
                </View>
              </View>
              {getJobHoursLabel(selectedJob) && (
                <View style={styles.detailsMetaRow}>
                  <View style={styles.metaItem}>
                    <Clock size={16} color="#64748b" />
                    <Text style={styles.metaText}>{getJobHoursLabel(selectedJob)}</Text>
                  </View>
                </View>
              )}

              {/* Description */}
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionFull}>{selectedJob?.description}</Text>

              {/* Skills Required */}
              {skills.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Required Skills</Text>
                  <View style={styles.skillWrap}>
                    {skills.map((skill) => (
                      <View key={skill} style={styles.distChip}>
                        <Text style={styles.distText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Client Information */}
              <View style={styles.clientDetailsCard}>
                <Text style={styles.sectionTitle}>About Client</Text>
                <View style={styles.clientInfoRow}>
                  <View style={[styles.clientAvatarLarge, { backgroundColor: getAvatarColor(clientName) }]}>
                    <Text style={styles.clientAvatarInitial}>
                      {(clientName || "C").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientNameLarge}>{clientName}</Text>
                    <View style={styles.clientMetaRow}>
                      <Star size={14} color="#eab308" fill="#eab308" />
                      <Text style={styles.clientMetaText}>{clientRating.toFixed(1)} Rating • {clientJobs} jobs posted</Text>
                    </View>
                    {selectedJob?.userPhone && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${selectedJob.userPhone}`)}
                        style={styles.phoneRow}
                      >
                        <Phone size={13} color="#2563eb" />
                        <Text style={styles.clientPhone}>{selectedJob.userPhone}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Service Address */}
              {resolvedAddress && resolvedAddress !== "No Address" && (
                <View style={styles.addressSection}>
                  <Text style={styles.sectionTitle}>Service Address</Text>
                  <TouchableOpacity
                    style={styles.addressCard}
                    onPress={() => selectedJob && openInMaps(selectedJob)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addressIconWrap}>
                      <MapPin size={18} color="#EA4335" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addressText}>{resolvedAddress}</Text>
                      {selectedJob.latitude && selectedJob.longitude && (
                        <Text style={styles.coordinatesText}>
                          📍 {selectedJob.latitude.toFixed(4)}, {selectedJob.longitude.toFixed(4)}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.navigateBtn}
                      onPress={() => selectedJob && openInMaps(selectedJob)}
                    >
                      <Navigation size={16} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              )}

              {/* Uploaded Media */}
              {(selectedJob?.imagePath || selectedJob?.videoPath || selectedJob?.audioPath) && (
                <View style={styles.mediaSection}>
                  <Text style={styles.sectionTitle}>Uploaded Media</Text>

                  {/* Image Thumbnail */}
                  {selectedJob.imagePath && (() => {
                    const imgUrl = getMediaUrl(selectedJob.imagePath);
                    return imgUrl ? (
                      <TouchableOpacity
                        onPress={() => openImagePreview(imgUrl)}
                        style={styles.mediaThumbnailWrap}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={{ uri: imgUrl }}
                          style={styles.mediaThumbnail}
                          resizeMode="cover"
                        />
                        <View style={styles.mediaOverlayTag}>
                          <Search size={12} color="#fff" />
                          <Text style={styles.mediaOverlayText}>Tap to enlarge</Text>
                        </View>
                      </TouchableOpacity>
                    ) : null;
                  })()}

                  {/* Video Link */}
                  {selectedJob.videoPath && (() => {
                    const vidUrl = getMediaUrl(selectedJob.videoPath);
                    return vidUrl ? (
                      <TouchableOpacity
                        style={styles.mediaLinkCard}
                        onPress={() => Linking.openURL(vidUrl)}
                      >
                        <View style={[styles.mediaLinkIcon, { backgroundColor: "#eff6ff" }]}>
                          <PlayCircle size={20} color="#2563eb" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.mediaLinkTitle}>Video Recording</Text>
                          <Text style={styles.mediaLinkSub}>Tap to play video</Text>
                        </View>
                        <Search size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    ) : null;
                  })()}

                  {/* Audio Link */}
                  {selectedJob.audioPath && (() => {
                    const audUrl = getMediaUrl(selectedJob.audioPath);
                    return audUrl ? (
                      <TouchableOpacity
                        style={styles.mediaLinkCard}
                        onPress={() => Linking.openURL(audUrl)}
                      >
                        <View style={[styles.mediaLinkIcon, { backgroundColor: "#f0fdf4" }]}>
                          <Mic size={20} color="#16a34a" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.mediaLinkTitle}>Audio Recording</Text>
                          <Text style={styles.mediaLinkSub}>Tap to play audio</Text>
                        </View>
                        <Search size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    ) : null;
                  })()}
                </View>
              )}

              {/* Match Score */}
              {selectedJob.matchScore && (
                <View style={styles.matchScoreCard}>
                  <Text style={styles.sectionTitle}>Match Score</Text>
                  <View style={styles.matchScoreRow}>
                    <Text style={styles.matchScoreText}>{selectedJob.matchScore}% Match</Text>
                    <View style={styles.matchScoreBar}>
                      <View style={[styles.matchScoreFill, { width: `${selectedJob.matchScore}%` }]} />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.submitFilter} onPress={() => { setSelectedJob(null); alert("Application Sent!"); }}>
              <Text style={styles.submitFilterText}>Submit Proposal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const PickerModal = ({ title, options, selected, onSelect, visible }: any) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContent}>
          <Text style={styles.pickerTitle}>{title}</Text>
          {options.map((opt: string) => (
            <TouchableOpacity key={opt} style={styles.pickerItem} onPress={() => onSelect(opt)}>
              <Text style={[styles.pickerItemText, selected === opt && styles.activePickerItemText]}>{opt}</Text>
              {selected === opt && <Check size={18} color="#2563eb" />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setActivePicker(null)} style={styles.pickerClose}>
            <Text style={styles.pickerCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // --- IMAGE PREVIEW MODAL ---

  const ImagePreviewModal = () => (
    <Modal visible={imagePreviewVisible} animationType="fade" transparent>
      <View style={styles.imagePreviewOverlay}>
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePreviewHeader}>
            <TouchableOpacity onPress={closeImagePreview} style={styles.imagePreviewClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleZoom} style={styles.imagePreviewZoom}>
              <ZoomIn size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: previewImageUrl }}
            style={[
              styles.imagePreviewImage,
              imageZoom && { width: width * 1.5, height: height * 0.8 }
            ]}
            resizeMode={imageZoom ? "contain" : "contain"}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.paddingBox}>
        <Text style={styles.pageTitle}>Browse Jobs</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterTrigger} onPress={() => setIsFilterOpen(true)}>
            <Filter size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          {["recommended", "all"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              style={[styles.tab, activeTab === t && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          colors={["#2563eb"]} 
          tintColor="#2563eb" 
        />
      }>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading jobs...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryBtn}
              onPress={() => fetchJobs()}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.noJobsText}>No jobs found</Text>
            <Text style={styles.subText}>Try adjusting your filters or search</Text>
          </View>
        ) : (
          filteredJobs.map(job => {
            const jobId = job._id || job.id;
            const clientName = job.client?.name || job.userId?.name || "Unknown Client";
            const clientRating = job.client?.rating || job.userId?.rating || 0;
            const clientJobs = job.client?.jobs || job.userId?.jobsPosted || 0;
            const skills = job.skills || job.skillsRequired || [];
            const postedTime = formatTimeAgo(job.createdAt || job.postedAt || new Date().toISOString());

            return (
              <View key={jobId} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Text style={styles.jobTitle} numberOfLines={1}>{job.title || job.description.slice(0, 50)}</Text>
                      {job.isUrgent && (
                        <View style={styles.urgentBadge}>
                          <Zap size={10} color="#ea580c" fill="#ea580c" />
                          <Text style={styles.urgentText}>Urgent</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.clientMeta}>{clientName} • ⭐ {clientRating.toFixed(1)}</Text>
                  </View>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>{job.matchScore || 85}% Match</Text>
                  </View>
                </View>
                <Text style={styles.description} numberOfLines={2}>{job.description}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <DollarSign size={14} color="#0f172a" />
                    <Text style={styles.priceText}>{getJobBudgetLabel(job)}</Text>
                    <Text style={styles.budgetType}> {getJobBudgetType(job)}</Text>
                  </View>
                  {getJobHoursLabel(job) && (
                    <View style={styles.metaItem}>
                      <Clock size={14} color="#64748b" />
                      <Text style={styles.metaText}>{getJobHoursLabel(job)}</Text>
                    </View>
                  )}
                  <View style={styles.metaItem}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.metaText}>{getLocationString(job.location)}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.proposals}>{job.proposals || 0} proposals</Text>
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => setSelectedJob(job)}
                  >
                    <Text style={styles.applyBtnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* MODALS */}
      <DetailsModal />
      <ImagePreviewModal />

      <Modal visible={isFilterOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterOpen(false)}><X size={24} color="#0f172a" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setActivePicker("category")}>
                <Text style={styles.dropdownValue}>{category}</Text>
                <ChevronDown size={18} color="#64748b" />
              </TouchableOpacity>
              <View style={styles.spacer} />
              <Text style={styles.label}>Distance (Miles)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.distanceRow}>
                {DISTANCES.map(d => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDistance(d)}
                    style={[styles.distChip, distance === d && styles.activeDistChip]}
                  >
                    <Text style={[styles.distText, distance === d && styles.activeDistText]}>{d} mi</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.spacer} />
              <Text style={styles.label}>Job Type</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setActivePicker("jobType")}>
                <Text style={styles.dropdownValue}>{jobType}</Text>
                <ChevronDown size={18} color="#64748b" />
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={styles.submitFilter} onPress={() => setIsFilterOpen(false)}>
              <Text style={styles.submitFilterText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
        <PickerModal
          title="Select Category"
          options={CATEGORIES}
          selected={category}
          visible={activePicker === "category"}
          onSelect={(val: string) => { setCategory(val); setActivePicker(null); }}
        />
        <PickerModal
          title="Select Job Type"
          options={JOB_TYPES}
          selected={jobType}
          visible={activePicker === "jobType"}
          onSelect={(val: string) => { setJobType(val); setActivePicker(null); }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  paddingBox: { padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#0f172a", marginBottom: 12 },
  searchRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 12, height: 44, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  filterTrigger: { width: 44, height: 44, backgroundColor: "#fff", borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  tabsContainer: { flexDirection: "row", backgroundColor: "#e2e8f0", padding: 4, borderRadius: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#fff" },
  tabText: { fontWeight: "600", color: "#64748b" },
  activeTabText: { color: "#0f172a" },
  listContainer: { padding: 16 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 300, gap: 16 },
  loadingText: { fontSize: 16, color: "#64748b", marginTop: 8 },
  errorText: { fontSize: 16, color: "#ef4444", textAlign: "center", fontWeight: "600" },
  noJobsText: { fontSize: 18, color: "#0f172a", fontWeight: "bold", textAlign: "center" },
  subText: { fontSize: 14, color: "#64748b", textAlign: "center" },
  retryBtn: { backgroundColor: "#2563eb", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: "#fff", fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: 'wrap' },
  jobTitle: { fontSize: 16, fontWeight: "bold", color: "#0f172a", maxWidth: width * 0.6 },
  urgentBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff7ed", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  urgentText: { color: "#ea580c", fontSize: 10, fontWeight: "bold" },
  matchBadge: { backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  matchText: { color: "#2563eb", fontSize: 11, fontWeight: "bold" },
  clientMeta: { fontSize: 13, color: "#64748b", marginTop: 2 },
  description: { fontSize: 14, color: "#475569", lineHeight: 20, marginVertical: 10 },
  metaRow: { flexDirection: "row", gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#64748b" },
  priceText: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },
  budgetType: { fontSize: 11, color: "#64748b", fontStyle: "italic" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12 },
  proposals: { fontSize: 12, color: "#94a3b8" },
  applyBtn: { backgroundColor: "#0f172a", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  applyBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  label: { fontSize: 15, fontWeight: "bold", marginBottom: 10 },
  dropdown: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  dropdownValue: { color: "#0f172a" },
  spacer: { height: 24 },
  distanceRow: { gap: 10 },
  distChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0", marginRight: 8 },
  activeDistChip: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  distText: { color: "#64748b", fontWeight: "600", fontSize: 12 },
  activeDistText: { color: "#fff" },
  submitFilter: { backgroundColor: "#0f172a", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  submitFilterText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  pickerContent: { width: width * 0.8, backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  pickerTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  pickerItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  pickerItemText: { fontSize: 16, color: "#475569" },
  activePickerItemText: { color: "#2563eb", fontWeight: "bold" },
  pickerClose: { marginTop: 15, alignItems: "center" },
  pickerCloseText: { color: "#ef4444", fontWeight: "bold" },
  detailsMetaRow: { flexDirection: 'row', gap: 15, marginTop: 10, alignItems: 'center' },
  detailsPricingCard: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginVertical: 20, justifyContent: 'space-around', alignItems: 'center' },
  detailsLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  detailsValue: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  dividerVertical: { width: 1, height: 30, backgroundColor: '#e2e8f0' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 15, marginBottom: 10 },
  descriptionFull: { fontSize: 15, color: '#475569', lineHeight: 24 },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clientDetailsCard: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 20, backgroundColor: '#fff' },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  clientMetaText: { fontSize: 14, color: '#64748b', marginLeft: 5 },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
  serviceIconWrap: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  serviceTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', flex: 1 },
  clientInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clientAvatarLarge: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  clientAvatarInitial: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  clientNameLarge: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  clientMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  clientPhone: { fontSize: 14, color: '#2563eb', marginLeft: 6, textDecorationLine: 'underline' },
  addressSection: { marginTop: 20 },
  addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  addressIconWrap: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addressText: { fontSize: 15, color: '#0f172a', fontWeight: '500', flex: 1 },
  coordinatesText: { fontSize: 12, color: '#64748b', marginTop: 4 },
  navigateBtn: { backgroundColor: '#EA4335', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  mediaSection: { marginTop: 20 },
  mediaThumbnailWrap: { position: 'relative', marginBottom: 12 },
  mediaThumbnail: { width: '100%', height: 200, borderRadius: 12 },
  mediaOverlayTag: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  mediaOverlayText: { color: '#fff', fontSize: 11, fontWeight: '500' },
  mediaLinkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 },
  mediaLinkIcon: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mediaLinkTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  mediaLinkSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  matchScoreCard: { backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: '#e0f2fe' },
  matchScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  matchScoreText: { fontSize: 16, fontWeight: 'bold', color: '#0369a1' },
  matchScoreBar: { flex: 1, height: 6, backgroundColor: '#e0f2fe', borderRadius: 3 },
  matchScoreFill: { height: '100%', backgroundColor: '#0369a1', borderRadius: 3 },
  imagePreviewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  imagePreviewContainer: { width: width * 0.95, height: height * 0.8, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden' },
  imagePreviewHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  imagePreviewClose: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
  imagePreviewZoom: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
  imagePreviewImage: { width: width * 0.95, height: height * 0.8, resizeMode: 'contain' }
});