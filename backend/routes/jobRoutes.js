
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const JobRequest = require('../models/JobRequest');

// // 1. Storage Configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Ensure this folder exists
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

// const upload = multer({ storage: storage });

// // 2. The Upload Route (POST)
// router.post('/upload', upload.fields([
//     { name: 'image', maxCount: 1 },
//     { name: 'video', maxCount: 1 },
//     { name: 'audio', maxCount: 1 }
// ]), async (req, res) => {
//     try {
//         const { description, budget } = req.body;

//         // Check if files exist in req.files
//         const imagePath = req.files['image'] ? req.files['image'][0].path : null;
//         const videoPath = req.files['video'] ? req.files['video'][0].path : null;
//         const audioPath = req.files['audio'] ? req.files['audio'][0].path : null;

//         const newJob = new JobRequest({
//             description,
//             budget,
//             imagePath,
//             videoPath,
//             audioPath
//         });

//         await newJob.save();
//         console.log("✅ Job Saved to DB:", newJob._id);
        
//         res.status(201).json({ message: "Success", job: newJob });
//     } catch (error) {
//         console.error("❌ Backend Error:", error);
//         res.status(500).json({ error: "Failed to save job request" });
//     }
// });

// // 3. The Fetch Jobs Route (GET)
// // This endpoint returns all jobs to be displayed in your "My Requests" list
// router.get('/my-requests', async (req, res) => {
//     try {
//         // .find() gets all documents
//         // .sort({ createdAt: -1 }) puts the newest requests at the top
//         const jobs = await JobRequest.find().sort({ createdAt: -1 });
        
//         console.log(`✅ Fetched ${jobs.length} jobs`);
//         res.status(200).json(jobs);
//     } catch (error) {
//         console.error("❌ Fetch Error:", error);
//         res.status(500).json({ error: "Failed to retrieve job requests" });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const JobRequest = require('../models/JobRequest');
const Work = require('../models/Work');
// ✅ Import the new multimodal function name
const { extractSkillsFromMultimodal } = require('../utils/aiExtractor');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// --- 1. USER UPLOADS JOB ---
router.post(
    '/upload',
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
        { name: 'audio', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { description, budget, userId, latitude, longitude } = req.body;

            if (!latitude || !longitude) {
                return res.status(400).json({ error: "Location is required" });
            }

            // Get file paths
            const imagePath = req.files?.image?.[0]?.path || null;
            const audioPath = req.files?.audio?.[0]?.path || null;
            const videoPath = req.files?.video?.[0]?.path || null;

            // ✅ Call the new function name with ALL 3 inputs
            const rawSkills = await extractSkillsFromMultimodal(description, audioPath, imagePath);
            const skillsRequired = rawSkills.map(s => s.toLowerCase().trim());
            const job = await JobRequest.create({
                description: description || "Voice/Image Request",
                budget,
                skillsRequired,
                userId,
                location: {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                },
                imagePath,
                videoPath,
                audioPath
            });

            res.status(201).json({
                success: true,
                job,
                aiSkills: skillsRequired
            });

        } catch (error) {
            console.error("❌ Job Upload Error:", error);
            res.status(500).json({ error: "Failed to post job" });
        }
    }
);
// --- 2. WORKER FEED (SHOW JOBS ON HOME SCREEN) ---
router.get('/worker-feed/:workerId', async (req, res) => {
    try {
        const { workerId } = req.params;
        const worker = await Work.findOne({ userId: workerId });

        if (!worker) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        // --- NEW: SKILL CRITERIA ---
        const workerSkills = (worker.skills || []).map(s => s.toLowerCase().trim());

        // Base Query
        let query = {
            status: 'finding_workers',
            userId: { $ne: workerId },
            // Filter jobs where the required skills overlap with worker's skills
            skillsRequired: { $in: workerSkills }
        };

        // Add location filter if coordinates exist
        if (worker.location && worker.location.coordinates) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: worker.location.coordinates
                    },
                    $maxDistance: 100000
                }
            };
        }

        let jobs = await JobRequest.find(query).sort({ createdAt: -1 });

        // FALLBACK: If no jobs found nearby with those specific skills, 
        // show the latest 10 jobs matching their skills regardless of location
        if (jobs.length === 0) {
            jobs = await JobRequest.find({
                status: 'finding_workers',
                userId: { $ne: workerId },
                skillsRequired: { $in: workerSkills } // Still keep the skill filter
            })
                .sort({ createdAt: -1 })
                .limit(10);
        }

        res.status(200).json(jobs);
    } catch (error) {
        console.error("❌ Worker Feed Error:", error);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find jobs where the userId matches
        // We filter for statuses that are not 'completed' or 'cancelled'
        const activeJobs = await JobRequest.find({
            userId: userId,
            status: { $in: ['finding_workers', 'bidding', 'scheduled', 'tracking', 'finding'] }
        }).sort({ createdAt: -1 }); // Newest first

        res.status(200).json({
            success: true,
            count: activeJobs.length,
            jobs: activeJobs
        });
    } catch (error) {
        console.error("❌ Fetch User Jobs Error:", error);
        res.status(500).json({ error: "Failed to fetch your active jobs" });
    }
});

router.get('/all-jobs', async (req, res) => {
    try {
        // Fetches every job in the database, newest first
        const jobs = await JobRequest.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        console.error("❌ Fetch All Jobs Error:", error);
        res.status(500).json({ error: "Failed to fetch all jobs" });
    }
});
// SUBMIT A BID (Worker side)
// DELETE all jobs
router.delete('/delete-all-jobs', async (req, res) => {
    try {
        // .deleteMany({}) with an empty object deletes every record in the collection
        const result = await JobRequest.deleteMany({});

        res.status(200).json({
            success: true,
            message: "All jobs have been deleted successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("❌ Delete All Jobs Error:", error);
        res.status(500).json({ error: "Failed to delete jobs" });
    }
});
router.post('/submit-bid', async (req, res) => {
    try {
        const { jobId, workerId, bidAmount } = req.body;

        // Validation
        if (!jobId || !workerId || !bidAmount) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const job = await JobRequest.findByIdAndUpdate(
            jobId,
            {
                $push: {
                    bids: {
                        workerId, // This must be the ID from the 'Work' collection
                        bidAmount: Number(bidAmount),
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!job) return res.status(404).json({ success: false, error: "Job not found" });

        res.status(200).json({ success: true, job });
    } catch (error) {
        console.error("Bid Error:", error);
        res.status(500).json({ success: false, error: "Failed to submit bid" });
    }
});

// GET BIDS (User side)
router.get('/:jobId/bids', async (req, res) => {
    try {
        const job = await JobRequest.findById(req.params.jobId)
            .populate({
                path: 'bids.workerId',
                model: 'Work', // Explicitly tell Mongoose which model to use
                select: 'name profilePic expertise skills rating location'
            });

        if (!job) return res.status(404).json({ error: "Job not found" });

        // Filter out any bids where the worker profile might have been deleted
        const validBids = job.bids.filter(bid => bid.workerId !== null);
        res.status(200).json(validBids);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bids" });
    }
});
// GET CHAT HISTORY FOR A SPECIFIC JOB
router.get('/:jobId/chat/:user1/:user2', async (req, res) => {
    try {
        const { jobId, user1, user2 } = req.params;
        const messages = await Message.find({
            jobId,
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ timestamp: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to load chat" });
    }
});

module.exports = router;