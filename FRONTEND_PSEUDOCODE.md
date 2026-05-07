# Frontend Pseudocode - Main Features

## USER APP

### Post Job
```
function postJob():
  GET user input (title, description, skills, budget, location)
  VALIDATE all fields
  POST /api/jobs/create with data
  IF success:
    SHOW "Job posted!"
    NAVIGATE to bookings screen
  ELSE:
    SHOW error message
```

### Search Workers
```
function searchWorkers():
  FETCH available workers from /api/workers
  FILTER by skills, rating, distance
  DISPLAY worker cards with profiles
  WHEN user taps worker:
    SHOW detailed profile
    OPTION to message or view bids
```

### Receive & Accept Bids
```
function viewBids(jobId):
  FETCH bids from /api/bids?jobId
  SORT by price, rating
  DISPLAY bid list
  WHEN user accepts bid:
    PUT /api/bids/accept with bidId
    CREATE chat channel with worker
    SEND notification to worker
    UPDATE job status to "assigned"
```

### Real-Time Job Tracking
```
function trackJob(jobId):
  EVERY 5 SECONDS:
    FETCH /api/worker/job/{jobId}
    UPDATE status display (scheduled → in_progress → completed)
    SHOW assigned worker location/ETA
    SHOW push notifications as they arrive
  
  DISPLAY status progress bar:
    Scheduled ▢ → In Progress ▢ → Completed ▢
```

### Chat
```
function sendMessage(jobId, message):
  SEND message to /api/chat/send
  SAVE to local state
  DISPLAY in chat UI
  WHEN message received:
    SHOW push notification
    UPDATE chat screen
```

### Rate Worker
```
function rateWorker(jobId, rating, review):
  POST /api/jobs/{jobId}/rate
  WITH rating (1-5) and review text
  SEND notification to worker
  UPDATE worker's profile rating
```

---

## WORKER APP

### Complete Profile
```
function setupProfile():
  GET user input:
    - skills (name, proficiency level)
    - certifications (upload docs)
    - hourly rate
    - service area & availability
    - profile photo
  POST to /api/workers/profile
  SAVE in database
```

### Browse Jobs
```
function browseJobs():
  FETCH /api/jobs?skills=userSkills&location=userLocation
  FILTER by matching skills, distance, budget
  SORT by best match score
  DISPLAY job cards:
    [Job title | User rating | Budget | Skills needed]
  WHEN worker taps job:
    SHOW full details
    OPTION to submit bid
```

### Submit Bid
```
function submitBid(jobId):
  GET user input:
    - bid amount
    - estimated duration
    - cover letter
    - availability dates
  POST to /api/bids/submit
  SEND notification to job poster
  SHOW "Bid submitted!"
  UPDATE bid status to "pending"
```

### Accept Job
```
function acceptJob(jobId):
  WHEN bid is accepted:
    RECEIVE push notification
    FETCH job details from /api/jobs/{jobId}
    CREATE work record
    OPEN chat with user
    UPDATE status to "ACCEPTED"
    SHOW "Ready to work!" screen
```

### Update Job Status
```
function updateJobStatus(jobId, newStatus):
  // newStatus: scheduled, in_progress, paused, completed
  
  PUT /api/jobs/worker/{jobId}/status
  WITH newStatus and details
  
  SEND push notification to user
  UPDATE local job display
  
  IF paused: SHOW pause reason input
  IF completed: PROMPT for proof-of-work (photos)
```

### Earnings & Ratings
```
function viewEarnings():
  FETCH /api/workers/earnings
  DISPLAY total earnings
  DISPLAY completed jobs count
  DISPLAY average rating
  
  WHEN user taps completed job:
    SHOW payment amount
    SHOW user's rating & review
```

---

## Real-Time Features (Both Apps)

### Push Notifications
```
ON notification received:
  IF type == "bid_submitted":
    SHOW: "New bid from [worker name]"
  IF type == "worker_accepted":
    SHOW: "Worker accepted your job!"
  IF type == "service_started":
    SHOW: "Service started! 🔧"
  IF type == "job_completed":
    SHOW: "Job completed! Please rate"
  
  WHEN user taps notification:
    JUMP to relevant screen
```

### Status Polling
```
EVERY 5 SECONDS:
  IF job is active (in_progress):
    FETCH latest status from /api/worker/job/{jobId}
    IF status changed:
      UPDATE UI
      SHOW notification
```

---

## 📱 User Flow Summary
```
REGISTER → POST JOB → RECEIVE BIDS → ACCEPT WORKER → CHAT → 
TRACK PROGRESS → RATE → DONE ✅
```

## 💼 Worker Flow Summary
```
REGISTER → SETUP PROFILE → BROWSE JOBS → SUBMIT BID → 
WAIT FOR ACCEPTANCE → START WORK → UPDATE STATUS → COMPLETE → 
RECEIVE RATING ⭐
```
