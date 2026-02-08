import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import {
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle,
  Calendar,
  Upload,
  AlertTriangle,
  ArrowRight,
  X,
  MapPin,
  Phone,
  User,
  Wrench,
  Scissors,
  Sparkles,
  Zap,
  Hammer,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height } = Dimensions.get("window");

// --- Interfaces ---
interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: "pending" | "in-progress" | "completed" | "paid";
}

interface AssignedJob {
  _id: string;
  serviceName?: string;
  title?: string;
  description: string;
  budget: number;
  skillsRequired: string[];
  status: string;
  userId: string;
  assignedWorker: {
    workerId: string;
    workerName: string;
    workerProfilePic?: string;
    assignedAt: string;
  };
  location: {
    coordinates: [number, number];
  };
  createdAt: string;
  userName?: string;
  userPhone?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  address?: string;
}

// --- Service Icons Map ---
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

// --- Service-Specific Mock Details ---
const getServiceMockDetails = (serviceName: string, job: any) => {
  const name = serviceName?.toLowerCase() || "";
  
  // Haircut/Salon services
  if (name.includes("haircut") || name.includes("salon") || name.includes("beauty")) {
    return {
      serviceType: "Salon at Home",
      requirements: ["All equipment provided", "Power backup required", "Water access needed"],
      notes: "Client prefers organic products. Please arrive 5 minutes early.",
      duration: "45-60 mins",
      addOns: ["Head massage", "Beard trim", "Face pack"],
    };
  }
  
  // Cleaning services
  if (name.includes("cleaning") || name.includes("kitchen") || name.includes("bathroom") || name.includes("sofa")) {
    return {
      serviceType: "Home Cleaning",
      requirements: ["Access to water and electricity", "Parking space available", "Keep pets away"],
      notes: "Focus on deep cleaning of mentioned areas. Eco-friendly products available.",
      duration: "2-4 hours",
      addOns: ["Window cleaning", "Cabinet cleaning", "Appliance cleaning"],
    };
  }
  
  // Plumbing services
  if (name.includes("plumbing") || name.includes("tap") || name.includes("drain") || name.includes("tank")) {
    return {
      serviceType: "Plumbing",
      requirements: ["Access to main water valve", "Tools available", "Clear working space"],
      notes: "Check for leaks before starting. Bring replacement parts if needed.",
      duration: "1-2 hours",
      addOns: ["Leak detection", "Pipe insulation", "Water heater check"],
    };
  }
  
  // Electrical services
  if (name.includes("electrical") || name.includes("wiring") || name.includes("power") || name.includes("fan")) {
    return {
      serviceType: "Electrical",
      requirements: ["Main switch access", "Ladder available", "Clear work area"],
      notes: "Safety first. Turn off main power before working. Test after completion.",
      duration: "1-2 hours",
      addOns: ["Wiring check", "Switchboard installation", "Fan installation"],
    };
  }
  
  // Carpentry services
  if (name.includes("carpentry") || name.includes("wood") || name.includes("furniture")) {
    return {
      serviceType: "Carpentry",
      requirements: ["Work area clearance", "Power access", "Paint/varnish if needed"],
      notes: "Handle furniture with care. Clean up sawdust after work.",
      duration: "2-4 hours",
      addOns: ["Polish", "Repair", "Assembly"],
    };
  }
  
  // Default service details
  return {
    serviceType: "Home Service",
    requirements: ["Access to location", "Clear working space"],
    notes: "Please arrive on time and complete the job professionally.",
    duration: "1-2 hours",
    addOns: [],
  };
};

// --- Job Display Types ---
interface DisplayJob {
  id: string;
  title: string;
  client: string;
  clientAvatar: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  progress: number;
  isOnline?: boolean;
  unreadMessages?: number;
  milestones: Milestone[];
  isAssignedJob?: boolean;
  // Booked service properties
  userName?: string;
  userPhone?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  address?: string;
  serviceDetails?: ServiceDetails;
  originalJob?: any;
  // Legacy job properties
  startDate?: string;
  dueDate?: string;
}

interface ServiceDetails {
  serviceType: string;
  requirements: string[];
  notes: string;
  duration: string;
  addOns: string[];
}

