
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
            const skillsRequired = await extractSkillsFromMultimodal(description, audioPath, imagePath);

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
// --- 2. WORKER FEED (UPDATED FOR BETTER VISIBILITY) ---
router.get('/worker-feed/:workerId', async (req, res) => {
    try {
        const { workerId } = req.params;

        // 1. Find the worker profile
        const worker = await Work.findOne({ userId: workerId });
        if (!worker) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        // 2. Build the query
        const query = {
            status: 'finding_workers',
            userId: { $ne: workerId }, // Don't show your own jobs
        };

        // 3. Optimized Logic: 
        // We show jobs if: 
        // A) The worker has matching skills 
        // B) OR if the job has NO specific skills (general)
        // C) OR we can comment out skills entirely to show ALL jobs to ALL workers
        query.$or = [
            { skillsRequired: { $in: worker.skills || [] } },
            { skillsRequired: { $size: 0 } }, // Show jobs with no tags
            { skillsRequired: "general_handyman" }
        ];

        // 4. Geospatial Query
        // Increased distance to 50km (50000 meters) to ensure workers see jobs while testing
        if (worker.location && worker.location.coordinates) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: worker.location.coordinates
                    },
                    $maxDistance: 50000 
                }
            };
        }

        const jobs = await JobRequest.find(query).sort({ createdAt: -1 });

        res.status(200).json(jobs);
    } catch (error) {
        console.error("❌ Worker Feed Error:", error);
        res.status(500).json({ error: "Failed to fetch jobs" });
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

module.exports = router;