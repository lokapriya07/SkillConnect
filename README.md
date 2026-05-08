# 🛠️ SkillConnect - Bridging Skills with Services

**SkillConnect** is a comprehensive mobile platform that connects service seekers (Users) with skilled service providers (Workers) for home services like plumbing, electrical work, cleaning, AC repair, and more. Powered by AI-driven job matching and real-time communication, SkillConnect makes it easy to find the right professional for any job.

---

## 📋 Table of Contents
1. [Problem Statement & Approach](#-problem-statement--approach)
2. [System Architecture](#-system-architecture)
3. [Features Overview](#-features-overview)
4. [Tech Stack & Why We Chose It](#-tech-stack--why-we-chose-it)
5. [Installation & Setup](#-installation--setup)
6. [Running on Your Phone](#-running-on-your-phone)
7. [API Endpoints](#-api-endpoints)
8. [Database Schema](#-database-schema)
9. [Project Structure](#-project-structure)
10. [Key Implementation Details](#-key-implementation-details)
11. [Troubleshooting](#-troubleshooting)

---

## 🎯 Problem Statement & Approach

### **Problem**
- **Gap in Service Discovery**: Users struggle to find reliable, verified service professionals for home repairs and maintenance
- **Trust Issues**: No standard verification or rating system for service providers
- **Inefficient Matching**: Manual search and negotiation wastes time for both users and workers
- **Language & Literacy Barriers**: Many workers are uneducated and speak regional languages
- **Communication Overhead**: Multiple platforms needed for job posting, bidding, and real-time updates

### **Our Solution: SkillConnect**
SkillConnect addresses these challenges through:

1. **Dual-App Architecture**
   - **User App**: Post jobs, accept bids, track workers, make payments
   - **Worker App**: Browse matching jobs, submit bids, complete work, get ratings

2. **AI-Powered Job Matching**
   - Use **Google Gemini API** for multimodal skill extraction
   - Workers upload images/audio → AI identifies exact service needed
   - Automatic matching with workers based on skills, location, and availability
   - Case-insensitive, typo-tolerant skill matching

3. **Verification & Trust System**
   - Worker profiles with verifications (Aadhaar, certifications)
   - Rating system (1-5 stars) with reviews after job completion
   - On-time completion tracking and performance metrics

4. **Real-Time Communication**
   - Socket.io for instant messaging between users and workers
   - Push notifications using Expo for job updates
   - Live job status tracking (Scheduled → In Progress → Completed)

5. **Inclusive Design**
   - Multimodal input: Text, Image, Audio (for non-literate workers)
   - Regional language support for audio processing
   - Location-based job discovery using geo-coordinates

---

## 🏗️ System Architecture

### **Three-Tier Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
├──────────────────────────┬──────────────────────────────────┤
│   User App (Expo)        │   Worker App (Expo)              │
│   ✓ React Native         │   ✓ React Native                 │
│   ✓ Expo Router          │   ✓ Expo Router                  │
│   ✓ Firebase Auth        │   ✓ Firebase Auth                │
│   ✓ Socket.io Client     │   ✓ Socket.io Client             │
└──────────────────────────┴──────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                  Node.js + Express Server                    │
│                                                               │
│  ✓ REST APIs (Job, Auth, Bid, Chat, Notification)          │
│  ✓ Socket.io Server (Real-time Chat & Notifications)       │
│  ✓ AI Integration (Google Gemini - Skill Extraction)        │
│  ✓ File Upload Handler (Images, Videos, Audio)              │
│  ✓ OTP Verification (Twilio SMS)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│                  MongoDB Atlas Cloud                         │
│                                                               │
│  Collections:                                                │
│  ✓ Users (Client & Worker Accounts)                         │
│  ✓ JobRequests (Posted Jobs with Skills)                    │
│  ✓ Work (Worker Profiles & Skills)                          │
│  ✓ Bids (Bid History & Status)                              │
│  ✓ Messages (Chat Conversations)                            │
│  ✓ Notifications (Push Notifications)                       │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow Diagram**

```
USER APP                          BACKEND                      WORKER APP
   │                                 │                            │
   ├─► POST /api/jobs/create ───────►│ AI Extraction              │
   │   (with text/image/audio)       ├─ Gemini API               │
   │                                 ├─ Extract Skills           │
   │                                 ├─ Save to DB               │
   │                                 │                            │
   │                                 ├──────► GET /worker-feed ──►│
   │                                 │        (Matching Jobs)     │
   │                                 │                            │
   │                                 │◄─── POST /bids ──────────┤ Bid Submission
   │◄─ GET /api/bids ───────────────┤                            │
   │   (View All Bids)               │                            │
   │                                 │                            │
   ├─► PUT /api/bids/accept ───────►│ Update Status             │
   │                                 ├─ Send Notification ──────►│
   │                                 │                            │
   ├─► POST /api/chat/send ────────►│ Socket.io Message ───────►│
   │                                 │ Broadcast                  │
   │                                 │                            │
   │                        ◄────────┤ Real-time Status Updates   │
   │                                 │                            │
```

---

## ✨ Features Overview

### **USER APP FEATURES**

#### 1. **Authentication**
- Signup/Login with Phone Number
- OTP Verification (Twilio)
- Role-based access (User vs Worker)

#### 2. **Job Posting**
```javascript
// Job creation with multimodal input
POST /api/jobs/create
{
  "serviceName": "AC Repair",
  "description": "AC not cooling properly",
  "image": <file>,           // Optional: Image of AC
  "audio": <file>,           // Optional: Audio description
  "budget": 500,
  "location": {
    "coordinates": [28.7041, 77.1025],  // Latitude, Longitude
    "address": "123 Main St, Delhi"
  },
  "scheduledDate": "2026-05-10",
  "scheduledTime": "10:00 AM"
}
```
**What Happens:**
1. **AI Skill Extraction** → Gemini analyzes text + image + audio → Extracts exact skills ["ac_repair"]
2. **Location Processing** → Stores coordinates + address
3. **Worker Matching** → Finds all workers with matching skills within radius
4. **Job Status** → Set to "finding_workers"

#### 3. **Browse & Filter Jobs**
- See all posted jobs
- Filter by category, budget, location
- View job details with images/descriptions

#### 4. **Receive & Manage Bids**
```javascript
// View all bids for a job
GET /api/bids?jobId=123

// Accept a bid (hire the worker)
PUT /api/bids/accept
{
  "bidId": "bid_123",
  "jobId": "job_123"
}
```
**What Happens:**
1. **Bid Acceptance** → Job status changes to "hired"
2. **Notification Sent** → Worker gets push notification
3. **Chat Channel Created** → Both can communicate
4. **Worker Confirmed** → Job assigned to specific worker

#### 5. **Real-Time Job Tracking**
```javascript
// Fetch job details with live status
GET /api/jobs/details/:jobId

// Status Progression:
finding_workers → bidding → assigned → scheduled → in_progress → completed
```
**UI Shows:**
- Current job status with progress bar
- Worker location (if available)
- Estimated completion time
- Real-time notifications for status changes

#### 6. **Chat & Communication**
```javascript
// Send message
POST /api/chat/send
{
  "jobId": "job_123",
  "message": "Can you arrive by 2 PM?",
  "messageType": "text"  // or "image", "audio", "video"
}

// Get chat history
GET /api/chat/conversations/:jobId
```
**Features:**
- Text, image, audio, video messages
- Message read receipts
- Real-time updates via Socket.io
- Conversation history saved

#### 7. **Rate & Review Workers**
```javascript
// Rate a completed job
POST /api/jobs/:jobId/rate
{
  "rating": 5,
  "review": "Great work! On time and professional."
}
```
**What Happens:**
1. **Rating Saved** → Added to worker's feedback array
2. **Average Calculated** → Worker's overall rating updated
3. **Notification** → Worker gets feedback notification
4. **Profile Impact** → High ratings boost worker visibility

#### 8. **Payment & Booking**
- Save payment method
- Confirm booking details
- View booking history
- Cancel or reschedule jobs

---

### **WORKER APP FEATURES**

#### 1. **Profile Setup & Verification**
```javascript
// Complete worker profile
POST /api/work/profile
{
  "skills": ["ac_repair", "refrigerator_repair"],
  "hourlyRate": 300,
  "workingDays": ["Monday", "Tuesday", "Wednesday"],
  "startTime": "09:00 AM",
  "endTime": "06:00 PM",
  "location": {
    "coordinates": [28.7041, 77.1025],
    "address": "123 Worker Colony, Delhi"
  },
  "languages": ["Hindi", "English"],
  "aadhaarLastFour": "1234",
  "experience": 5  // Years
}
```
**What This Enables:**
- Worker becomes discoverable in job feed
- Skills matched against job requirements
- Geo-location used for distance-based filtering

#### 2. **AI-Powered Job Discovery Feed**
```javascript
// Get matching jobs
GET /api/jobs/worker-feed/:workerId
```
**Matching Algorithm:**
1. **Skill Match** → Jobs requiring worker's skills
2. **Location Match** → Jobs within service radius (e.g., 5km)
3. **Availability Match** → Jobs during worker's working hours
4. **Rating Filter** → Only show jobs from users with high ratings

**Response:**
```json
{
  "matchingJobs": [
    {
      "jobId": "job_123",
      "serviceName": "AC Repair",
      "budget": 500,
      "skillsRequired": ["ac_repair"],
      "distance": 2.3,  // km from worker
      "userRating": 4.8,
      "matchScore": 95   // Percentage
    }
  ],
  "workerSkills": ["ac_repair", "refrigerator_repair"],
  "workerLocation": [28.7041, 77.1025]
}
```

#### 3. **Submit Bids**
```javascript
// Place a bid on a job
POST /api/bids/place
{
  "jobId": "job_123",
  "amount": 450,
  "message": "I can complete this in 1-2 hours. Very experienced."
}
```
**What Happens:**
1. **Bid Saved** → Added to job's bid array
2. **User Notified** → User gets notification of new bid
3. **Status Update** → Job moves to "bidding" phase
4. **Bid Visible** → Competes with other bids on job

#### 4. **Real-Time Status Updates**
Worker can update job progress:
```javascript
// Update job status
PUT /api/jobs/:jobId/status
{
  "status": "in_progress"  // From: scheduled, in_progress, paused, completed
}
```
**Status Workflow:**
- **scheduled** → Confirmed time/date
- **in_progress** → Worker has started
- **paused** → Temporary break
- **completed** → Job finished, ready for rating

#### 5. **Track Earnings & Performance**
```javascript
// Get worker dashboard stats
GET /api/work/stats/:workerId

Response:
{
  "completedJobs": 145,
  "averageRating": 4.7,
  "onTimePercentage": 94,
  "thisMonthEarnings": 28500,
  "totalEarnings": 245000,
  "upcomingJobs": 3
}
```

#### 6. **Chat with Users**
- Same as User App
- Send/receive messages in real-time
- Ask clarification questions
- Share photos of work

#### 7. **View Ratings & Feedback**
- See individual job ratings
- Read user reviews
- Track rating trends
- Improve services based on feedback

#### 8. **Manage Availability**
- Set working hours
- Mark days off
- Pause accepting new jobs
- Specify service area radius

---

## 🛠️ Tech Stack & Why We Chose It

### **Frontend (Mobile Apps)**

| Technology | Role | Why Chosen |
|---|---|---|
| **React Native** | Mobile App Framework | Write once, run on iOS & Android; large community; hot reloading |
| **Expo** | React Native Toolchain | Simplified development, no Android/iOS setup; easy testing on phone via QR |
| **Expo Router** | Navigation | File-based routing like Next.js; clean tab-based navigation |
| **Firebase** | Authentication & Cloud | Handles OTP, phone auth; scalable backend-as-a-service |
| **Socket.io Client** | Real-time Chat | Low-latency bidirectional communication; works over WebSocket |
| **Async Storage** | Local Data | Persist user token, preferences offline |
| **React Navigation** | Tab & Stack Navigation | Proven stable library; supports complex navigation patterns |
| **React-Native-Maps** | Location Services | Display worker location, job area on map; geolocation |
| **Expo Notifications** | Push Notifications | Send job updates, new bids, messages instantly to phone |
| **TypeScript** | Type Safety | Catch errors at compile time; better IDE autocomplete |
| **Lucide Icons** | UI Components | Lightweight SVG icons; consistent design |

### **Backend (Server)**

| Technology | Role | Why Chosen |
|---|---|---|
| **Node.js** | Runtime | JavaScript on server; fast I/O; npm ecosystem |
| **Express.js** | Web Framework | Minimal, fast HTTP routing; middleware support; industry standard |
| **Socket.io** | Real-time Communication | Handle multiple concurrent connections; rooms for job-based chats |
| **MongoDB** | Database | NoSQL flexibility for varying job/skill data; scales horizontally; geospatial queries |
| **Mongoose** | ODM (Object Data Model) | Schema validation; easy relationships (populate); hooks for automation |
| **Multer** | File Upload | Handle image/audio/video uploads; disk storage; validation |
| **JWT (jsonwebtoken)** | Authentication | Stateless user authentication; secure token signing |
| **Bcryptjs** | Password Hashing | Secure password storage with salt; industry standard |
| **Dotenv** | Environment Config | Manage API keys safely (Gemini, Twilio, MongoDB URI) |
| **CORS** | Cross-Origin Requests | Allow mobile apps (different origin) to call backend |

### **AI & ML**

| Technology | Role | Why Chosen |
|---|---|---|
| **Google Gemini 2.5 Flash** | Multimodal AI | Analyzes text + image + audio → extracts skills; faster than GPT-4 |
| **OpenAI** | Backup AI | Optional for advanced language processing |

### **External Services**

| Service | Role | Why Chosen |
|---|---|---|
| **MongoDB Atlas** | Cloud Database | Managed MongoDB; automatic backups; global data centers |
| **Google Cloud APIs** | AI Services | Gemini API for skill extraction from multimodal input |
| **Twilio** | SMS/OTP | Reliable OTP delivery; 99.99% uptime; easy integration |
| **Expo Cloud** | Push Notifications | Free tier; reliable; integrates with Expo |

### **Why This Tech Stack?**

1. **Scalability**: Node.js + MongoDB handle millions of jobs/users
2. **Real-time**: Socket.io ensures instant messaging and notifications
3. **AI Integration**: Gemini API makes job matching intelligent and accurate
4. **Cross-Platform**: React Native ensures iOS/Android with one codebase
5. **Developer Experience**: JavaScript/TypeScript across frontend & backend; rapid development
6. **Cost-Effective**: Most services have free/cheap tiers for startups
7. **Community**: Large communities for debugging & finding solutions

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js v16+ and npm/yarn
- MongoDB Atlas account (free tier available)
- Google Cloud account (for Gemini API)
- Twilio account (for OTP)
- Expo CLI installed
- Android Studio or Xcode for mobile testing

### **Step 1: Clone & Navigate**
```bash
git clone <repository-url>
cd SkillConnect
```

### **Step 2: Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillconnect
PORT=5000
GEMINI_API_KEY=your-gemini-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
JWT_SECRET=your-secret-key
EOF

# Start backend
node server.js
# Server runs on http://localhost:5000
```

### **Step 3: Setup MongoDB**
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free tier cluster
3. Create database user
4. Whitelist your IP
5. Copy connection string → paste in `MONGO_URI`

### **Step 4: Setup Gemini API**
1. Go to [makersuite.google.com](https://makersuite.google.com)
2. Create API key
3. Paste in `GEMINI_API_KEY`

### **Step 5: User App Setup**
```bash
cd ../User

# Install dependencies
npm install

# Start Expo dev server
npm start
# Scan QR code with Expo Go app
```

### **Step 6: Worker App Setup**
```bash
cd ../Worker

# Install dependencies
npm install

# Start Expo dev server
npm start
# Scan QR code with Expo Go app
```

---

## 📱 Running on Your Phone

### **For Physical Device (iOS & Android)**

#### **Option 1: Using Expo Go (Easiest)**

1. **Install Expo Go App**
   - iOS: App Store
   - Android: Google Play Store

2. **Start Dev Server**
   ```bash
   cd User
   npm start
   # or
   npm run start
   ```

3. **Scan QR Code**
   - Press 's' in terminal for Expo menu
   - Use device camera/Expo Go app to scan QR
   - App loads on your phone instantly

4. **Develop & Hot Reload**
   - Save code changes
   - App automatically refreshes on phone
   - No rebuild needed

#### **Option 2: Build Standalone App (Production)**

```bash
# User App
cd User
eas build --platform android
# Creates APK you can install on phone

# Worker App
cd Worker
eas build --platform android
```

### **For Emulator/Simulator**

#### **Android Emulator**
```bash
cd User
npm run android
```

#### **iOS Simulator** (Mac only)
```bash
cd User
npm run ios
```

### **Debugging on Phone**

1. **View Logs in Real-time**
   ```bash
   npm start
   # Logs appear in terminal as app runs
   ```

2. **React Native Debugger**
   - Install: `brew install react-native-debugger` (Mac)
   - Run app with debugger: Shake phone → Enable debugger
   - Opens Chrome DevTools for JS debugging

3. **Check Backend Connection**
   - Add console logs in code
   - Use Postman to test API endpoints
   - Verify backend URL in `.env`

---

## 🔌 API Endpoints

### **Authentication Routes** (`/api/auth`)

#### **Signup (Phone-based)**
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "encrypted_password",
  "role": "user"  // or "worker"
}

Response:
{
  "success": true,
  "message": "Account created successfully"
}
```

#### **Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password",
  "role": "user"
}

Response:
{
  "success": true,
  "user": {
    "id": "user_123",
    "workerProfileId": "work_456",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### **OTP Send**
```
POST /api/otp/send
{
  "phone": "9876543210"
}
```

#### **OTP Verify**
```
POST /api/otp/verify
{
  "phone": "9876543210",
  "otp": "123456"
}
```

### **Job Routes** (`/api/jobs`)

#### **Create Job (with AI Extraction)**
```
POST /api/jobs/create
Content-Type: multipart/form-data

Form Data:
- serviceName: "AC Repair"
- description: "AC not cooling"
- image: <file>  (optional)
- audio: <file>  (optional)
- budget: 500
- location[coordinates]: [28.7041, 77.1025]
- location[address]: "123 Main St"
- scheduledDate: "2026-05-10"
- scheduledTime: "10:00 AM"

Response:
{
  "jobId": "job_123",
  "skillsExtracted": ["ac_repair"],
  "status": "finding_workers",
  "createdAt": "2026-05-08T10:00:00Z"
}
```

#### **Get Worker Feed (Matching Jobs)**
```
GET /api/jobs/worker-feed/:workerId

Response:
{
  "matchingJobs": [
    {
      "_id": "job_123",
      "serviceName": "AC Repair",
      "budget": 500,
      "skillsRequired": ["ac_repair"],
      "distance": 2.3,
      "userRating": 4.8
    }
  ]
}
```

#### **Get Job Details**
```
GET /api/jobs/details/:jobId

Response:
{
  "_id": "job_123",
  "serviceName": "AC Repair",
  "description": "AC not cooling",
  "budget": 500,
  "skillsRequired": ["ac_repair"],
  "status": "finding_workers",
  "bids": [
    {
      "workerId": "worker_1",
      "bidAmount": 450,
      "message": "I can help"
    }
  ]
}
```

#### **Update Job Status**
```
PUT /api/jobs/:jobId/status
{
  "status": "in_progress"
}
```

#### **Rate & Review Worker**
```
POST /api/jobs/:jobId/rate
{
  "rating": 5,
  "review": "Excellent work!"
}
```

### **Bid Routes** (`/api/bids`)

#### **Place Bid**
```
POST /api/bids/place
{
  "jobId": "job_123",
  "workerId": "worker_456",
  "amount": 450,
  "message": "I can complete this quickly"
}

Response:
{
  "bidId": "bid_789",
  "status": "pending"
}
```

#### **Get Bids for Job**
```
GET /api/bids?jobId=job_123

Response:
{
  "bids": [
    {
      "_id": "bid_789",
      "workerId": "worker_456",
      "workerName": "Ahmed",
      "amount": 450,
      "status": "pending",
      "createdAt": "2026-05-08T10:00:00Z"
    }
  ]
}
```

#### **Accept Bid (Hire Worker)**
```
PUT /api/bids/accept
{
  "bidId": "bid_789",
  "jobId": "job_123"
}

Response:
{
  "success": true,
  "jobStatus": "hired",
  "message": "Worker hired successfully"
}
```

### **Work Routes** (`/api/work`)

#### **Create/Update Worker Profile**
```
POST /api/work/profile
{
  "userId": "user_123",
  "skills": ["ac_repair", "refrigerator_repair"],
  "hourlyRate": 300,
  "workingDays": ["Monday", "Tuesday"],
  "startTime": "09:00 AM",
  "endTime": "06:00 PM",
  "location": {
    "coordinates": [28.7041, 77.1025],
    "address": "Delhi"
  },
  "experience": 5,
  "aadhaarLastFour": "1234"
}
```

#### **Get Worker Profile**
```
GET /api/work/:workerId

Response:
{
  "_id": "work_456",
  "userId": "user_123",
  "skills": ["ac_repair", "refrigerator_repair"],
  "averageRating": 4.7,
  "completedJobs": 42,
  "hourlyRate": 300
}
```

#### **Get Worker Stats**
```
GET /api/work/stats/:workerId

Response:
{
  "completedJobs": 42,
  "averageRating": 4.7,
  "onTimePercentage": 95,
  "thisMonthEarnings": 12500,
  "totalEarnings": 125000
}
```

### **Chat Routes** (`/api/chat`)

#### **Send Message**
```
POST /api/chat/send
{
  "conversationId": "job_123",
  "senderId": "user_123",
  "senderType": "user",
  "receiverId": "worker_456",
  "message": "Can you arrive by 2 PM?",
  "messageType": "text"
}
```

#### **Get Conversation**
```
GET /api/chat/conversations/:jobId

Response:
{
  "messages": [
    {
      "_id": "msg_1",
      "senderId": "user_123",
      "message": "Can you arrive by 2 PM?",
      "createdAt": "2026-05-08T10:00:00Z",
      "read": true
    }
  ]
}
```

### **Notification Routes** (`/api/notifications`)

#### **Get Notifications**
```
GET /api/notifications/:userId

Response:
{
  "notifications": [
    {
      "_id": "notif_1",
      "type": "bid_submitted",
      "title": "New Bid",
      "message": "Ahmed submitted a bid for ₹450",
      "isRead": false,
      "createdAt": "2026-05-08T10:00:00Z"
    }
  ]
}
```

#### **Mark as Read**
```
PUT /api/notifications/:notificationId/read

Response:
{
  "success": true
}
```

---

## 🗄️ Database Schema

### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  role: String ('user' || 'worker'),
  createdAt: Date
}
```

### **Work Collection (Worker Profiles)**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  skills: [String],
  languages: [String],
  hourlyRate: Number,
  startTime: String,
  endTime: String,
  workingDays: [String],
  location: {
    type: Point,
    coordinates: [longitude, latitude]  // GeoJSON format
  },
  
  // Ratings
  feedbacks: [{
    userId: ObjectId,
    rating: Number (1-5),
    message: String,
    createdAt: Date
  }],
  averageRating: Number,
  ratingCount: Number,
  completedJobs: Number,
  onTimePercentage: Number,
  
  verificationStatus: String ('not_submitted' || 'pending' || 'verified'),
  aadhaarLastFour: String,
  experience: Number (years),
  
  createdAt: Date,
  updatedAt: Date
}

// 🔥 IMPORTANT: Index on location for fast geo-queries
db.works.createIndex({ location: '2dsphere' })
```

### **JobRequest Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  serviceName: String,
  description: String,
  skillsRequired: [String],  // Extracted by AI
  budget: Number,
  
  // Media uploads
  imagePath: String,
  videoPath: String,
  audioPath: String,
  
  // Location (GeoJSON for distance queries)
  location: {
    type: Point,
    coordinates: [longitude, latitude]
  },
  address: String,
  city: String,
  state: String,
  fullAddress: String,
  
  // Scheduling
  scheduledDate: String,
  scheduledTime: String,
  
  // Worker assignment
  assignedWorker: {
    workerId: ObjectId,
    workerName: String,
    workerProfilePic: String,
    assignedAt: Date
  },
  
  hiredWorker: {
    workerId: ObjectId,
    workerName: String,
    bidId: ObjectId,
    bidAmount: Number,
    hiredAt: Date
  },
  
  // Bids
  bids: [{
    workerId: ObjectId,
    bidAmount: Number,
    message: String,
    status: String ('pending' || 'hired' || 'closed'),
    createdAt: Date
  }],
  
  // Status workflow
  status: String ('finding_workers' || 'bidding' || 'assigned' || 'scheduled' 
                  || 'in_progress' || 'paused' || 'completed' || 'cancelled'),
  
  // Payment
  paymentMethod: String,
  totalAmount: Number,
  paidAmount: Number,
  paymentStatus: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

### **Bid Collection**
```javascript
{
  _id: ObjectId,
  job: ObjectId (ref: JobRequest),
  worker: ObjectId (ref: User),
  amount: Number,
  message: String,
  status: String ('pending' || 'accepted' || 'rejected' || 'hired'),
  hiredAt: Date,
  hiredBy: ObjectId (ref: User),
  
  createdAt: Date,
  updatedAt: Date
}
```

### **Message Collection**
```javascript
{
  _id: ObjectId,
  conversationId: String (jobId),
  senderId: String,
  senderType: String ('user' || 'worker'),
  receiverId: String,
  receiverType: String ('user' || 'worker'),
  message: String,
  messageType: String ('text' || 'image' || 'audio' || 'video'),
  read: Boolean (default: false),
  createdAt: Date
}

// Index for fast queries
db.messages.createIndex({ conversationId: 1, createdAt: -1 })
```

### **Notification Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  userModel: String ('User' || 'Work'),
  type: String ('hired' || 'bid_submitted' || 'worker_on_the_way' 
               || 'service_started' || 'job_completed' || 'status_update'),
  title: String,
  message: String,
  relatedId: ObjectId (jobId, bidId, etc.),
  isRead: Boolean (default: false),
  createdAt: Date
}
```

---

## 📁 Project Structure

```
SkillConnect/
├── backend/                          # Node.js Express Server
│   ├── server.js                    # Main server entry point
│   ├── package.json                 # Dependencies
│   ├── .env                         # Environment variables (secret)
│   │
│   ├── models/                      # MongoDB Schemas
│   │   ├── User.js                 # Client & Worker auth
│   │   ├── Work.js                 # Worker profiles & skills
│   │   ├── JobRequest.js           # Posted jobs
│   │   ├── Bid.js                  # Worker bids
│   │   ├── Message.js              # Chat messages
│   │   └── Notification.js         # Push notifications
│   │
│   ├── routes/                      # API Endpoints
│   │   ├── auth.js                 # Login/Signup/OTP
│   │   ├── jobRoutes.js            # Job create/browse/update
│   │   ├── workRoutes.js           # Worker profile management
│   │   ├── bids.js                 # Bid placement/acceptance
│   │   ├── chatRoutes.js           # Real-time chat
│   │   ├── notificationRoutes.js   # Push notifications
│   │   └── otp.js                  # SMS verification
│   │
│   ├── controllers/                 # Business Logic
│   │   └── work.js                 # Worker operations
│   │
│   ├── utils/                       # Helper Functions
│   │   ├── aiExtractor.js          # Gemini AI skill extraction
│   │   ├── notificationHelper.js   # Send push notifications
│   │   └── ...
│   │
│   └── uploads/                     # User-uploaded files
│       ├── images/
│       ├── audio/
│       └── videos/
│
├── User/                            # Expo React Native App (Clients)
│   ├── app.json                    # Expo configuration
│   ├── package.json                # Dependencies
│   ├── tsconfig.json               # TypeScript config
│   │
│   ├── app/                        # File-based routing (Expo Router)
│   │   ├── _layout.tsx            # Root layout
│   │   ├── (tabs)/                # Tab navigation
│   │   ├── auth/                  # Login/Signup screens
│   │   ├── index.tsx              # Home screen
│   │   ├── active-request-details.tsx
│   │   ├── booking-confirmation.tsx
│   │   ├── bookings.tsx           # View bookings
│   │   ├── chat.tsx               # Real-time chat
│   │   ├── checkout.tsx           # Payment screen
│   │   ├── profile.tsx            # User profile
│   │   └── ...
│   │
│   ├── components/                 # Reusable UI Components
│   │   ├── screens/               # Complex screens
│   │   ├── ui/                    # Buttons, cards, inputs
│   │   └── ...
│   │
│   ├── hooks/                      # React Hooks
│   │   ├── useNotifications.ts    # Push notification handler
│   │   ├── use-color-scheme.ts
│   │   └── ...
│   │
│   ├── lib/                        # Utilities
│   │   ├── store.ts              # Redux/Context for state
│   │   ├── services-data.ts       # Master services list
│   │   └── utils.ts              # Helper functions
│   │
│   ├── constants/                  # Constants
│   │   ├── Colors.ts
│   │   └── theme.ts
│   │
│   └── assets/                     # Images, fonts, etc.
│
├── Worker/                         # Expo React Native App (Service Providers)
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── app/                        # File-based routing
│   │   ├── _layout.tsx
│   │   ├── (worker-tabs)/        # Worker-specific tabs
│   │   ├── auth/
│   │   └── ...
│   │
│   ├── components/                 # Worker-specific components
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── screens/
│   │   └── ui/
│   │
│   ├── context/                    # React Context
│   │   └── VerificationContext.tsx
│   │
│   ├── hooks/
│   ├── lib/
│   ├── constants/
│   └── assets/
│
└── README.md                        # This file
```

---

## 🧠 Key Implementation Details

### **1. AI-Powered Skill Extraction**

**The Problem:** Users might describe jobs poorly or upload videos. How do we reliably extract skills?

**The Solution:** Multimodal AI using Google Gemini

```javascript
// From aiExtractor.js
const extractSkillsFromMultimodal = async (text, audioPath, imagePath) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  // Analyze Text + Image + Audio simultaneously
  const prompt = `
    Analyze this job request:
    - Text description: "${text}"
    - Image: [attached file]
    - Audio: [attached file in Hindi/Telugu/Tamil]
    
    Return EXACTLY 2-3 skills from this master list: [plumbing, electrical, ac_repair, ...]
    OUTPUT FORMAT: ["skill1", "skill2"]
  `;
  
  const response = await model.generateContent([
    prompt,
    fileToGenerativePart(imagePath, "image/jpeg"),
    fileToGenerativePart(audioPath, "audio/m4a")
  ]);
  
  return JSON.parse(response.text());
};
```

**Why Gemini?**
- Multi-modal: Text + Image + Audio (perfect for workers who upload images)
- Faster than GPT-4 with flash model
- Can process Hindi/Telugu/Tamil audio natively

---

### **2. Location-Based Job Matching**

**The Problem:** How do we find workers near a job location efficiently?

**The Solution:** MongoDB Geospatial Queries (2dsphere index)

```javascript
// Get matching jobs within 5km of worker
const getMatchingJobs = async (workerId) => {
  const worker = await Work.findById(workerId);
  
  // Find jobs near worker's location
  const nearbyJobs = await JobRequest.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: worker.location.coordinates  // [lng, lat]
        },
        $maxDistance: 5000  // 5km in meters
      }
    },
    skillsRequired: { $in: worker.skills },  // Skill match
    status: "finding_workers"
  });
  
  return nearbyJobs;
};
```

**Why 2dsphere Index?**
- Fast distance calculation (O(log n) with index)
- Handles Earth's curvature correctly
- Perfect for "find jobs near me" feature

---

### **3. Real-Time Chat with Socket.io**

**The Problem:** How do we ensure instant message delivery without polling?

**The Solution:** WebSocket connection with Socket.io

```javascript
// Backend: server.js
const io = require('socket.io')(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // User joins job-specific room
  socket.on('join-room', (jobId) => {
    socket.join(`job-${jobId}`);
  });
  
  // Send message
  socket.on('send-message', async (data) => {
    const { jobId, senderId, message } = data;
    
    // Save to DB
    await Message.create({
      conversationId: jobId,
      senderId,
      message
    });
    
    // Broadcast to all in room
    io.to(`job-${jobId}`).emit('receive-message', {
      senderId,
      message,
      timestamp: new Date()
    });
  });
});

// Frontend: User app
import { io } from 'socket.io-client';

const socket = io('http://backend-url');

socket.emit('join-room', jobId);

socket.on('receive-message', (data) => {
  setMessages(prev => [...prev, data]);  // Update UI
});
```

**Advantages:**
- ✅ Bidirectional communication (faster than REST polling)
- ✅ Multiple clients in same "room" get updates instantly
- ✅ Fallback to HTTP long-polling if WebSocket unavailable
- ✅ Works on low-bandwidth networks

---

### **4. JWT Authentication Flow**

**The Problem:** How do we keep users logged in securely?

**The Solution:** Stateless JWT tokens

```javascript
// Login response
{
  "user": {
    "id": "user_123",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Client: Store token in Async Storage
await AsyncStorage.setItem('userToken', token);

// Client: Send token with every API call
const response = await fetch('http://backend/api/jobs', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Backend: Verify token
app.use((req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;  // Available to routes
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

**Benefits:**
- No session state needed on server (stateless)
- Scales horizontally (multiple servers)
- Works with mobile apps

---

### **5. Push Notifications (Expo)**

**When to Send:**
- New bid received
- Bid accepted
- Worker is on the way
- Service completed

```javascript
// Backend: Send push notification
const sendPushNotification = async (userId, title, message) => {
  const user = await User.findById(userId);
  
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: user.expoPushToken,  // Stored when user opens app
      sound: 'default',
      title: title,
      body: message,
      data: { jobId: job_123 }
    })
  });
};

// Frontend: Register for notifications
import * as Notifications from 'expo-notifications';

useEffect(() => {
  Notifications.getExpoPushTokenAsync().then(({ data: token }) => {
    // Send token to backend
    await fetch('http://backend/api/auth/update-push-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  });
}, []);

// Listen for incoming notifications
Notifications.addNotificationResponseListener((response) => {
  const jobId = response.notification.request.content.data.jobId;
  router.push(`/active-request-details?jobId=${jobId}`);  // Navigate
});
```

---

### **6. Multi-Step Job Status Workflow**

```
┌─────────────────┐
│ finding_workers │  ← User posts job
└────────┬────────┘
         │
         ↓
┌──────────────┐
│   bidding    │  ← Workers submit bids
└────────┬─────┘
         │
         ↓
┌─────────────────┐
│   assigned      │  ← User accepts a bid
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  scheduled      │  ← Confirmed date/time
└────────┬────────┘
         │
         ↓
┌──────────────────┐
│  in_progress     │  ← Worker has started
└────────┬─────────┘
         │
         ↓ (optional)
┌─────────┐
│ paused  │  ← Break
└────┬────┘
     │
     ↓
┌──────────────┐
│  completed   │  ← Job finished, ready for rating
└──────────────┘
```

**State Management Logic:**

```javascript
// jobRoutes.js
router.put('/update-status/:jobId', async (req, res) => {
  const { status } = req.body;
  const job = await JobRequest.findById(req.params.jobId);
  
  // Validate state transition
  const validTransitions = {
    'finding_workers': ['bidding', 'assigned'],
    'bidding': ['assigned'],
    'assigned': ['scheduled'],
    'scheduled': ['in_progress'],
    'in_progress': ['paused', 'completed'],
    'paused': ['in_progress', 'completed']
  };
  
  if (!validTransitions[job.status]?.includes(status)) {
    return res.status(400).json({ error: 'Invalid state transition' });
  }
  
  job.status = status;
  await job.save();
  
  // Send notifications to both user and worker
  sendNotification(job.userId, `Job status: ${status}`);
  sendNotification(job.assignedWorker.workerId, `Job status: ${status}`);
});
```

---

## 🐛 Troubleshooting

### **Problem: "Worker sees No jobs available"**

**Debug Steps:**

1. Check if worker has skills set:
```bash
curl "http://localhost:5000/api/work/worker_id"
# Look for: "skills": ["ac_repair", ...]
```

2. Check if jobs are posted:
```bash
curl "http://localhost:5000/api/jobs"
# Should return jobs with status: "finding_workers"
```

3. Check if worker location is valid:
```bash
curl "http://localhost:5000/api/work/stats/worker_id"
# Look for: "location": { "coordinates": [28.7041, 77.1025] }
```

4. Verify skill matching (case-insensitive):
```bash
# Job requires: ["AC Repair"]
# Worker has: ["ac_repair"]
# Should match! Our code uses .toLowerCase()
```

---

### **Problem: "Backend connection refused"**

**Check:**

1. Is backend running?
```bash
cd backend
node server.js
# Should show: ✅ Server running on http://192.168.0.9:5000
```

2. Is MongoDB connected?
```bash
# Check logs for: "🚀 Connected to MongoDB Atlas"
```

3. Correct backend URL in app?
```javascript
// User/lib/utils.ts or similar
const API_URL = 'http://192.168.0.9:5000';  // Must match your machine IP
```

4. Firewall blocking port 5000?
```bash
# Windows: Open port 5000
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="node.exe" enable=yes
```

---

### **Problem: "AI skill extraction failing"**

**Check:**

1. Gemini API key set?
```bash
# In .env file:
GEMINI_API_KEY=your_actual_key_here
```

2. Quota exceeded?
```bash
# Go to Google Cloud Console
# Check API usage and quota limits
```

3. File format unsupported?
```bash
# Supported:
# - Image: JPEG, PNG
# - Audio: M4A, WAV (check Gemini docs)
```

---

### **Problem: "Chat messages not sending"**

**Check:**

1. Socket.io connected?
```javascript
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});
```

2. In correct room?
```javascript
socket.on('join-room', (jobId) => {
  console.log(`Joined room: job-${jobId}`);
});
```

3. Message saved to DB?
```bash
# Check MongoDB messages collection
db.messages.find().sort({ createdAt: -1 }).limit(1)
```

---

### **Problem: "Notifications not working on phone"**

**Check:**

1. Expo push token registered?
```bash
# In app logs, should see:
# "Expo push token: ExponentPushToken[...]"
```

2. Token sent to backend?
```bash
POST /api/auth/update-push-token
{
  "token": "ExponentPushToken[...]"
}
```

3. Notification permission granted?
```javascript
const { status } = await Notifications.requestPermissionsAsync();
if (status !== 'granted') {
  console.log('Need notification permission');
}
```

---

## 🚀 Quick Start Checklist

- [ ] Clone repository
- [ ] Install backend dependencies (`npm install` in `/backend`)
- [ ] Create `.env` file with API keys
- [ ] Start MongoDB (local or Atlas)
- [ ] Start backend: `node server.js`
- [ ] Install User app dependencies
- [ ] Start User app: `npm start`
- [ ] Scan QR code with Expo Go
- [ ] Test job posting
- [ ] Install Worker app dependencies
- [ ] Start Worker app
- [ ] Test job discovery
- [ ] Create test jobs and bids

---

## 📞 Support & Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **Express.js**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **Socket.io**: https://socket.io/docs
- **Google Gemini API**: https://ai.google.dev/docs

---

## 🎓 Learning Resources for Developers

**To understand SkillConnect better, study these concepts:**

1. **Backend**
   - REST API design (Controllers, Routes, Models)
   - MongoDB geospatial queries (2dsphere indexes)
   - Socket.io event-driven architecture
   - JWT authentication & middleware
   - File upload handling with Multer

2. **Frontend**
   - React Hooks & Context API (State management)
   - Expo Router file-based routing
   - Async Storage (Local persistence)
   - Real-time updates with Socket.io
   - Push notifications (Expo Notifications)

3. **AI/ML**
   - Multimodal LLMs (Gemini)
   - Prompt engineering for skill extraction
   - JSON parsing from LLM output

4. **DevOps**
   - Environment variable management
   - MongoDB connection pooling
   - CORS configuration
   - Expo EAS builds

---

## 📝 License

This project is proprietary. All rights reserved.

---