// Mock booked services with dynamic data
const mockBookedServices: DisplayJob[] = [
  {
    id: "book-1",
    title: "Haircut & Styling",
    client: "Priya Sharma",
    clientAvatar: "P",
    userName: "Priya Sharma",
    userPhone: "+91 98765 43210",
    totalAmount: 499,
    paidAmount: 0,
    scheduledDate: "10 Dec 2024",
    scheduledTime: "10:00 AM - 11:00 AM",
    status: "upcoming",
    progress: 0,
    isAssignedJob: true,
    address: "123, Sunshine Apartments, Sector 15, Noida, UP",
    serviceDetails: {
      serviceType: "Salon at Home",
      requirements: ["All equipment provided", "Power backup required", "Water access needed"],
      notes: "Client prefers organic products. Please arrive 5 minutes early.",
      duration: "45-60 mins",
      addOns: ["Head massage", "Beard trim", "Face pack"],
    },
    milestones: [{ id: "m1", title: "Complete service", amount: 499, status: "pending" }],
  },
  {
    id: "book-2",
    title: "Kitchen Deep Cleaning",
    client: "Amit Kumar",
    clientAvatar: "A",
    userName: "Amit Kumar",
    userPhone: "+91 87654 32109",
    totalAmount: 799,
    paidAmount: 799,
    scheduledDate: "Dec 8, 2024",
    scheduledTime: "09:00 AM - 12:00 PM",
    status: "in-progress",
    progress: 35,
    isAssignedJob: true,
    address: "456, Green Valley Society, Indirapuram, Ghaziabad, UP",
    serviceDetails: {
      serviceType: "Home Cleaning",
      requirements: ["Access to water and electricity", "Parking space available", "Keep pets away"],
      notes: "Focus on deep cleaning of kitchen cabinets and chimney.",
      duration: "3 hours",
      addOns: ["Window cleaning", "Cabinet cleaning", "Appliance cleaning"],
    },
    milestones: [{ id: "m1", title: "Kitchen deep cleaning", amount: 799, status: "in-progress" }],
  },
  {
    id: "book-3",
    title: "Bathroom Plumbing Repair",
    client: "Rahul Singh",
    clientAvatar: "R",
    userName: "Rahul Singh",
    userPhone: "+91 76543 21098",
    totalAmount: 349,
    paidAmount: 0,
    scheduledDate: "Dec 12, 2024",
    scheduledTime: "02:00 PM - 03:30 PM",
    status: "upcoming",
    progress: 0,
    isAssignedJob: true,
    address: "789, Royal Enclave, Vasundhara, Sector 4, Ghaziabad, UP",
    serviceDetails: {
      serviceType: "Plumbing",
      requirements: ["Access to main water valve", "Tools available", "Clear working space"],
      notes: "Check for leaks in the bathroom pipeline. Bring replacement washers.",
      duration: "1.5 hours",
      addOns: ["Leak detection", "Pipe insulation", "Water heater check"],
    },
    milestones: [{ id: "m1", title: "Bathroom plumbing repair", amount: 349, status: "pending" }],
  },
  {
    id: "book-4",
    title: "Full Home Electrical Wiring Check",
    client: "Neha Gupta",
    clientAvatar: "N",
    userName: "Neha Gupta",
    userPhone: "+91 65432 10987",
    totalAmount: 899,
    paidAmount: 450,
    scheduledDate: "Dec 6, 2024",
    scheduledTime: "11:00 AM - 01:00 PM",
    status: "in-progress",
    progress: 60,
    isAssignedJob: true,
    address: "321, Tower Block, Mayur Vihar Phase 1, Delhi, NCR",
    serviceDetails: {
      serviceType: "Electrical",
      requirements: ["Main switch access", "Ladder available", "Clear work area"],
      notes: "Full wiring inspection needed. Check all switches and sockets.",
      duration: "2 hours",
      addOns: ["Wiring check", "Switchboard installation", "Fan installation"],
    },
    milestones: [{ id: "m1", title: "Full wiring inspection", amount: 899, status: "in-progress" }],
  },
  {
    id: "book-5",
    title: "Sofa Cleaning",
    client: "Vikram Patel",
    clientAvatar: "V",
    userName: "Vikram Patel",
    userPhone: "+91 54321 09876",
    totalAmount: 599,
    paidAmount: 599,
    scheduledDate: "Dec 5, 2024",
    scheduledTime: "10:00 AM - 12:00 PM",
    status: "completed",
    progress: 100,
    isAssignedJob: true,
    address: "654, Lake View Apartments, Sector 62, Noida, UP",
    serviceDetails: {
      serviceType: "Home Cleaning",
      requirements: ["Access to water", "Clear sofa area", "Ventilation"],
      notes: "L-shape sofa and 2 single seaters. Heavy stain removal needed on armrests.",
      duration: "2 hours",
      addOns: ["Stain removal", "Deodorizing", "Fabric protection"],
    },
    milestones: [{ id: "m1", title: "Sofa cleaning", amount: 599, status: "completed" }],
  },
  {
    id: "book-6",
    title: "Fan Installation & Repair",
    client: "Anjali Reddy",
    clientAvatar: "A",
    userName: "Anjali Reddy",
    userPhone: "+91 43210 98765",
    totalAmount: 299,
    paidAmount: 0,
    scheduledDate: "Dec 15, 2024",
    scheduledTime: "04:00 PM - 05:30 PM",
    status: "upcoming",
    progress: 0,
    isAssignedJob: true,
    address: "987, Heritage Homes, Raj Nagar Extension, Ghaziabad, UP",
    serviceDetails: {
      serviceType: "Electrical",
      requirements: ["Ladder required", "Power access", "New fan available"],
      notes: "Install 2 ceiling fans and repair 1 wall-mounted fan.",
      duration: "1.5 hours",
      addOns: ["Wiring check", "Remote installation", "Balancing"],
    },
    milestones: [{ id: "m1", title: "Fan installation & repair", amount: 299, status: "pending" }],
  },
];

