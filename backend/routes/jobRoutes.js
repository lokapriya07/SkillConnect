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

// 2. The Upload Route
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

module.exports = router;