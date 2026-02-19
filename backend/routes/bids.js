const express = require("express");
const router = express.Router();
const Bid = require("../models/Bid");
const JobRequest = require("../models/JobRequest");
const Work = require("../models/Work");
const User = require("../models/User");
const notificationRoutes = require("./notificationRoutes");

/**
 * Worker places a bid
 */
router.post("/", async (req, res) => {
  try {
    const { jobId, workerId, amount, message } = req.body;

    if (!jobId || !workerId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const bid = await Bid.create({
      job: jobId,
      worker: workerId,
      amount,
      message,
    });

    res.status(201).json(bid);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * User views bids for a job
 */
router.get("/job/:jobId", async (req, res) => {
  try {
    const bids = await Bid.find({ job: req.params.jobId })
      .populate("worker", "name email phone skills")
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * User accepts a bid
 */
router.put("/:bidId/accept", async (req, res) => {
  try {
    const bid = await Bid.findByIdAndUpdate(
      req.params.bidId,
      { status: "accepted" },
      { new: true }
    );

    res.json(bid);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * HIRE A WORKER FROM A BID
 * This endpoint handles the complete hiring flow:
 * 1. Updates the bid status to 'hired' in both JobRequest and standalone Bid
 * 2. Updates the job status to 'hired'/'booked'
 * 3. Closes all other bids for the same job
 * 4. Sends notification to the hired worker
 */
router.post("/:bidId/hire", async (req, res) => {
  try {
    const { bidId } = req.params;
    const { hirerId, jobId: bodyJobId } = req.body; // User who is hiring

    console.log(`[HIRE] Starting hire process for bidId: ${bidId}, hirerId: ${hirerId}`);

    // 1. Find the standalone Bid document first
    let standaloneBid = await Bid.findById(bidId).populate("job");

    if (!standaloneBid) {
      console.log(`[HIRE] Bid not found by bidId: ${bidId}. Trying fallback lookup by jobId...`);
      // FALLBACK: bidId might be an embedded subdocument _id, not a standalone Bid _id.
      // Try to find the most recent pending standalone Bid for the given jobId.
      if (bodyJobId) {
        standaloneBid = await Bid.findOne({
          job: bodyJobId,
          status: "pending"
        }).populate("job").sort({ createdAt: -1 });
        if (standaloneBid) {
          console.log(`[HIRE] Fallback found standalone bid: ${standaloneBid._id}`);
        }
      }
      if (!standaloneBid) {
        return res.status(404).json({ success: false, message: "Bid not found" });
      }
    }

    const job = await JobRequest.findById(standaloneBid.job._id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job associated with bid not found" });
    }

    // 2. Get worker details (standaloneBid.worker is the User ID in some implementations, need to verify)
    // In submit-bid: worker: workProfile.userId
    // So distinct lookup needed to get Work profile
    const workerUserId = standaloneBid.worker;
    const worker = await Work.findOne({ userId: workerUserId });

    if (!worker) {
      console.log(`[HIRE] Worker profile not found for userId: ${workerUserId}`);
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }

    // 3. Find the embedded bid in JobRequest using Work ID
    // Embedded bid uses workerId = Work._id
    const embeddedBid = job.bids.find(b => b.workerId && b.workerId.toString() === worker._id.toString());

    if (!embeddedBid) {
      console.log(`[HIRE] Corresponding embedded bid not found for worker: ${worker._id}`);
      // Only fail if strict consistency is required, otherwise we might proceed with just standalone/job update
      // For now, let's try to proceed by just updating job and standalone bid, 
      // but we won't be able to update specific embedded bid status if not found.
    }

    // 4. Check if job is already hired
    if (job.status === "assigned" || job.status === "hired" || job.status === "in_progress" || job.status === "completed") {
      // Check idempotency
      if (job.hiredWorker && job.hiredWorker.workerId && job.hiredWorker.workerId.toString() === worker._id.toString()) {
        return res.status(200).json({ success: true, message: "Worker already hired", job });
      }
      return res.status(400).json({ success: false, message: "Job already assigned to another worker" });
    }

    // 5. Update Job Requests' embedded bid status (if found)
    if (embeddedBid) {
      await JobRequest.updateOne(
        { _id: job._id, "bids._id": embeddedBid._id },
        { $set: { "bids.$.status": "hired" } }
      );
    }

    // 6. Update Standalone Bid
    standaloneBid.status = "hired";
    standaloneBid.hiredAt = new Date();
    standaloneBid.hiredBy = hirerId;
    await standaloneBid.save();

    // 7. Update Job Status & Hired Worker Info
    job.status = "assigned"; // "assigned" matches User App UI expectations
    job.hiredWorker = {
      workerId: worker._id,
      workerName: worker.name,
      workerProfilePic: worker.profilePic,
      bidId: standaloneBid._id, // Use standalone ID for reference
      bidAmount: standaloneBid.amount,
      hiredAt: new Date()
    };
    job.totalAmount = standaloneBid.amount;
    // Save scheduling info from checkout screen
    if (req.body.scheduledDate) job.scheduledDate = req.body.scheduledDate;
    if (req.body.scheduledTime) job.scheduledTime = req.body.scheduledTime;

    // Also set assignedWorker for backward compatibility with 'assigned' logic if needed
    job.assignedWorker = {
      workerId: worker._id,
      workerName: worker.name,
      workerProfilePic: worker.profilePic,
      assignedAt: new Date()
    };

    await job.save();

    // 8. Close other bids
    await Bid.updateMany(
      { job: job._id, _id: { $ne: standaloneBid._id }, status: "pending" },
      { status: "closed" }
    );
    // Update embedded bids
    if (embeddedBid) {
      await JobRequest.updateOne(
        { _id: job._id },
        { $set: { "bids.$[elem].status": "closed" } },
        { arrayFilters: [{ "elem._id": { $ne: embeddedBid._id } }] }
      );
    }

    // 9. Send Notification
    try {
      const toTitleCase = s => s.replace(/\b\w/g, c => c.toUpperCase());
      const jobName = job.serviceName?.trim()
        ? toTitleCase(job.serviceName)
        : job.skillsRequired?.[0]
          ? toTitleCase(job.skillsRequired[0])
          : job.description
            ? toTitleCase(job.description.trim().split(/\s+/).slice(0, 4).join(' '))
            : 'your service';
      await notificationRoutes.sendPushNotification(
        worker.userId.toString(),
        "🎉 You're Hired!",
        `You've been hired for ${jobName}. Bid amount: ₹${standaloneBid.amount}`,
        { type: "hired", jobId: job._id.toString() },
        'Work'
      );
    } catch (e) {
      console.error("Notification failed", e);
    }

    res.json({
      success: true,
      message: "Worker hired successfully",
      job
    });

  } catch (err) {
    console.error("[HIRE] Error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

/**
 * GET HIRED BIDS FOR A WORKER
 * Returns all bids where the worker was hired
 * Works with both userId and Work profile ID
 */
router.get("/hired/worker/:workerId", async (req, res) => {
  try {
    const { workerId } = req.params;

    // Find the Work profile - try both _id and userId
    const workProfile = await Work.findOne({
      $or: [
        { _id: workerId },
        { userId: workerId }
      ]
    });

    if (!workProfile) {
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }

    const queryUserId = workProfile.userId;
    const workId = workProfile._id;

    // Find all hired bids for this worker (using userId)
    let hiredBids = await Bid.find({
      worker: queryUserId,
      status: "hired"
    })
      .populate({
        path: "job",
        select: "serviceName description status scheduledDate scheduledTime address fullAddress location totalAmount userId",
        populate: {
          path: "userId",
          select: "name phone email"
        }
      })
      .sort({ hiredAt: -1 });

    // FALLBACK: Also check JobRequest embedded bids for hired status
    // This handles bids created before the fix was applied
    if (hiredBids.length === 0) {
      console.log(`[Hired Bids] No standalone bids found, checking JobRequest embedded bids for workId: ${workId}`);

      const jobsWithHiredBids = await JobRequest.find({
        "bids.workerId": workId,
        "bids.status": "hired"
      })
        .populate({
          path: "userId",
          select: "name phone email"
        })
        .sort({ updatedAt: -1 });

      // Convert embedded bids to Bid-like format
      for (const job of jobsWithHiredBids) {
        const embeddedBid = job.bids.find(b => b.workerId.toString() === workId.toString() && b.status === 'hired');
        if (embeddedBid) {
          hiredBids.push({
            _id: embeddedBid._id,
            job: {
              _id: job._id,
              serviceName: job.serviceName,
              description: job.description,
              status: job.status,
              scheduledDate: job.scheduledDate,
              scheduledTime: job.scheduledTime,
              address: job.address,
              fullAddress: job.fullAddress,
              location: job.location,
              totalAmount: job.totalAmount,
              userId: job.userId
            },
            amount: embeddedBid.bidAmount,
            message: embeddedBid.message,
            status: embeddedBid.status,
            createdAt: embeddedBid.createdAt,
            hiredAt: job.hiredWorker?.hiredAt || job.updatedAt
          });
        }
      }
    }

    res.json({
      success: true,
      count: hiredBids.length,
      bids: hiredBids
    });
  } catch (err) {
    console.error("Fetch Hired Bids Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET ACTIVE BIDS FOR A WORKER (excluding hired/closed)
 * For the worker's dashboard/proposals page
 * Works with both userId and Work profile ID
 */
router.get("/active/worker/:workerId", async (req, res) => {
  try {
    const { workerId } = req.params;

    // First, try to find the Work profile to get the userId
    const workProfile = await Work.findOne({
      $or: [
        { _id: workerId },
        { userId: workerId }
      ]
    });

    let queryUserId = workerId;
    let workId = workerId;

    if (workProfile) {
      queryUserId = workProfile.userId; // Use the actual userId for Bid queries
      workId = workProfile._id;
    }

    // Find all pending bids for this worker (using userId)
    let activeBids = await Bid.find({
      worker: queryUserId,
      status: "pending"
    })
      .populate({
        path: "job",
        match: { status: { $nin: ["hired", "booked", "completed", "cancelled"] } },
        select: "serviceName description status budget location scheduledDate scheduledTime address fullAddress"
      })
      .sort({ createdAt: -1 });

    // Filter out bids where job was null (already hired by someone else)
    let validBids = activeBids.filter(bid => bid.job !== null);

    // FALLBACK: Also check JobRequest embedded bids for this worker
    // This handles bids created before the fix was applied
    if (validBids.length === 0) {
      console.log(`[Active Bids] No standalone bids found, checking JobRequest embedded bids for workId: ${workId}`);

      const jobsWithBids = await JobRequest.find({
        status: { $nin: ["hired", "booked", "completed", "cancelled"] },
        "bids.workerId": workId,
        "bids.status": "pending"
      }).sort({ createdAt: -1 });

      // Convert embedded bids to Bid-like format
      for (const job of jobsWithBids) {
        const embeddedBid = job.bids.find(b => b.workerId.toString() === workId.toString() && b.status === 'pending');
        if (embeddedBid) {
          validBids.push({
            _id: embeddedBid._id,
            job: {
              _id: job._id,
              serviceName: job.serviceName,
              description: job.description,
              status: job.status,
              budget: job.budget,
              location: job.location,
              scheduledDate: job.scheduledDate,
              scheduledTime: job.scheduledTime,
              address: job.address,
              fullAddress: job.fullAddress
            },
            amount: embeddedBid.bidAmount,
            message: embeddedBid.message,
            status: embeddedBid.status,
            createdAt: embeddedBid.createdAt
          });
        }
      }
    }

    res.json({
      success: true,
      count: validBids.length,
      bids: validBids
    });
  } catch (err) {
    console.error("Fetch Active Bids Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET CLOSED BIDS FOR A WORKER
 * Returns all bids that were closed (job assigned to another worker)
 * Works with both userId and Work profile ID
 */
router.get("/closed/worker/:workerId", async (req, res) => {
  try {
    const { workerId } = req.params;

    // Find the Work profile - try both _id and userId
    const workProfile = await Work.findOne({
      $or: [
        { _id: workerId },
        { userId: workerId }
      ]
    });

    let queryUserId = workerId;
    let workId = workerId;

    if (workProfile) {
      queryUserId = workProfile.userId;
      workId = workProfile._id;
    }

    // Find all closed bids for this worker (using userId)
    let closedBids = await Bid.find({
      worker: queryUserId,
      status: "closed"
    })
      .populate({
        path: "job",
        select: "serviceName description status budget location scheduledDate scheduledTime address fullAddress"
      })
      .sort({ updatedAt: -1 });

    // FALLBACK: Also check JobRequest embedded bids for closed status
    // This handles bids created before the fix was applied
    if (closedBids.length === 0) {
      console.log(`[Closed Bids] No standalone bids found, checking JobRequest embedded bids for workId: ${workId}`);

      const jobsWithClosedBids = await JobRequest.find({
        "bids.workerId": workId,
        "bids.status": "closed"
      }).sort({ updatedAt: -1 });

      // Convert embedded bids to Bid-like format
      for (const job of jobsWithClosedBids) {
        const embeddedBid = job.bids.find(b => b.workerId.toString() === workId.toString() && b.status === 'closed');
        if (embeddedBid) {
          closedBids.push({
            _id: embeddedBid._id,
            job: {
              _id: job._id,
              serviceName: job.serviceName,
              description: job.description,
              status: job.status,
              budget: job.budget,
              location: job.location,
              scheduledDate: job.scheduledDate,
              scheduledTime: job.scheduledTime,
              address: job.address,
              fullAddress: job.fullAddress
            },
            amount: embeddedBid.bidAmount,
            message: embeddedBid.message,
            status: embeddedBid.status,
            createdAt: embeddedBid.createdAt
          });
        }
      }
    }

    res.json({
      success: true,
      count: closedBids.length,
      bids: closedBids
    });
  } catch (err) {
    console.error("Fetch Closed Bids Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