const activeJobs = [
  {
    id: "1",
    title: "Electrical Panel Upgrade",
    client: "Mike Johnson",
    clientAvatar: "M",
    totalAmount: 2800,
    paidAmount: 1000,
    startDate: "05 Dec 2024",
    dueDate: "12 Dec 2024",
    status: "in-progress",
    progress: 45,
    unreadMessages: 2,
    isOnline: true,
    milestones: [
      { id: "m1", title: "Initial inspection & planning", amount: 500, status: "completed" },
      { id: "m2", title: "Permit acquisition", amount: 500, status: "completed" },
      { id: "m3", title: "Panel installation", amount: 1200, status: "in-progress" },
      { id: "m4", title: "Final inspection & cleanup", amount: 600, status: "pending" },
    ],
  },
];

const completedJobs = [
  {
    id: "3",
    title: "Bathroom Plumbing Repair",
    client: "John Smith",
    clientAvatar: "J",
    totalAmount: 350,
    paidAmount: 350,
    startDate: "28 Nov 2024",
    dueDate: "30 Nov 2024",
    status: "completed",
    progress: 100,
    unreadMessages: 0,
    isOnline: false,
    milestones: [{ id: "m1", title: "Full repair", amount: 350, status: "paid" }],
  },
];

const disputedJobs = [
  {
    id: "4",
    title: "HVAC Maintenance",
    client: "ABC Properties",
    clientAvatar: "A",
    totalAmount: 150,
    paidAmount: 75,
    startDate: "20 Nov 2024",
    dueDate: "21 Nov 2024",
    status: "disputed",
    progress: 100,
    unreadMessages: 5,
    isOnline: true,
    milestones: [{ id: "m1", title: "Maintenance service", amount: 150, status: "pending" }],
  },
];

