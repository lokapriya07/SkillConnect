
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
const User = require('../models/User');
// ✅ Import the new multimodal function name
const { extractSkillsFromMultimodal } = require('../utils/aiExtractor');
const { sendPushNotification } = require('./notificationRoutes');
// Import notification helper
const notificationHelper = require('../utils/notificationHelper');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// Skill category mapping for better matching
const skillCategories = {
    plumbing: ['plumbing', 'drain_cleaning', 'tap_repair', 'water_tank_repair', 'pipe_repair', 'leak_detection', 'installation'],
    electrical: ['electrical', 'wiring', 'fan_repair', 'switchboard_fix', 'repair', 'installation'],
    cleaning: ['cleaning', 'deep_cleaning', 'bathroom_cleaning', 'sofa_cleaning', 'kitchen_cleaning', 'house_cleaning'],
    ac: ['ac_repair', 'ac_installation', 'ac_service', 'air_conditioning'],
    appliance: ['appliance', 'refrigerator_repair', 'washing_machine', 'microwave_repair'],
    carpentry: ['carpentry', 'furniture_assembly', 'door_lock_repair', 'cupboard_repair', 'wood_work', 'furniture', 'polishing'],
    painting: ['painting', 'wall_putty', 'waterproofing', 'interior_design', 'wall_painting'],
    pest: ['pest_control', 'termite_treatment', 'rodent_control', 'cockroach', 'ant', 'termite', 'spider', 'bug', 'insect_control'],
    gardening: ['gardening', 'landscaping', 'plant_care', 'lawn_care'],
    salon: ['beauty_salon', 'haircut', 'massage', 'makeup_artist', 'styling', 'grooming', 'spa', 'facial', 'hair_styling', 'beard', 'barber'],
    moving: ['moving', 'packing', 'lifting', 'transport'],
    repair: ['repair', 'maintenance', 'handyman', 'general_handyman'],
    masonry: ['masonry', 'tile_fixing', 'construction', 'welding']
};

