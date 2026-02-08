
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
            const { description, budget, userId, latitude, longitude, address, city, state, fullAddress } = req.body;

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
                audioPath,
                address: address || '',
                city: city || '',
                state: state || '',
                fullAddress: fullAddress || address || ''
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

// ASSIGN WORKER - Find and assign best matching worker based on distance, ratings, and skills
router.post('/assign-worker', async (req, res) => {
    try {
        const { 
            serviceCategory, 
            serviceName,
            userId, 
            userLatitude, 
            userLongitude, 
            requiredSkills 
        } = req.body;

        if (!userLatitude || !userLongitude) {
            return res.status(400).json({ error: "User location is required" });
        }

        // Map service categories to relevant skills
        const categorySkillsMap = {
            'cleaning': ['cleaning', 'house cleaning', 'deep cleaning', 'bathroom cleaning', 'kitchen cleaning', 'sofa cleaning'],
            'plumbing': ['plumbing', 'pipe repair', 'leak detection', 'installation', 'tap', 'drain'],
            'electrical': ['electrical', 'wiring', 'repair', 'installation', 'fan', 'switchboard'],
            'painting': ['painting', 'wall painting', 'interior painting', 'exterior painting'],
            'salon': ['salon', 'haircut', 'beauty', 'styling', 'grooming', 'spa', 'massage', 'facial'],
            'moving': ['moving', 'packing', 'lifting', 'transport'],
            'repair': ['repair', 'maintenance', 'handyman'],
            'gardening': ['gardening', 'lawn care', 'landscaping'],
            'carpentry': ['carpentry', 'wood work', 'furniture', 'polishing'],
            'default': requiredSkills || []
        };

        // Get skills to search for
        const searchSkills = categorySkillsMap[serviceCategory?.toLowerCase()] || 
                            categorySkillsMap['default'];

        // Build query to find available workers with matching skills
        // NOTE: For testing, we'll be less strict - allow all available workers
        let workerQuery = {
            isAvailable: true,
            skills: { $in: searchSkills.map(s => new RegExp(s, 'i')) }
        };

        // Find workers with geo query if location provided
        if (userLatitude && userLongitude) {
            workerQuery.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(userLongitude), parseFloat(userLatitude)]
                    },
                    $maxDistance: 50000 // 50km radius
                }
            };
        }

        // Find workers matching criteria
        let workers = await Work.find(workerQuery)
            .sort({ rating: -1 }) // Higher rating first
            .limit(20);

        // If no workers found nearby with skills, expand search radius (up to 100km)
        if (workers.length === 0 && userLatitude && userLongitude) {
            workers = await Work.find({
                isAvailable: true,
                skills: { $in: searchSkills.map(s => new RegExp(s, 'i')) },
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(userLongitude), parseFloat(userLatitude)]
                        },
                        $maxDistance: 100000 // 100km radius
                    }
                }
            })
            .sort({ rating: -1 })
            .limit(20);
        }

        // If no workers found with skills, return error - DO NOT assign workers without matching skills
        if (workers.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No workers available with required skills",
                message: "No workers found with matching skills in your area. Please try again later."
            });
        }

        // Score and rank workers based on:
        // 1. Skill match (40% weight)
        // 2. Rating (30% weight)
        // 3. Distance (30% weight - closer is better)
        const scoredWorkers = workers.map(worker => {
            const workerSkills = (worker.skills || []).map(s => s.toLowerCase());
            
            // Calculate skill match score
            const matchedSkills = searchSkills.filter(s => 
                workerSkills.some(ws => ws.includes(s.toLowerCase()) || s.toLowerCase().includes(ws))
            );
            const skillScore = matchedSkills.length / Math.max(searchSkills.length, 1);
            
            // Normalize rating (assuming max 5)
            const ratingScore = (worker.rating || 0) / 5;
            
            // Calculate distance score
            let distanceScore = 1;
            if (worker.location && worker.location.coordinates && userLatitude && userLongitude) {
                const workerLat = worker.location.coordinates[1];
                const workerLng = worker.location.coordinates[0];
                const distance = getDistanceFromLatLonInKm(
                    userLatitude, userLongitude,
                    workerLat, workerLng
                );
                // Closer = higher score, max distance 50km
                distanceScore = Math.max(0, 1 - (distance / 50));
            }
            
            // Calculate final score
            const totalScore = (skillScore * 0.4) + (ratingScore * 0.3) + (distanceScore * 0.3);
            
            return {
                ...worker.toObject(),
                skillMatch: matchedSkills,
                skillScore,
                ratingScore,
                distanceScore,
                totalScore
            };
        });

        // Sort by total score descending
        scoredWorkers.sort((a, b) => b.totalScore - a.totalScore);

        // Select the best worker
        const bestWorker = scoredWorkers[0];

        if (!bestWorker) {
            return res.status(404).json({ 
                error: "No available workers found",
                message: "We couldn't find any available workers for your service. Please try again later."
            });
        }

        // Create a job request for the assigned worker
        const jobRequest = await JobRequest.create({
            userId: userId,
            serviceName: serviceName || serviceCategory || 'Service',
            description: `${serviceName || serviceCategory || 'Service'} service booking`,
            budget: 0, // Will be updated later
            skillsRequired: searchSkills,
            location: {
                type: 'Point',
                coordinates: [parseFloat(userLongitude), parseFloat(userLatitude)]
            },
            status: 'assigned',
            assignedWorker: {
                workerId: bestWorker._id,
                workerName: bestWorker.name,
                workerProfilePic: bestWorker.profilePic,
                assignedAt: new Date()
            }
        });

        console.log('✅ Job created with assigned worker:', jobRequest._id);

        res.status(200).json({
            success: true,
            worker: {
                _id: bestWorker._id,
                userId: bestWorker.userId,
                name: bestWorker.name,
                title: bestWorker.title,
                profilePic: bestWorker.profilePic,
                rating: bestWorker.rating,
                experience: bestWorker.experience,
                skills: bestWorker.skills,
                city: bestWorker.city,
                hourlyRate: bestWorker.hourlyRate,
                matchScore: Math.round(bestWorker.totalScore * 100)
            },
            jobId: jobRequest._id,
            totalWorkersFound: workers.length,
            message: `Found ${workers.length} workers, best match selected and job created`
        });

    } catch (error) {
        console.error('❌ Assign Worker Error:', error);
        res.status(500).json({ error: "Failed to assign worker" });
    }
});

