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

// // 2. The Upload Route
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

// module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const JobRequest = require('../models/JobRequest');

// 1. Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 2. The Upload Route (POST)
router.post('/upload', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), async (req, res) => {
    try {
        const { description, budget } = req.body;

        // Check if files exist in req.files
        const imagePath = req.files['image'] ? req.files['image'][0].path : null;
        const videoPath = req.files['video'] ? req.files['video'][0].path : null;
        const audioPath = req.files['audio'] ? req.files['audio'][0].path : null;

        const newJob = new JobRequest({
            description,
            budget,
            imagePath,
            videoPath,
            audioPath
        });

        await newJob.save();
        console.log("✅ Job Saved to DB:", newJob._id);
        
        res.status(201).json({ message: "Success", job: newJob });
    } catch (error) {
        console.error("❌ Backend Error:", error);
        res.status(500).json({ error: "Failed to save job request" });
    }
});

// 3. The Fetch Jobs Route (GET)
// This endpoint returns all jobs to be displayed in your "My Requests" list
router.get('/my-requests', async (req, res) => {
    try {
        // .find() gets all documents
        // .sort({ createdAt: -1 }) puts the newest requests at the top
        const jobs = await JobRequest.find().sort({ createdAt: -1 });
        
        console.log(`✅ Fetched ${jobs.length} jobs`);
        res.status(200).json(jobs);
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        res.status(500).json({ error: "Failed to retrieve job requests" });
    }
});

module.exports = router;