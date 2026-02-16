# Dynamic Job Tracking Implementation

## Overview
Dynamic real-time status tracking has been implemented so that when a worker accepts a job, the user's booking page immediately reflects the updated status without manual refresh.

---

## Architecture

### 1. **Backend Endpoints Added** (`/backend/routes/jobRoutes.js` & `server.js`)

#### User-Side Endpoints (Booking Tracking)
- **GET `/api/worker/job/:jobId`** - Retrieves job status with assigned worker details
  - Returns: `{ success: true, job: {...} }`
  - Updates every 5 seconds on client side

- **PUT `/api/worker/job/:jobId/status`** - Updates job status (user side trigger)

#### Worker-Side Endpoints (Job Management)
- **PUT `/api/jobs/worker/:jobId/accept`** - Worker accepts a job
  - Body: `{ workerId }`
  - Sets status to `assigned`
  - Stores workerProfileId in `assignedWorker`

- **PUT `/api/jobs/worker/:jobId/complete`** - Worker marks job as completed
  - Sets status to `completed`

- **PUT `/api/jobs/worker/:jobId/status`** - Generic status update for worker
  - Body: `{ status: 'scheduled' | 'in_progress' | 'completed' }`

---

## Frontend Implementation

### 2. **User Bookings Screen** (`User/components/screens/bookings-screen.tsx`)

#### Features Added:
✅ **Real-time Status Polling**
- Polls `/api/worker/job/{bookingId}` every 5 seconds
- Only polls active jobs (excludes completed/cancelled)
- Stores live status in `liveBookingsStatus` state

✅ **Dynamic Status Display**
- Shows "WORKER ASSIGNED" when status = `assigned`
- Shows "SCHEDULED" when status = `scheduled`
- Shows "IN PROGRESS" when status = `in_progress` (with orange badge)
- Shows "COMPLETED" when status = `completed`

✅ **Live Status Indicator**
- Small animated dot showing sync status
- Used for each booking card

✅ **Enhanced Status Colors/Labels**
```jsx
getStatusLabel(status) {
  - 'assigned': 'WORKER ASSIGNED'
  - 'scheduled': 'SCHEDULED'
  - 'in_progress': 'IN PROGRESS'
  - 'completed': 'COMPLETED'
  // ... etc
}
```

#### Code Changes:
```jsx
// Polling for real-time updates
useEffect(() => {
  const pollBookingStatuses = async () => {
    for (const booking of userBookingsList) {
      const res = await fetch(`${API_URL}/api/worker/job/${booking.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLiveBookingsStatus(prev => ({
            ...prev,
            [booking.id]: {
              status: data.job.status,
              assignedWorker: data.job.assignedWorker,
              // ...
            }
          }));
        }
      }
    }
  };
  
  pollBookingStatuses();
  interval = setInterval(pollBookingStatuses, 5000); // Poll every 5 seconds
  return () => clearInterval(interval);
}, [userBookingsList]);
```

### 3. **Booking Details/Tracking Screen** (Already Implemented)
- **Path**: `User/app/booking-details.tsx`
- ✅ Already has polling enabled (5 second intervals)
- ✅ Displays "LIVE" status indicator
- ✅ Shows activity timeline with status progression
- ✅ Displays assigned worker information

### 4. **Worker Jobs Page** (`Worker/app/(worker-tabs)/jobs.tsx`)

#### Enhancements:
✅ **Accept Job with Worker ID**
```jsx
const handleAcceptJob = async (jobId: string) => {
  const userStr = await AsyncStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const workerId = user?.workerProfileId || user?._id;
  
  const response = await fetch(
    `${API_URL}/api/jobs/worker/${jobId}/accept`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId })
    }
  );
};
```

---

## Complete User Flow

### Scenario: Worker Accepts Job → User Sees Update

1. **User creates job request**
   - Status: `finding_workers`

2. **User sends request to nearby workers**
   - Status: `bidding`

3. **User accepts worker's bid**
   - Bids route: `/:bidId/accept`
   - Job status → `assigned`
   - Stores worker profile in `assignedWorker`

4. **User opens bookings page**
   - Sees all active bookings
   - Polling starts for each active booking
   - Every 5 seconds: Fetches `/api/worker/job/{bookingId}`

5. **User clicks on a booking → Tracking page opens**
   - Polling already active from bookings
   - Displays "LIVE" status
   - Shows status timeline: Order Accepted → On the Way → Service in Progress

6. **Worker updates status**
   - Backend: Job status changes in database
   
7. **User sees real-time update**
   - Next poll cycle (~5 seconds) fetches updated status
   - UI updates with new status
   - Status badge and timeline progress automatically updates

---

## Status Flow Chart

```
Job Creation
  ↓