// Helper function to calculate distance between two coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// DEBUG ENDPOINT - Get all workers to check database
router.get('/debug/workers', async (req, res) => {
    try {
        const workers = await Work.find({}).limit(50);
        res.status(200).json({
            success: true,
            count: workers.length,
            workers: workers.map(w => ({
                _id: w._id,
                userId: w.userId,
                name: w.name,
                skills: w.skills,
                isAvailable: w.isAvailable,
                verificationStatus: w.verificationStatus,
                rating: w.rating,
                location: w.location
            }))
        });
    } catch (error) {
        console.error('Debug Error:', error);
        res.status(500).json({ error: "Failed to fetch workers" });
    }
});

// GET ASSIGNED JOBS FOR WORKER (with user details)
router.get('/worker/:workerId/assigned-jobs', async (req, res) => {
    try {
        const { workerId } = req.params;
        
        // Find jobs assigned to this worker and populate user details
        const assignedJobs = await JobRequest.find({
            'assignedWorker.workerId': workerId,
            status: { $in: ['assigned', 'scheduled', 'in_progress'] }
        })
        .populate('userId', 'name phone email address fullAddress city state')
        .sort({ createdAt: -1 });

        // Transform jobs to include user details
        const jobsWithUserDetails = assignedJobs.map(job => ({
            ...job.toObject(),
            userName: job.userId?.name || 'Customer',
            userPhone: job.userId?.phone || '+91 00000 00000',
            userEmail: job.userId?.email || '',
            // Use job's address fields first, fallback to user's address
            address: job.fullAddress || job.address || (job.userId?.fullAddress || job.userId?.address || '') || 'Address not available',
            city: job.city || job.userId?.city || '',
            state: job.state || job.userId?.state || ''
        }));

        res.status(200).json({
            success: true,
            count: jobsWithUserDetails.length,
            jobs: jobsWithUserDetails
        });
    } catch (error) {
        console.error('Fetch Assigned Jobs Error:', error);
        res.status(500).json({ error: "Failed to fetch assigned jobs" });
    }
});

// ACCEPT JOB - Update status to in_progress
router.put('/worker/:jobId/accept', async (req, res) => {
    try {
        const { jobId } = req.params;
        
        const job = await JobRequest.findById(jobId);
        
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }
        
        // Update status to in_progress
        job.status = 'in_progress';
        await job.save();

        res.status(200).json({
            success: true,
            message: "Job accepted successfully",
            job: {
                ...job.toObject(),
                userName: job.userId?.name || 'Customer',
                userPhone: job.userId?.phone || '+91 00000 00000',
                address: job.fullAddress || job.address || 'Address not available'
            }
        });
    } catch (error) {
        console.error('Accept Job Error:', error);
        res.status(500).json({ error: "Failed to accept job" });
    }
});

// GET USER DETAILS BY ID
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const User = require('../models/User');
        const user = await User.findById(userId).select('name phone email');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                name: user.name,
                phone: user.phone,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Fetch User Details Error:', error);
        res.status(500).json({ error: "Failed to fetch user details" });
    }
});
router.post('/toggle-availability', async (req, res) => {
    try {
        const { name, isAvailable } = req.body;
        console.log("Attempting to toggle:", name); // Debug log

        // 1. Use a case-insensitive search
        const worker = await Work.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (!worker) {
            console.log("Worker not found in DB");
            return res.status(404).json({ error: "Worker not found" });
        }

        // 2. Update and save
        worker.isAvailable = isAvailable !== undefined ? isAvailable : !worker.isAvailable;
        await worker.save();

        console.log(`Success: ${worker.name} is now ${worker.isAvailable}`);
        res.status(200).json({ success: true, isAvailable: worker.isAvailable });
    } catch (error) {
        console.error('❌ Toggle Route Crash:', error); // This will show you the real error
        res.status(500).json({ error: "Server error", details: error.message });
    }
});

module.exports = router;