const getSkillCategory = (skill) => {
    for (const [category, skills] of Object.entries(skillCategories)) {
        if (skills.some(catSkill => skill.includes(catSkill) || catSkill.includes(skill))) {
            return category;
        }
    }
    return null;
};

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

            // Validate userId is required
            if (!userId || userId === 'undefined' || userId === 'null') {
                return res.status(400).json({ error: "User ID is required. Please log in again." });
            }

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

            console.log(`✅ Job uploaded by user ${userId}`);

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

        // Try to find Work profile, but also check if worker exists in User model
        let workerSkills = [];
        let workerLocation = null;

        // First try Work model
        const worker = await Work.findOne({ userId: workerId });
        if (worker) {
            // Check if worker is verified and profile is complete
            const currentStatus = worker.status || (worker.verificationStatus === 'verified' ? 'verified' : 'unverified');
            if (currentStatus !== 'verified' || !worker.isProfileComplete) {
                console.log(`⚠️ Worker not verified or profile incomplete. Status: ${currentStatus}, Profile Complete: ${worker.isProfileComplete}`);
                return res.status(200).json([]);
            }

            workerSkills = (worker.skills || []).map(s => s.toLowerCase().trim()).filter(s => s.length > 0);
            workerLocation = worker.location;
            console.log(`✅ Found worker in Work model. Skills: ${workerSkills.join(', ')}`);
        } else {
            // Fallback to User model if Work profile doesn't exist
            const userProfile = await User.findById(workerId);
            if (!userProfile) {
                return res.status(404).json({ message: "Worker not found" });
            }
            console.log("⚠️ Worker profile in Work model not found, using User model");
            // Since no Work profile, cannot show jobs
            return res.status(200).json([]);
        }

        // If worker has no skills, return nearby jobs (within 100km if location available)
        if (workerSkills.length === 0) {
            console.log("⚠️ Worker has no skills. Fetching nearby available jobs...");
            let query = {
                status: 'finding_workers',
                userId: { $ne: workerId }
            };

            // Add location filter if available
            if (workerLocation && workerLocation.coordinates &&
                workerLocation.coordinates.length === 2 &&
                !Number.isNaN(workerLocation.coordinates[0]) &&
                !Number.isNaN(workerLocation.coordinates[1]) &&
                !(workerLocation.coordinates[0] === 0 && workerLocation.coordinates[1] === 0)) {

                query.location = {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: workerLocation.coordinates
                        },
                        $maxDistance: 100000 // 100km
                    }
                };
            }

            const jobs = await JobRequest.find(query).sort({ createdAt: -1 }).limit(20);
            return res.status(200).json(jobs);
        }

        // Get all available jobs and filter manually for better matching
        let baseQuery = {
            status: 'finding_workers',
            userId: { $ne: workerId }
        };

        // Add location filter if coordinates exist (within 100km)
        if (workerLocation && workerLocation.coordinates &&
            workerLocation.coordinates.length === 2 &&
            !Number.isNaN(workerLocation.coordinates[0]) &&
            !Number.isNaN(workerLocation.coordinates[1]) &&
            !(workerLocation.coordinates[0] === 0 && workerLocation.coordinates[1] === 0)) {

            baseQuery.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: workerLocation.coordinates
                    },
                    $maxDistance: 100000 // 100km
                }
            };
        }

        let jobs = await JobRequest.find(baseQuery).sort({ createdAt: -1 }).limit(50);

        // Filter jobs that match worker skills (improved matching)

        const matchingJobs = jobs.filter(job => {
            const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase().trim());
            return jobSkills.some(jobSkill => {
                const jobCategory = getSkillCategory(jobSkill);
                return workerSkills.some(workerSkill => {
                    // Direct match
                    if (jobSkill.includes(workerSkill) || workerSkill.includes(jobSkill)) {
                        return true;
                    }
                    // Category match
                    const workerCategory = getSkillCategory(workerSkill);
                    return jobCategory && workerCategory && jobCategory === workerCategory;
                });
            });
        });

        console.log(`✅ Found ${matchingJobs.length} jobs matching skills:`, workerSkills);

        // FALLBACK: If no jobs found nearby, show jobs matching skills without location filter
        if (matchingJobs.length === 0) {
            console.log("⚠️ No nearby jobs found. Fetching jobs by skill only...");
            const allJobs = await JobRequest.find({
                status: 'finding_workers',
                userId: { $ne: workerId }
            }).sort({ createdAt: -1 }).limit(50);

            const nationwideMatchingJobs = allJobs.filter(job => {
                const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase().trim());
                return jobSkills.some(jobSkill => {
                    const jobCategory = getSkillCategory(jobSkill);
                    return workerSkills.some(workerSkill => {
                        // Direct match
                        if (jobSkill.includes(workerSkill) || workerSkill.includes(jobSkill)) {
                            return true;
                        }
                        // Category match
                        const workerCategory = getSkillCategory(workerSkill);
                        return jobCategory && workerCategory && jobCategory === workerCategory;
                    });
                });
            });

            jobs = nationwideMatchingJobs.slice(0, 20);
            console.log(`✅ Found ${jobs.length} jobs by skill matching nationwide`);
        } else {
            jobs = matchingJobs.slice(0, 50);
        }

        res.status(200).json(jobs);
    } catch (error) {
        console.error("❌ Worker Feed Error:", error);
        res.status(500).json({ error: "Failed to fetch jobs", details: error.message });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId || userId === 'undefined' || userId === 'null') {
            return res.status(400).json({
                success: false,
                error: "Invalid user ID"
            });
        }

        // Find jobs where the userId matches
        // Fetch all relevant jobs for the user
        const activeJobs = await JobRequest.find({
            userId: userId,
            status: {
                $in: [
                    'finding_workers', 'bidding', 'finding', // Search phases
                    'assigned', 'hired', 'booked',          // Assigned phases
                    'scheduled', 'in_progress',            // Active phases
                    'completed', 'tracking'                 // Finished/Legacy phases
                ]
            }
        }).sort({ createdAt: -1 }); // Newest first

        // Add bids count to each job for display purposes
        const jobsWithBidsCount = activeJobs.map(job => {
            const bidsCount = job.bids ? job.bids.length : 0;
            console.log(`Job ${job._id} has ${bidsCount} bids`);
            return {
                ...job.toObject(),
                bidsCount
            };
        });

        res.status(200).json({
            success: true,
            count: activeJobs.length,
            jobs: jobsWithBidsCount
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
        const { jobId, workerId, bidAmount, message } = req.body;

        // Validation
        if (!jobId || !workerId || !bidAmount) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        // Get the Work profile to get the userId of the worker
        const workProfile = await Work.findById(workerId);
        if (!workProfile) {
            return res.status(404).json({ success: false, error: "Worker profile not found" });
        }

        // 1. Create standalone Bid document for worker dashboard visibility
        const Bid = require('../models/Bid');
        const standaloneBid = await Bid.create({
            job: jobId,
            worker: workProfile.userId, // Use the userId from Work profile
            amount: Number(bidAmount),
            message: message || '',
            status: 'pending'
        });

        console.log(`✅ Created standalone bid ${standaloneBid._id} for worker ${workProfile.userId}`);

        // 2. Also add to JobRequest bids array (for backward compatibility)
        const job = await JobRequest.findByIdAndUpdate(
            jobId,
            {
                $push: {
                    bids: {
                        workerId, // This is the ID from the 'Work' collection
                        bidAmount: Number(bidAmount),
                        message: message || '',
                        status: 'pending',
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!job) {
            // Rollback the standalone bid if job not found
            await Bid.findByIdAndDelete(standaloneBid._id);
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        // 3. Notify User about the new bid
        try {
            // Get job owner details
            const jobOwner = await User.findById(job.userId);
            const workerName = workProfile.name || 'A worker';
            const serviceName = job.serviceName || 'your service';
            
            if (jobOwner) {
                // Use the notification helper for better notification handling
                await notificationHelper.notifyBidSubmitted(job, workerName, bidAmount);
            }
        } catch (notifyError) {
            console.error('Error sending bid notification:', notifyError);
            // Don't fail the request if notification fails
        }

        res.status(200).json({
            success: true,
            job,
            bidId: standaloneBid._id
        });
    } catch (error) {
        console.error("Bid Error:", error);
        res.status(500).json({ success: false, error: "Failed to submit bid" });
    }
});

// GET BIDS (User side)
router.get('/:jobId/bids', async (req, res) => {
    try {
        const Bid = require('../models/Bid');
        const job = await JobRequest.findById(req.params.jobId)
            .populate({
                path: 'bids.workerId',
                model: 'Work', // Explicitly tell Mongoose which model to use
                select: 'name profilePic expertise skills rating location userId'
            });

        if (!job) return res.status(404).json({ error: "Job not found" });

        // Filter out any bids where the worker profile might have been deleted
        const validBids = job.bids.filter(bid => bid.workerId !== null);

        // Cross-reference with standalone Bid collection to get the correct _id
        // The hire endpoint uses Bid.findById(bidId), so we need the standalone Bid _id,
        // NOT the embedded subdocument _id from JobRequest.bids
        const enrichedBids = await Promise.all(validBids.map(async (bid) => {
            const bidObj = bid.toObject();
            try {
                // The standalone Bid stores worker as userId (workProfile.userId)
                const workerUserId = bid.workerId?.userId;
                if (workerUserId) {
                    const standaloneBid = await Bid.findOne({
                        job: req.params.jobId,
                        worker: workerUserId,
                        status: { $in: ['pending', 'hired', 'closed'] }
                    }).sort({ createdAt: -1 });

                    if (standaloneBid) {
                        bidObj.standaloneBidId = standaloneBid._id.toString();
                    }
                }
            } catch (e) {
                console.error('[GET BIDS] Error cross-referencing standalone bid:', e.message);
            }
            return bidObj;
        }));

        res.status(200).json(enrichedBids);
    } catch (error) {
        console.error('Failed to fetch bids:', error);
        res.status(500).json({ error: "Failed to fetch bids" });
    }
});

    // SUBMIT FEEDBACK (User -> Worker)
    router.post('/submit-feedback', async (req, res) => {
        try {
            const { jobId, workerProfileId, rating, message, userId } = req.body;

            if (!jobId || !workerProfileId || !rating) {
                return res.status(400).json({ success: false, error: 'Missing required fields' });
            }

            // Find worker profile (Work document)
            const workerProfile = await Work.findById(workerProfileId);
            if (!workerProfile) return res.status(404).json({ success: false, error: 'Worker profile not found' });

            // Append feedback
            workerProfile.feedbacks = workerProfile.feedbacks || [];
            workerProfile.feedbacks.push({ userId: userId || null, jobId, rating: Number(rating), message: message || '' });

            // Update aggregated rating
            const prevTotal = (workerProfile.averageRating || 0) * (workerProfile.ratingCount || 0);
            workerProfile.ratingCount = (workerProfile.ratingCount || 0) + 1;
            workerProfile.averageRating = (prevTotal + Number(rating)) / workerProfile.ratingCount;

            await workerProfile.save();

            res.status(200).json({ success: true, averageRating: workerProfile.averageRating, ratingCount: workerProfile.ratingCount });
        } catch (error) {
            console.error('Submit Feedback Error:', error);
            res.status(500).json({ success: false, error: 'Failed to submit feedback' });
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

        console.log('[ASSIGN WORKER] Request received:', { serviceName, serviceCategory, userId });

        if (!userLatitude || !userLongitude) {
            return res.status(400).json({ error: "User location is required" });
        }

        // Map service categories to relevant skills
        const categorySkillsMap = {
            'cleaning': ['cleaning', 'house cleaning', 'deep cleaning', 'bathroom cleaning', 'kitchen cleaning', 'sofa cleaning'],
            'plumbing': ['plumbing', 'pipe repair', 'leak detection', 'installation', 'tap', 'drain'],
            'electrical': ['electrical', 'wiring', 'repair', 'installation', 'fan', 'switchboard'],
            'painting': ['painting', 'wall painting', 'interior painting', 'exterior painting'],
            'salon': ['salon', 'haircut', 'beauty', 'styling', 'grooming', 'spa', 'massage', 'facial', 'hair styling', 'beard', 'barber'],
            'moving': ['moving', 'packing', 'lifting', 'transport'],
            'repair': ['repair', 'maintenance', 'handyman'],
            'gardening': ['gardening', 'lawn care', 'landscaping'],
            'carpentry': ['carpentry', 'wood work', 'furniture', 'polishing'],
            'appliance': ['appliance', 'ac', 'air conditioning', 'refrigerator', 'washing machine', 'ac repair', 'ac service', 'appliance repair', 'ac installation'],
            'pest': ['pest', 'pest control', 'cockroach', 'ant', 'termite', 'spider', 'bug', 'insect control'],
            'default': requiredSkills || []
        };

        // Get the normalized service category
        const normalizedCategory = serviceCategory?.toLowerCase().replace(/\s+/g, '');

        // Try different ways to match the category
        let searchSkills = categorySkillsMap[normalizedCategory] ||
            categorySkillsMap[serviceCategory?.toLowerCase()] ||
            categorySkillsMap['default'];

        // If still no skills found, try to extract from service name
        if (searchSkills === categorySkillsMap['default'] && requiredSkills && requiredSkills.length > 0) {
            searchSkills = requiredSkills.map(s => s.toLowerCase());
        }

        // Build query to find available workers with matching skills
        // Use flexible matching - workers with any of the required skills
        let workerQuery = {
            isAvailable: true,
            $or: [
                { skills: { $in: searchSkills.map(s => new RegExp(s, 'i')) } },
                // Also match if the skill contains the category name
                { skills: { $in: [new RegExp(serviceCategory, 'i')] } },
                // For salon services, also match barber skills
                ...(serviceCategory?.toLowerCase().includes('salon') || serviceCategory?.toLowerCase().includes('haircut') ?
                    [{ skills: { $in: [/barber/i, /hair/i, /styling/i] } }] : [])
            ],
            verificationStatus: 'verified' // Only show verified workers
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

        // If no workers found nearby with skills, expand search radius and relax requirements
        if (workers.length === 0 && userLatitude && userLongitude) {
            workers = await Work.find({
                isAvailable: true,
                $or: [
                    { skills: { $in: searchSkills.map(s => new RegExp(s, 'i')) } },
                    { skills: { $in: [/general/i, /handyman/i, /home/i] } }
                ],
                verificationStatus: 'verified'
            })
                .sort({ rating: -1 })
                .limit(20);
        }

        // Last resort: show any available workers nearby (regardless of verification)
        if (workers.length === 0 && userLatitude && userLongitude) {
            workers = await Work.find({
                isAvailable: true,
            })
                .sort({ rating: -1 })
                .limit(10);
        }

        // If still no workers found, return a more informative message
        if (workers.length === 0) {
            console.log('No workers found for:', { serviceCategory, searchSkills, userLatitude, userLongitude });
            return res.status(404).json({
                success: false,
                error: "No workers available",
                message: "No workers with matching skills are available in your area right now. Please try again later or try a different service.",
                debug: {
                    category: serviceCategory,
                    skillsSearched: searchSkills,
                    coordinates: userLatitude && userLongitude ? { lat: userLatitude, lng: userLongitude } : null
                }
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
        // Get the total amount from the request body (sent from frontend for predefined services)
        const totalAmountFromRequest = req.body.totalAmount || req.body.price || 0;

        console.log('[ASSIGN WORKER] Creating job with:', { 
            serviceName: serviceName, 
            serviceCategory: serviceCategory,
            budget: totalAmountFromRequest 
        });

        const jobRequest = await JobRequest.create({
            userId: userId,
            serviceName: serviceName || serviceCategory || 'Service',
            description: `${serviceName || serviceCategory || 'Service'} service booking`,
            budget: totalAmountFromRequest, // Use the total amount from frontend
            totalAmount: totalAmountFromRequest, // Store as totalAmount for easier access
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
            },
            // Save scheduling and address info from frontend
            scheduledDate: req.body.scheduledDate || '',
            scheduledTime: req.body.scheduledTime || '',
            address: req.body.address || '',
            fullAddress: req.body.fullAddress || req.body.address || ''
        });

        console.log('✅ Job created with serviceName:', jobRequest.serviceName, 'jobId:', jobRequest._id);

        // --- NOTIFY WORKER ---
        await sendPushNotification(
            bestWorker.userId, // Worker's User ID
            "🎉 You've been hired!",
            `New job for ${serviceName || 'Service'}: ₹${totalAmountFromRequest}`,
            { type: 'hired', jobId: jobRequest._id },
            'Work'
        );

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
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
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

// DEBUG ENDPOINT - Check skill matching for a specific worker
router.get('/debug/worker-jobs/:workerId', async (req, res) => {
    try {
        const { workerId } = req.params;
        
        // Get worker details
        const worker = await Work.findOne({ userId: workerId });
        if (!worker) {
            return res.status(404).json({ 
                success: false, 
                error: "Worker not found",
                workerId 
            });
        }

        const workerSkills = (worker.skills || []).map(s => s.toLowerCase().trim()).filter(s => s.length > 0);

        // Get all available jobs
        const allJobs = await JobRequest.find({
            status: 'finding_workers',
            userId: { $ne: workerId }
        });

        // Find matching jobs using improved logic
        const matchingJobs = allJobs.filter(job => {
            const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase().trim());
            return jobSkills.some(jobSkill => {
                const jobCategory = getSkillCategory(jobSkill);
                return workerSkills.some(workerSkill => {
                    // Direct match
                    if (jobSkill.includes(workerSkill) || workerSkill.includes(jobSkill)) {
                        return true;
                    }
                    // Category match
                    const workerCategory = getSkillCategory(workerSkill);
                    return jobCategory && workerCategory && jobCategory === workerCategory;
                });
            });
        });

        res.status(200).json({
            success: true,
            debug: {
                workerId,
                workerName: worker.name,
                workerSkills,
                totalJobsAvailable: allJobs.length,
                matchingJobsCount: matchingJobs.length,
                matchingJobs: matchingJobs.map(j => ({
                    _id: j._id,
                    description: j.description?.substring(0, 50) + '...',
                    skillsRequired: j.skillsRequired,
                    status: j.status,
                    createdAt: j.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Debug Error:', error);
        res.status(500).json({ error: "Failed to debug worker jobs", details: error.message });
    }
});

// DEBUG ENDPOINT - Check all posted jobs with their skills
router.get('/debug/jobs-status', async (req, res) => {
    try {
        const jobsByStatus = await JobRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    jobs: { $push: '$$ROOT' }
                }
            }
        ]);

        const summary = {};
        jobsByStatus.forEach(group => {
            summary[group._id] = {
                count: group.count,
                sampleJobs: group.jobs.slice(0, 3).map(j => ({
                    _id: j._id,
                    description: j.description?.substring(0, 50),
                    skillsRequired: j.skillsRequired,
                    createdAt: j.createdAt
                }))
            };
        });

        res.status(200).json({
            success: true,
            totalJobs: await JobRequest.countDocuments(),
            byStatus: summary
        });
    } catch (error) {
        console.error('Debug Error:', error);
        res.status(500).json({ error: "Failed to debug jobs", details: error.message });
    }
});

// // GET ASSIGNED JOBS FOR WORKER (with user details)
// router.get('/worker/:workerId/assigned-jobs', async (req, res) => {
//     try {
//         const { workerId } = req.params;

//         // Find jobs assigned to this worker and populate user details
//         const assignedJobs = await JobRequest.find({
//             'assignedWorker.workerId': workerId,
//             status: { $in: ['assigned', 'scheduled', 'in_progress'] }
//         })
//         .populate('userId', 'name phone email address fullAddress city state')
//         .sort({ createdAt: -1 });

//         // Transform jobs to include user details
//         const jobsWithUserDetails = assignedJobs.map(job => ({
//             ...job.toObject(),
//             userName: job.userId?.name || 'Customer',
//             userPhone: job.userId?.phone || '+91 00000 00000',
//             userEmail: job.userId?.email || '',
//             // Use job's address fields first, fallback to user's address
//             address: job.fullAddress || job.address || (job.userId?.fullAddress || job.userId?.address || '') || 'Address not available',
//             city: job.city || job.userId?.city || '',
//             state: job.state || job.userId?.state || '',
//             // Ensure scheduledDate and scheduledTime are always returned
//             scheduledDate: job.scheduledDate || '',
//             scheduledTime: job.scheduledTime || ''
//         }));

//         res.status(200).json({
//             success: true,
//             count: jobsWithUserDetails.length,
//             jobs: jobsWithUserDetails
//         });
//     } catch (error) {
//         console.error('Fetch Assigned Jobs Error:', error);
//         res.status(500).json({ error: "Failed to fetch assigned jobs" });
//     }
// });

// // ACCEPT JOB - Update status to in_progress
// router.put('/worker/:jobId/accept', async (req, res) => {
//     try {
//         const { jobId } = req.params;

//         const job = await JobRequest.findById(jobId);

//         if (!job) {
//             return res.status(404).json({ error: "Job not found" });
//         }

//         // Update status to in_progress
//         job.status = 'in_progress';
//         await job.save();

//         res.status(200).json({
//             success: true,
//             message: "Job accepted successfully",
//             job: {
//                 ...job.toObject(),
//                 userName: job.userId?.name || 'Customer',
//                 userPhone: job.userId?.phone || '+91 00000 00000',
//                 address: job.fullAddress || job.address || 'Address not available'
//             }
//         });
//     } catch (error) {
//         console.error('Accept Job Error:', error);
//         res.status(500).json({ error: "Failed to accept job" });
//     }
// });
// 1. GET ASSIGNED JOBS FOR WORKER (Updated to include 'completed' and 'hired')
router.get('/worker/:workerId/assigned-jobs', async (req, res) => {
    try {
        const { workerId } = req.params;

        // Find the Work profile to get the actual worker document ID
        const Work = require('../models/Work');
        const workerProfile = await Work.findOne({ userId: workerId });

        // Build query for both assigned workers AND hired workers
        const query = {
            $or: [
                // Jobs where worker was directly assigned
                {
                    'assignedWorker.workerId': workerProfile ? workerProfile._id : null,
                    status: { $in: ['assigned', 'scheduled', 'in_progress', 'completed'] }
                },
                // Jobs where worker was hired through bidding
                {
                    'hiredWorker.workerId': workerProfile ? workerProfile._id : null,
                    status: { $in: ['assigned', 'hired', 'booked', 'scheduled', 'in_progress', 'completed'] }
                }
            ]
        };

        const assignedJobs = await JobRequest.find(query)
            .populate('userId', 'name phone email address fullAddress city state')
            .sort({ updatedAt: -1 });

        const jobsWithUserDetails = assignedJobs.map(job => {
            const isHired = job.hiredWorker && job.hiredWorker.workerId;

            // Resolve address: trim so empty strings don't act as valid values
            const resolvedAddress =
                (job.fullAddress && job.fullAddress.trim()) ||
                (job.address && job.address.trim()) ||
                'Address not available';

            const jobObj = job.toObject();

            return {
                ...jobObj,
                userName: job.userId?.name || 'Customer',
                userPhone: job.userId?.phone || '+91 00000 00000',
                userEmail: job.userId?.email || '',
                address: resolvedAddress,
                city: job.city || '',
                state: job.state || '',
                scheduledDate: job.scheduledDate || '',
                scheduledTime: job.scheduledTime || '',
                // Explicitly pass media paths in case spread misses them
                imagePath: jobObj.imagePath || null,
                videoPath: jobObj.videoPath || null,
                audioPath: jobObj.audioPath || null,
                // Flag for hired-via-bid job
                isHiredJob: !!isHired,
                hiredAmount: isHired ? job.hiredWorker.bidAmount : null,
                workerStatus: isHired ? 'You are hired' : 'Assigned'
            };
        });

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

// GET WORKER PERFORMANCE STATS (dynamic count of completed jobs)
router.get('/worker/:workerId/stats', async (req, res) => {
    try {
        const { workerId } = req.params;
        const Work = require('../models/Work');
        
        // Find the Work profile
        const workerProfile = await Work.findOne({ userId: workerId });
        if (!workerProfile) {
            return res.status(404).json({ error: "Worker profile not found" });
        }

        // Count completed jobs (both assigned and hired)
        const completedCount = await JobRequest.countDocuments({
            status: 'completed',
            $or: [
                { 'assignedWorker.workerId': workerProfile._id },
                { 'hiredWorker.workerId': workerProfile._id }
            ]
        });

        // Get all jobs to calculate on-time percentage
        const allJobs = await JobRequest.find({
            status: 'completed',
            $or: [
                { 'assignedWorker.workerId': workerProfile._id },
                { 'hiredWorker.workerId': workerProfile._id }
            ]
        });

        // For now, assume 95% on-time (can be enhanced with completedAt vs scheduledTime comparison)
        const onTimePercentage = 95;

        console.log('[WORKER STATS]', { workerId, completedJobs: completedCount, workerProfileId: workerProfile._id });

        res.status(200).json({
            success: true,
            completedJobs: completedCount,
            onTimePercentage: onTimePercentage,
            averageRating: workerProfile.averageRating || 0,
            ratingCount: workerProfile.ratingCount || 0
        });
    } catch (error) {
        console.error('Worker Stats Error:', error);
        res.status(500).json({ error: "Failed to fetch worker stats" });
    }
});

// 2. ACCEPT JOB - Update status to SCHEDULED (On the Way)
router.put('/worker/:jobId/accept', async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await JobRequest.findByIdAndUpdate(
            jobId,
            { status: 'scheduled' }, // Changed from 'in_progress' to 'scheduled'
            { new: true }
        );
        if (!job) return res.status(404).json({ success: false, error: "Job not found" });

        // Notify User - Job Accepted
        if (job.userId) {
            const serviceName = job.serviceName || 'your service';
            const workerName = job.hiredWorker?.workerName || job.assignedWorker?.workerName || 'Your worker';
            const scheduledTime = job.scheduledTime || null;
            
            // Use notification helper
            await notificationHelper.notifyJobAccepted(job, workerName, scheduledTime);
            
            // Also notify that worker is on the way (since status is 'scheduled')
            await notificationHelper.notifyWorkerOnTheWay(job, workerName);
        }

        res.status(200).json({ success: true, message: "Job accepted successfully", job });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to accept job" });
    }
});

// 2.5 START JOB - Update status to IN_PROGRESS
router.put('/worker/:jobId/start', async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await JobRequest.findByIdAndUpdate(
            jobId,
            { status: 'in_progress' },
            { new: true }
        );

        if (!job) return res.status(404).json({ success: false, error: "Job not found" });

        // Notify User - Service Started
        if (job.userId) {
            const workerName = job.hiredWorker?.workerName || job.assignedWorker?.workerName || 'The worker';
            
            // Use notification helper
            await notificationHelper.notifyServiceStarted(job, workerName);
        }

        res.status(200).json({ success: true, message: "Job started successfully", job });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to start job" });
    }
});

// 3. NEW: COMPLETE JOB - Update status to completed
router.put('/worker/:jobId/complete', async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await JobRequest.findByIdAndUpdate(
            jobId,
            { status: 'completed' },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        // Increment completedJobs for the worker
        const workerId = job.assignedWorker?.workerId || job.hiredWorker?.workerId;
        if (workerId) {
            await Work.findOneAndUpdate(
                { userId: workerId },
                { $inc: { completedJobs: 1 } }
            );
        }

        // Notify User - Job Completed with rating prompt
        if (job.userId) {
            const workerName = job.hiredWorker?.workerName || job.assignedWorker?.workerName || 'The worker';
            
            // Use notification helper with rating prompt
            await notificationHelper.notifyJobCompleted(job, workerName);
        }

        res.status(200).json({
            success: true,
            message: "Job marked as completed successfully",
            job
        });
    } catch (error) {
        console.error('Complete Job Error:', error);
        res.status(500).json({ success: false, error: "Failed to complete job" });
    }
});

// 4. PAUSE JOB - Worker pauses the service
router.put('/worker/:jobId/pause', async (req, res) => {
    try {
        const { jobId } = req.params;
        const { reason } = req.body;
        
        const job = await JobRequest.findById(jobId);
        
        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        // Check if job is in progress
        if (job.status !== 'in_progress') {
            return res.status(400).json({ success: false, error: "Job is not in progress" });
        }

        // Update job to paused status
        job.status = 'paused';
        job.pauseReason = reason || null;
        job.pausedAt = new Date();
        await job.save();

        // Notify User - Service Paused
        if (job.userId) {
            const workerName = job.hiredWorker?.workerName || job.assignedWorker?.workerName || 'The worker';
            
            // Use notification helper
            await notificationHelper.notifyServicePaused(job, workerName, reason);
        }

        res.status(200).json({
            success: true,
            message: "Job paused successfully",
            job
        });
    } catch (error) {
        console.error('Pause Job Error:', error);
        res.status(500).json({ success: false, error: "Failed to pause job" });
    }
});

// 5. RESUME JOB - Worker resumes the service
router.put('/worker/:jobId/resume', async (req, res) => {
    try {
        const { jobId } = req.params;
        
        const job = await JobRequest.findById(jobId);
        
        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        // Check if job is paused
        if (job.status !== 'paused') {
            return res.status(400).json({ success: false, error: "Job is not paused" });
        }

        // Update job back to in_progress
        job.status = 'in_progress';
        job.resumedAt = new Date();
        await job.save();

        // Notify User - Service Resumed
        if (job.userId) {
            const workerName = job.hiredWorker?.workerName || job.assignedWorker?.workerName || 'The worker';
            
            // Use notification helper
            await notificationHelper.notifyServiceResumed(job, workerName);
        }

        res.status(200).json({
            success: true,
            message: "Job resumed successfully",
            job
        });
    } catch (error) {
        console.error('Resume Job Error:', error);
        res.status(500).json({ success: false, error: "Failed to resume job" });
    }
});

// 6. CANCEL JOB - Worker cancels the job
router.put('/worker/:jobId/cancel', async (req, res) => {
    try {
        const { jobId } = req.params;
        const { reason } = req.body;
        
        const job = await JobRequest.findById(jobId);
        
        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        // Check if job can be cancelled (not already completed)
        if (job.status === 'completed' || job.status === 'cancelled') {
            return res.status(400).json({ success: false, error: "Job cannot be cancelled" });
        }

        // Update job to cancelled status
        job.status = 'cancelled';
        job.cancellationReason = reason || null;
        job.cancelledAt = new Date();
        await job.save();

        // Notify User - Job Cancelled
        if (job.userId) {
            const workerName = job.hiredWorker?.workerName || job.assignedWorker?.workerName || 'The worker';
            
            // Use notification helper
            await notificationHelper.notifyJobCancelled(job, workerName, reason);
        }

        res.status(200).json({
            success: true,
            message: "Job cancelled successfully",
            job
        });
    } catch (error) {
        console.error('Cancel Job Error:', error);
        res.status(500).json({ success: false, error: "Failed to cancel job" });
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
router.get('/get-job/:jobId', async (req, res) => {
    try {
        const job = await JobRequest.findById(req.params.jobId);
        if (!job) return res.status(404).json({ success: false });
        // Sending a wrapper ensures the frontend "if" statement works
        res.status(200).json({ success: true, job: job });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// GET JOB STATUS - Check if job is available for hiring
router.get('/:jobId/status', async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await JobRequest.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                available: false,
                message: "Job not found"
            });
        }

        // Check if job is still available (not hired/booked)
        // IMPORTANT: Check if hiredWorker.workerId exists and is not undefined/null
        // Also check assignedWorker to ensure the job isn't directly assigned
        const hasHiredWorker = job.hiredWorker && job.hiredWorker.workerId && job.hiredWorker.workerId.toString().length > 0;
        const hasAssignedWorker = job.assignedWorker && job.assignedWorker.workerId && job.assignedWorker.workerId.toString().length > 0;
        const isAvailable = !hasHiredWorker &&
            !hasAssignedWorker &&
            job.status !== 'hired' &&
            job.status !== 'booked' &&
            job.status !== 'completed' &&
            job.status !== 'cancelled' &&
            job.status !== 'in_progress' &&
            job.status !== 'assigned';

        res.status(200).json({
            success: true,
            available: isAvailable,
            status: job.status,
            hiredWorker: job.hiredWorker && job.hiredWorker.workerId ? job.hiredWorker : null
        });
    } catch (error) {
        console.error('Job Status Check Error:', error);
        res.status(500).json({
            success: false,
            available: false,
            message: "Failed to check job status"
        });
    }
});

module.exports = router;