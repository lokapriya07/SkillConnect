# Dynamic Tracking - Quick Start Testing Guide

## What's Been Implemented

When a **worker accepts a job**, the **user** will now see the status update dynamically on their bookings page without having to refresh. The tracking page also updates in real-time showing the job progress through different stages.

---

## How to Test

### Step 1: Start the Backend
```bash
cd backend
npm start
# Should run on http://localhost:5000
```

### Step 2: Open User App
- Navigate to **Bookings** page
- You should see job listings

### Step 3: Test Status Update Flow

#### Create a Test Scenario:

**Option A: Quick Test (with existing data)**
1. User opens **Bookings** page
2. Click on any **active booking**
3. You'll see **"LIVE"** indicator at top
4. Look at **"ACTIVITY TIMELINE"** section showing:
   - Order Accepted ✓
   - On the Way
   - Service in Progress
   - Job Finished

**Option B: Full End-to-End Test**
1. **User App**: Create a new service request
2. **Worker App**: Accept the job from their available jobs
3. **User App**: 
   - Go back to bookings
   - You'll see status change to "WORKER ASSIGNED" within 5 seconds
   - Click on booking to see tracking page
   - Watch the timeline update as worker updates status

---

## Testing the Real-Time Updates

### Watch the Status Change in Real-Time:

1. **Keep Bookings page open**
2. **Switch to Worker App** (use split screen if possible)
3. **Worker accepts job** → Click "Accept" button
4. **Watch User App**: Status badge updates automatically
5. **Sync indicator**: Green dot shows live connection

### Expected Behavior:

```
Initial State: "BIDDING" or "FINDING WORKERS"
     ↓
Worker accepts (5 sec)
     ↓
User sees: "WORKER ASSIGNED" 🟢 LIVE
     ↓
Worker starts service
     ↓
User sees: "IN PROGRESS" 🟢 LIVE
     ↓
Worker completes job
     ↓
User sees: "COMPLETED" (polling stops)
```

---

## API Endpoints to Test

### Manually test with cURL/Postman:

#### 1. Get Current Job Status
```bash
curl -X GET http://localhost:5000/api/worker/job/{jobId}
```

#### 2. Worker Accepts Job
```bash
curl -X PUT http://localhost:5000/api/jobs/worker/{jobId}/accept \
  -H "Content-Type: application/json" \
  -d '{"workerId": "worker_id"}'
```

#### 3. Update Job Status
```bash
curl -X PUT http://localhost:5000/api/jobs/worker/{jobId}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

#### 4. Complete Job
```bash
curl -X PUT http://localhost:5000/api/jobs/worker/{jobId}/complete
```

---

## Debugging Tips

### Check if polling is working:

1. **Open Browser DevTools** (if using web/expo web)
2. **Network Tab**: Should see `/api/worker/job` requests every 5 seconds
3. **Response**: Should contain current job status

### Check Console Logs:

Look for:
```
✅ Get Job Status Error: [if any errors]
Error polling booking status: [network issues]
```

### Mobile App Testing:

1. **Android Studio Logcat** or **Xcode Console**
2. Filter for "Get Job Status"
3. Should see successful fetches every 5 seconds

---

## Expected API Responses

### GET /api/worker/job/:jobId

Success Response:
```json
{
  "success": true,
  "job": {
    "id": "63f7a2b9c8e3d4f5g6h7i8j9",
    "status": "assigned",
    "serviceName": "Plumbing Repair",
    "budget": 500,
    "address": "123 Main St, Bangalore",
    "scheduledDate": "2024-02-15",
    "scheduledTime": "10:00 AM",
    "assignedWorker": {
      "workerId": "worker_id_123",
      "workerName": "Raj Kumar",
      "workerProfilePic": "https://...",
      "assignedAt": "2024-02-14T15:30:00Z"
    },
    "totalAmount": 550,
    "createdAt": "2024-02-14T10:00:00Z",
    "updatedAt": "2024-02-14T15:30:00Z"
  }
}
```

---

## Status Mapping Reference

| Status | Display Label | Badge Color | Icon |
|--------|--------------|-------------|------|
| `assigned` | WORKER ASSIGNED | 🔵 Primary Blue | ✓ |
| `scheduled` | SCHEDULED | 🔵 Primary Blue | 📅 |
| `in_progress` | IN PROGRESS | 🟠 Orange | ⚙️ |
| `completed` | COMPLETED | 🟢 Green | ✓ |
| `cancelled` | CANCELLED | 🔴 Red | ✗ |

---

## Troubleshooting

### Issue: Status not updating

**Check:**
- [ ] Backend is running
- [ ] API URL in env is correct
- [ ] Network connection is stable
- [ ] Job ID is valid

**Fix:**
```bash
# Restart backend
cd backend
npm start

# Check MongoDB connection
# Make sure MONGO_URI environment variable is set
```

### Issue: "OFFLINE" status shown

**Means:** Polling failed to fetch

**Check:**
- [ ] Backend endpoint exists: `/api/worker/job/:jobId`
- [ ] JobId parameter is correct
- [ ] Network tab shows requests

**Fix:**
```bash
# Test endpoint manually
curl http://localhost:5000/api/worker/job/test_job_id
# Should return JSON (even if empty)
```

### Issue: Worker ID not being saved

**Check:**
- [ ] Worker is passing `workerId` in accept request body
- [ ] WorkerID is valid MongoDB ObjectId

**Fix:**
- Ensure `User/app/(worker-tabs)/jobs.tsx` updated with new accept function
- Restart worker app to load new code

---

## Performance Notes

- **Polling Interval**: 5 seconds (configurable)
- **Polling Scope**: Only active jobs (auto-stops at completion)
- **Network**: ~1KB per poll request
- **Battery Impact**: Minimal (stops polling for completed jobs)

---

## Next Steps After Testing

1. ✅ Test with real worker accepting jobs
2. ✅ Verify database updates correctly
3. ✅ Check frontend updates match backend
4. ✅ Monitor network requests in DevTools
5. Consider adding WebSocket for instant updates (future enhancement)

---

## Support Commands

### Reset Test Data
```bash
# Clear all jobs
curl -X DELETE http://localhost:5000/api/jobs/delete-all-jobs

# Fetch fresh jobs
curl -X GET http://localhost:5000/api/jobs/user/{userId}
```

### View Raw Job Data
```bash
curl http://localhost:5000/api/jobs/get-job/{jobId}
```

---

## Success Indicators ✓

- [ ] Bookings page updates status without manual refresh
- [ ] "LIVE" indicator shows while syncing
- [ ] Tracking page displays correct status progression
- [ ] Worker name appears on status update
- [ ] Polling continues every 5 seconds for active jobs
- [ ] Polling stops after job completion
- [ ] No errors in network tab