export default function ActiveJobsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [assignedJobs, setAssignedJobs] = useState<AssignedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null);
  
  // --- Fetch Assigned Jobs ---
  useEffect(() => {
    const fetchAssignedJobs = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (!userStr) {
          setLoading(false);
          return;
        }
        
        const user = JSON.parse(userStr);
        const workerId = user.workerProfileId || user._id;
        
        if (!workerId) {
          setLoading(false);
          return;
        }
        
        const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.9:5000";
        const response = await fetch(`${API_URL}/api/jobs/worker/${workerId}/assigned-jobs`);
        const data = await response.json();
        
        if (data.success && data.jobs) {
          setAssignedJobs(data.jobs);
        }
      } catch (error) {
        console.error('Error fetching assigned jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignedJobs();
  }, []);

  // --- Accept Job Function ---
  const handleAcceptJob = async (job: any) => {
    try {
      setAcceptingJobId(job.id);
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.9:5000";
      
      const response = await fetch(`${API_URL}/api/jobs/worker/${job.id}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the job status locally
        setAssignedJobs(prevJobs => 
          prevJobs.map(j => 
            j._id === job.id 
              ? { ...j, status: 'in_progress', originalJob: { ...j, status: 'in_progress' } }
              : j
          )
        );
        
        // Update selected job if it's the same job
        if (selectedJob?.id === job.id) {
          setSelectedJob(prev => ({ ...prev, status: 'in_progress' }));
        }
        
        Alert.alert('Success', 'Job accepted successfully! It is now in progress.');
      } else {
        Alert.alert('Error', data.error || 'Failed to accept job');
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      Alert.alert('Error', 'Failed to accept job. Please try again.');
    } finally {
      setAcceptingJobId(null);
    }
  };

  // --- Transform Assigned Jobs to Display Format ---
  const displayAssignedJobs = useMemo(() => {
    // Transform API jobs to display format
    const apiJobs = assignedJobs.map((job: any) => {
      const mockDetails = getServiceMockDetails(job.serviceName || job.title || job.description, job);
      return {
        id: job._id,
        title: job.serviceName || job.title || job.description || "Service Job",
        client: job.userName || "Customer",
        clientAvatar: (job.userName || "C").charAt(0).toUpperCase(),
        userName: job.userName || "Customer",
        userPhone: job.userPhone || "+91 00000 00000",
        userEmail: job.userEmail || "",
        totalAmount: job.budget || 0,
        paidAmount: 0,
        scheduledDate: job.scheduledDate || new Date(job.createdAt).toLocaleDateString("en-GB"),
        scheduledTime: job.scheduledTime || "09:00 AM - 10:00 AM",
        status: job.status === "assigned" ? "upcoming" : job.status === "in_progress" ? "in-progress" : job.status === "completed" ? "completed" : "upcoming",
        progress: job.status === "in_progress" ? 50 : 0,
        unreadMessages: 0,
        isOnline: false,
        address: job.address || "Address not available",
        serviceDetails: mockDetails,
        milestones: [{ id: "m1", title: "Complete service", amount: job.budget || 0, status: "pending" }],
        isAssignedJob: true,
        originalJob: job,
      };
    });
    
    // Return API jobs if available, otherwise show mock data for demo
    if (apiJobs.length > 0) {
      return apiJobs;
    }
    
    // Fallback to mock data for demo
    return mockBookedServices;
  }, [assignedJobs]);

  // --- Transform Legacy Jobs to Display Format ---
  const legacyActiveJobs = activeJobs.map((job: any) => ({
    ...job,
    scheduledDate: job.startDate,
    scheduledTime: "09:00 AM - 05:00 PM",
    userName: job.client,
    userPhone: "+91 00000 00000",
    address: "Client Address",
    serviceDetails: {
      serviceType: "Home Service",
      requirements: ["Access to location", "Clear working space"],
      notes: "",
      duration: "2-4 hours",
      addOns: [],
    },
  }));

  const legacyCompletedJobs = completedJobs.map((job: any) => ({
    ...job,
    scheduledDate: job.startDate,
    scheduledTime: "09:00 AM - 05:00 PM",
    userName: job.client,
    userPhone: "+91 00000 00000",
    address: "Client Address",
    serviceDetails: {
      serviceType: "Home Service",
      requirements: ["Access to location", "Clear working space"],
      notes: "",
      duration: "2-4 hours",
      addOns: [],
    },
  }));

  const legacyDisputedJobs = disputedJobs.map((job: any) => ({
    ...job,
    scheduledDate: job.startDate,
    scheduledTime: "09:00 AM - 05:00 PM",
    userName: job.client,
    userPhone: "+91 00000 00000",
    address: "Client Address",
    serviceDetails: {
      serviceType: "Home Service",
      requirements: ["Access to location", "Clear working space"],
      notes: "",
      duration: "2-4 hours",
      addOns: [],
    },
  }));

  // --- Status Rendering Logic ---
  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return <View style={[styles.badge, styles.bgPrimarySoft]}><Text style={styles.textPrimary}>In Progress</Text></View>;
      case "upcoming":
        return <View style={[styles.badge, styles.bgAmberSoft]}><Text style={styles.textAmber}>Upcoming</Text></View>;
      case "completed":
        return <View style={[styles.badge, styles.bgGreenSoft]}><CheckCircle size={12} color="#15803d" style={{ marginRight: 4 }} /><Text style={styles.textGreen}>Completed</Text></View>;
      case "disputed":
        return <View style={[styles.badge, styles.bgRedSoft]}><AlertTriangle size={12} color="#b91c1c" style={{ marginRight: 4 }} /><Text style={styles.textRed}>Disputed</Text></View>;
      default:
        return <View style={[styles.badge, styles.bgSecondary]}><Text style={styles.textSecondary}>{status}</Text></View>;
    }
  };

  const getMilestoneStatusBadge = (status: Milestone["status"]) => {
    switch (status) {
      case "pending":
        return <View style={[styles.badge, styles.bgSecondary]}><Text style={styles.textSecondary}>Pending</Text></View>;
      case "in-progress":
        return <View style={[styles.badge, styles.bgPrimarySoft]}><Text style={styles.textPrimary}>In Progress</Text></View>;
      case "completed":
        return <View style={[styles.badge, styles.bgGreenSoft]}><CheckCircle size={12} color="#15803d" style={{ marginRight: 4 }} /><Text style={styles.textGreen}>Complete</Text></View>;
      case "paid":
        return <View style={[styles.badge, styles.bgGreenSoft]}><DollarSign size={12} color="#15803d" style={{ marginRight: 4 }} /><Text style={styles.textGreen}>Paid</Text></View>;
    }
  };

  // --- Filter Logic ---
  const currentDisplayJobs = useMemo(() => {
    if (activeTab === "active") return displayAssignedJobs.filter((j: any) => j.status === "in-progress");
    if (activeTab === "upcoming") return displayAssignedJobs.filter((j: any) => j.status === "upcoming");
    if (activeTab === "completed") return [...legacyCompletedJobs, ...displayAssignedJobs.filter((j: any) => j.status === "completed")];
    if (activeTab === "disputes") return legacyDisputedJobs;
    return [];
  }, [displayAssignedJobs, legacyCompletedJobs, legacyDisputedJobs]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {/* Page Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>My Jobs</Text>
          <Text style={styles.pageSubtitle}>Track and manage your service bookings</Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.bgPrimarySoft]}>
              <Clock size={20} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.statNumber}>{displayAssignedJobs.filter((j: any) => j.status === "in-progress").length}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.bgAmberSoft]}>
              <Calendar size={20} color="#b45309" />
            </View>
            <View>
              <Text style={styles.statNumber}>{displayAssignedJobs.filter((j: any) => j.status === "upcoming").length}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statsGrid, { marginTop: 12 }]}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.bgGreenSoft]}>
              <CheckCircle size={20} color="#15803d" />
            </View>
            <View>
              <Text style={styles.statNumber}>{displayAssignedJobs.filter((j: any) => j.status === "completed").length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.bgRedSoft]}>
              <AlertTriangle size={20} color="#b91c1c" />
            </View>
            <View>
              <Text style={styles.statNumber}>{disputedJobs.length}</Text>
              <Text style={styles.statLabel}>Disputes</Text>
            </View>
          </View>
        </View>

        {/* Tabs Selection */}
        <View style={styles.tabsContainer}>
          {["active", "upcoming", "completed", "disputes"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                {tab === "active" ? "In Progress" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Job List */}
        <View style={styles.jobListContainer}>
          {currentDisplayJobs.length > 0 ? (
            currentDisplayJobs.map((job: any) => {
              const ServiceIcon = getServiceIcon(job.title);
              const serviceColor = getServiceColor(job.title);
              
              return (
                <View key={job.id} style={[styles.card, job.status === "disputed" && styles.cardDisputed]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarContainer}>
                      <View style={[styles.avatarCircle, { backgroundColor: serviceColor + '20' }]}>
                        <ServiceIcon size={20} color={serviceColor} />
                      </View>
                      {job.isOnline && <View style={styles.onlineIndicator} />}
                    </View>
                    <View style={styles.headerText}>
                      <Text style={styles.jobTitleText} numberOfLines={1}>{job.title}</Text>
                      <Text style={styles.clientNameText}>{job.client}</Text>
                    </View>
                    {getJobStatusBadge(job.status)}
                  </View>

                  {/* Service Info Banner */}
                  <View style={styles.serviceInfoBanner}>
                    <View style={styles.serviceInfoItem}>
                      <Calendar size={14} color="#64748b" />
                      <Text style={styles.serviceInfoText}>{job.scheduledDate}</Text>
                    </View>
                    <View style={styles.serviceInfoItem}>
                      <Clock size={14} color="#64748b" />
                      <Text style={styles.serviceInfoText}>{job.scheduledTime}</Text>
                    </View>
                  </View>

                  <View style={styles.progressBox}>
                    <View style={styles.progressTextRow}>
                      <Text style={styles.progressLabelText}>Progress</Text>
                      <Text style={styles.progressPercentText}>{job.progress}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${job.progress}%` }, { backgroundColor: serviceColor }]} />
                    </View>
                  </View>

                  <View style={styles.metaDataRow}>
                    <View style={styles.metaItem}>
                      <DollarSign size={14} color={serviceColor} />
                      <Text style={styles.metaValueText}>₹{job.totalAmount}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MapPin size={14} color="#64748b" />
                      <Text style={styles.metaLabelText} numberOfLines={1}>{job.address?.split(',')[0] || "Address"}</Text>
                    </View>
                    {job.unreadMessages > 0 && (
                      <View style={styles.metaItem}>
                        <MessageSquare size={14} color="#2563eb" />
                        <Text style={styles.unreadText}>{job.unreadMessages} new</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardActions}>
                    <View style={styles.leftActions}>
                      <TouchableOpacity style={styles.ghostBtn}>
                        <MessageSquare size={16} color="#64748b" style={{ marginRight: 4 }} />
                        <Text style={styles.ghostBtnText}>Chat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.ghostBtn}>
                        <Phone size={16} color="#64748b" style={{ marginRight: 4 }} />
                        <Text style={styles.ghostBtnText}>Call</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[styles.outlineBtn, { borderColor: serviceColor }]}
                      onPress={() => setSelectedJob(job)}
                    >
                      <Text style={[styles.outlineBtnText, { color: serviceColor }]}>View Details</Text>
                      <ArrowRight size={14} color={serviceColor} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Clock size={48} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptySubtitle}>There are no jobs in this category currently.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal: Job Details */}
      <Modal visible={!!selectedJob} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedJob?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedJob(null)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Service Type Badge */}
              <View style={styles.serviceTypeBadge}>
                <Text style={styles.serviceTypeText}>{selectedJob?.serviceDetails?.serviceType || "Home Service"}</Text>
              </View>

              {/* Client Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Client Information</Text>
                <View style={styles.clientInfoRow}>
                  <View style={[styles.clientAvatarLarge, { backgroundColor: getServiceColor(selectedJob?.title) + '20' }]}>
                    <User size={24} color={getServiceColor(selectedJob?.title)} />
                  </View>
                  <View>
                    <Text style={styles.clientNameLarge}>{selectedJob?.userName || selectedJob?.client}</Text>
                    <Text style={styles.clientPhone}>{selectedJob?.userPhone}</Text>
                  </View>
                </View>
              </View>

              {/* Schedule Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Schedule</Text>
                <View style={styles.scheduleRow}>
                  <View style={styles.scheduleItem}>
                    <Calendar size={18} color="#2563eb" />
                    <Text style={styles.scheduleText}>{selectedJob?.scheduledDate}</Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Clock size={18} color="#2563eb" />
                    <Text style={styles.scheduleText}>{selectedJob?.scheduledTime}</Text>
                  </View>
                </View>
              </View>

              {/* Address */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Service Address</Text>
                <View style={styles.addressRow}>
                  <MapPin size={18} color="#64748b" />
                  <Text style={styles.addressText}>{selectedJob?.address}</Text>
                </View>
              </View>

              {/* Payment Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                <View style={styles.paymentRow}>
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>Total Amount</Text>
                    <Text style={styles.paymentValue}>₹{selectedJob?.totalAmount}</Text>
                  </View>
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>Paid</Text>
                    <Text style={[styles.paymentValue, { color: '#16a34a' }]}>₹{selectedJob?.paidAmount}</Text>
                  </View>
                  <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>Due</Text>
                    <Text style={[styles.paymentValue, { color: '#b45309' }]}>₹{(selectedJob?.totalAmount || 0) - (selectedJob?.paidAmount || 0)}</Text>
                  </View>
                </View>
              </View>

              {/* Requirements */}
              {selectedJob?.serviceDetails?.requirements && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Requirements</Text>
                  {selectedJob.serviceDetails.requirements.map((req: string, idx: number) => (
                    <View key={idx} style={styles.requirementItem}>
                      <CheckCircle size={16} color="#16a34a" />
                      <Text style={styles.requirementText}>{req}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Notes */}
              {selectedJob?.serviceDetails?.notes && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>{selectedJob.serviceDetails.notes}</Text>
                  </View>
                </View>
              )}

              {/* Duration & Add-ons */}
              {selectedJob?.serviceDetails && (
                <View style={styles.infoSection}>
                  <View style={styles.durationRow}>
                    <View style={styles.durationItem}>
                      <Clock size={16} color="#64748b" />
                      <Text style={styles.durationText}>Duration: {selectedJob.serviceDetails.duration}</Text>
                    </View>
                  </View>
                  {selectedJob.serviceDetails.addOns && selectedJob.serviceDetails.addOns.length > 0 && (
                    <View style={styles.addOnsContainer}>
                      <Text style={styles.addOnsTitle}>Available Add-ons</Text>
                      <View style={styles.addOnsTags}>
                        {selectedJob.serviceDetails.addOns.map((addon: string, idx: number) => (
                          <View key={idx} style={styles.addOnTag}>
                            <Text style={styles.addOnTagText}>{addon}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.separator} />

              {/* Milestones */}
              <Text style={styles.milestoneHeading}>Milestones</Text>
              {selectedJob?.milestones?.map((m: Milestone, idx: number) => (
                <View key={m.id} style={styles.milestoneCard}>
                  <View style={styles.milestoneLeft}>
                    <Text style={styles.milestoneNumber}>{idx + 1}</Text>
                    <View>
                      <Text style={styles.milestoneTitleText}>{m.title}</Text>
                      <Text style={styles.milestoneAmountText}>₹{m.amount}</Text>
                    </View>
                  </View>
                  {getMilestoneStatusBadge(m.status)}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelectedJob(null)}>
                <Text style={styles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>
              {selectedJob?.status === "in-progress" && (
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: getServiceColor(selectedJob?.title) }]}>
                  <CheckCircle size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Update Progress</Text>
                </TouchableOpacity>
              )}
              {selectedJob?.status === "upcoming" && (
                <TouchableOpacity 
                  style={[styles.primaryBtn, { backgroundColor: '#16a34a' }]}
                  onPress={() => {
                    handleAcceptJob(selectedJob);
                    setSelectedJob(null);
                  }}
                  disabled={acceptingJobId === selectedJob?.id}
                >
                  {acceptingJobId === selectedJob?.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <CheckCircle size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.primaryBtnText}>Accept Job</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              {selectedJob?.status === "upcoming" && (
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: getServiceColor(selectedJob?.title) }]}>
                  <Phone size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Contact Client</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollPadding: { padding: 16, paddingBottom: 100 },
  headerContainer: { marginBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: "bold", color: "#0f172a" },
  pageSubtitle: { fontSize: 16, color: "#64748b", marginTop: 4 },
  statsGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 12, borderColor: "#e2e8f0", flexDirection: "row", alignItems: "center", gap: 12, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }, android: { elevation: 2 } }) },
  statIconContainer: { padding: 10, borderRadius: 10 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  statLabel: { fontSize: 12, color: "#64748b" },
  tabsContainer: { flexDirection: "row", backgroundColor: "#e2e8f0", padding: 4, borderRadius: 10, marginVertical: 24 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabButtonActive: { backgroundColor: "#fff" },
  tabButtonText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  tabButtonTextActive: { color: "#0f172a", fontWeight: "600" },
  jobListContainer: { paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  cardDisputed: { borderColor: "#fecaca" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarContainer: { position: "relative" },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  avatarCircleLarge: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: "#2563eb", fontWeight: "bold", fontSize: 16 },
  onlineIndicator: { position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: "#22c55e", borderWidth: 2, borderColor: "#fff" },
  headerText: { flex: 1, marginLeft: 12 },
  jobTitleText: { fontSize: 16, fontWeight: "bold", color: "#0f172a" },
  clientNameText: { fontSize: 14, color: "#64748b" },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  bgPrimarySoft: { backgroundColor: "#eff6ff" },
  textPrimary: { color: "#2563eb", fontSize: 12, fontWeight: "600" },
  bgAmberSoft: { backgroundColor: "#fffbeb" },
  textAmber: { color: "#b45309", fontSize: 12, fontWeight: "600" },
  bgGreenSoft: { backgroundColor: "#f0fdf4" },
  textGreen: { color: "#15803d", fontSize: 12, fontWeight: "600" },
  bgRedSoft: { backgroundColor: "#fef2f2" },
  textRed: { color: "#b91c1c", fontSize: 12, fontWeight: "600" },
  bgSecondary: { backgroundColor: "#f1f5f9" },
  textSecondary: { color: "#475569", fontSize: 12, fontWeight: "600" },
  serviceInfoBanner: { flexDirection: "row", backgroundColor: "#f8fafc", borderRadius: 8, padding: 8, marginBottom: 12, gap: 16 },
  serviceInfoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  serviceInfoText: { fontSize: 12, color: "#64748b" },
  progressBox: { marginBottom: 12 },
  progressTextRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabelText: { fontSize: 13, color: "#64748b" },
  progressPercentText: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  progressTrack: { height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2563eb" },
  metaDataRow: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaValueText: { fontSize: 13, color: "#0f172a", fontWeight: "500" },
  metaLabelText: { fontSize: 13, color: "#64748b" },
  unreadText: { fontSize: 13, color: "#2563eb", fontWeight: "500" },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12 },
  leftActions: { flexDirection: "row", gap: 4 },
  ghostBtn: { flexDirection: "row", alignItems: "center", padding: 8, borderRadius: 6 },
  ghostBtnText: { color: "#64748b", fontSize: 13, fontWeight: "500" },
  outlineBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  outlineBtnText: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a", marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: "#64748b", marginTop: 4, textAlign: "center" },
  
  // Modal styles
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: height * 0.85 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#0f172a", flex: 1, marginRight: 12 },
  modalBody: { marginBottom: 16 },
  serviceTypeBadge: { backgroundColor: "#eff6ff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-start", marginBottom: 16 },
  serviceTypeText: { color: "#2563eb", fontSize: 13, fontWeight: "600" },
  infoSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: 12 },
  clientInfoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  clientAvatarLarge: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  clientNameLarge: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  clientPhone: { fontSize: 14, color: "#64748b" },
  scheduleRow: { flexDirection: "row", gap: 24 },
  scheduleItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  scheduleText: { fontSize: 14, color: "#0f172a" },
  addressRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  addressText: { fontSize: 14, color: "#0f172a", flex: 1 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between" },
  paymentItem: { alignItems: "center" },
  paymentLabel: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  paymentValue: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  requirementItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  requirementText: { fontSize: 14, color: "#0f172a" },
  notesBox: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 8 },
  notesText: { fontSize: 14, color: "#0f172a" },
  durationRow: { marginBottom: 12 },
  durationItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  durationText: { fontSize: 14, color: "#64748b" },
  addOnsContainer: { marginTop: 8 },
  addOnsTitle: { fontSize: 13, color: "#64748b", marginBottom: 8 },
  addOnsTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  addOnTag: { backgroundColor: "#f1f5f9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  addOnTagText: { fontSize: 12, color: "#475569" },
  separator: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 16 },
  milestoneHeading: { fontSize: 16, fontWeight: "bold", color: "#0f172a", marginBottom: 12 },
  milestoneCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#f8fafc", borderRadius: 12, marginBottom: 8 },
  milestoneLeft: { flexDirection: "row", gap: 12, alignItems: "center" },
  milestoneNumber: { color: "#94a3b8", fontSize: 14, fontWeight: "500" },
  milestoneTitleText: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  milestoneAmountText: { fontSize: 12, color: "#64748b" },
  modalFooter: { flexDirection: "row", gap: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  secondaryBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" },
  secondaryBtnText: { fontWeight: "600", color: "#0f172a" },
  primaryBtn: { flex: 2, backgroundColor: "#2563eb", padding: 12, borderRadius: 10, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
});