finding_workers
  ↓ (user sends requests)
bidding
  ↓ (user accepts worker bid)
assigned ← WORKER ASSIGNED (Syncing starts)
  ↓ (worker starts service)
in_progress ← IN PROGRESS
  ↓ (worker completes)
completed ← COMPLETED (Polling stops for this job)
```

---

## Key Implementation Details

### Polling Strategy
- **Interval**: 5 seconds (configurable)
- **Scope**: Only active jobs (not completed/cancelled)
- **State**: Merged with local store data (live takes precedence)
- **Performance**: Efficient filtering to poll only necessary jobs

### Data Flow
```
Backend Database (Job Status)
  ↓ (via polling)
Frontend State (liveBookingsStatus)
  ↓ (fallback if no live data)
UI Display (uses live status if available)
```

### Real-time Indicators
- 🟢 **Green dot**: Currently syncing
- 🔘 **Gray dot**: Offline/error
- **LIVE** text: Shows sync status

---

## API Documentation

### GET /api/worker/job/:jobId
**Response:**
```json
{
  "success": true,
  "job": {
    "id": "job_id",
    "status": "assigned",
    "serviceName": "Plumbing",
    "budget": 500,
    "scheduledDate": "2024-02-15",
    "scheduledTime": "10:00 AM",
    "assignedWorker": {
      "workerId": "worker_id",
      "workerName": "John Plumber",
      "workerProfilePic": "url",
      "assignedAt": "2024-02-14T10:00:00Z"
    }
  }
}
```

### PUT /api/jobs/worker/:jobId/accept
**Request:**
```json
{ "workerId": "worker_id" }
```
**Response:** Updated job object

### PUT /api/jobs/worker/:jobId/complete
**Response:** Updated job object with `status: "completed"`

---

## Testing Checklist

- [ ] User creates booking
- [ ] Worker accepts job from their app
- [ ] User bookings page shows status update within 5 seconds
- [ ] Booking details page shows "LIVE" indicator while syncing
- [ ] Tracking page displays correct status steps
- [ ] Worker name appears after assignment
- [ ] Status updates correctly through all stages (assigned → in_progress → completed)
- [ ] Offline status shows when connection lost
- [ ] Polling stops after job completion

---

## Future Enhancements

1. **WebSocket Integration** - Replace polling with real-time WebSocket for instant updates
2. **Push Notifications** - Notify user immediately when status changes
3. **Background Sync** - Keep polling active even when app is in background
4. **Audio/Visual Alerts** - Sound/haptic feedback on status change
5. **GPS Tracking** - Show worker's real-time location on map
6. **Estimated Time** - Calculate ETA based on worker location/distance

---

## Files Modified

1. ✅ `backend/routes/jobRoutes.js` - Added 7 new endpoints
2. ✅ `backend/server.js` - Added `/api/worker/job/:jobId` endpoints
3. ✅ `User/components/screens/bookings-screen.tsx` - Added polling logic
4. ✅ `Worker/app/(worker-tabs)/jobs.tsx` - Updated accept function with workerId

---

## Configuration

All polling intervals and API endpoints are configurable via constants:

```jsx
const API_URL = process.env.EXPO_PUBLIC_API_URL;
// Default polling: 5000ms (5 seconds)
interval = setInterval(pollBookingStatuses, 5000);
```

To adjust polling interval, modify the `setInterval` timing in both files.
