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
    const { jobId, hirerId } = req.body; // User who is hiring

    console.log(`[HIRE] Starting hire process for bidId: ${bidId}, jobId: ${jobId}, hirerId: ${hirerId}`);

    // 1. Get the job and find the bid within its bids array
    let job;
    let bid;
    let standaloneBid = null;
    
    if (jobId) {
      // If jobId is provided, look for the bid in the job's bids array
      job = await JobRequest.findById(jobId);
      if (!job) {
        console.log(`[HIRE] Job not found: ${jobId}`);
        return res.status(404).json({ success: false, message: "Job not found" });
      }
      
      console.log(`[HIRE] Found job, checking bids. Total bids: ${job.bids.length}`);
      
      // Find the bid within the job's bids subdocument array
      bid = job.bids.find(b => b._id.toString() === bidId);
      if (!bid) {
        console.log(`[HIRE] Bid ${bidId} not found in job bids`);
        console.log(`[HIRE] Available bid IDs:`, job.bids.map(b => b._id.toString()));
        return res.status(404).json({ success: false, message: "Bid not found in job" });
      }
      
      console.log(`[HIRE] Found bid in job, worker: ${bid.workerId}, amount: ${bid.bidAmount}`);
    } else {
      // Fallback: try to find as standalone Bid document
      standaloneBid = await Bid.findById(bidId).populate("job");
      if (!standaloneBid) {
        console.log(`[HIRE] Bid not found as standalone document: ${bidId}`);
        return res.status(404).json({ success: false, message: "Bid not found" });
      }
      job = standaloneBid.job;
    }

    // 2. Check if job is already hired/booked/assigned
    // Only block if status is hired/booked/completed/cancelled, or hiredWorker.workerId is set
      if (
        job.status === "hired" ||
        job.status === "booked" ||
        job.status === "completed" ||
        job.status === "cancelled" ||
        (job.hiredWorker && job.hiredWorker.workerId)
      ) {
        console.log(`[HIRE] Job already assigned: status=${job.status}, hiredWorker=${job.hiredWorker ? JSON.stringify(job.hiredWorker) : 'null'}`);
        return res.status(400).json({ 
        success: false, 
        message: "This job has already been assigned to another worker" 
        });
      }

    // 3. Get worker details from Work model
    const worker = await Work.findById(bid.workerId);
    if (!worker) {
      console.log(`[HIRE] Worker profile not found for workerId: ${bid.workerId}`);
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }

    console.log(`[HIRE] Found worker: ${worker.name}`);

    // 4. Get hirer (user) details
    const hirer = await User.findById(hirerId);

    // 5. Update the hired bid status in the job's bids array
    bid.status = "hired";
    const updateResult = await JobRequest.updateOne(
      { _id: job._id, "bids._id": bid._id },
      { $set: { "bids.$.status": "hired" } }
    );
    console.log(`[HIRE] Updated bid status in JobRequest, result:`, updateResult.modifiedCount);

    // 5b. Also update the standalone Bid document if it exists
    if (standaloneBid) {
      standaloneBid.status = "hired";
      standaloneBid.hiredAt = new Date();
      standaloneBid.hiredBy = hirerId;
      await standaloneBid.save();
      console.log(`[HIRE] Updated standalone bid status`);
    } else {
      // Try to find and update the standalone bid by job and worker
      const updatedStandaloneBid = await Bid.findOneAndUpdate(
        { job: job._id, worker: worker.userId },
        { status: "hired", hiredAt: new Date(), hiredBy: hirerId },
        { new: true }
      );
      if (updatedStandaloneBid) {
        console.log(`[HIRE] Updated standalone bid ${updatedStandaloneBid._id}`);
      } else {
        console.log(`[HIRE] No standalone bid found to update`);
      }
    }

    // 6. Update the job with hired worker info and status
    job.hiredWorker = {
      workerId: worker._id,
      workerName: worker.name,
      workerProfilePic: worker.profilePic,
      bidId: bid._id,
      bidAmount: bid.bidAmount,
      hiredAt: new Date()
    };
    job.status = "hired";
    job.totalAmount = bid.bidAmount;
    await job.save();
    
    console.log(`[HIRE] Updated job status to hired`);

    // 7. Close all other bids for this job in JobRequest
    const closeResult = await JobRequest.updateOne(
      { _id: job._id },
      { 
        $set: { 
          "bids.$[elem].status": "closed" 
        } 
      },
      { 
        arrayFilters: [ { "elem._id": { $ne: bid._id } } ] 
      }
    );
    console.log(`[HIRE] Closed other bids in JobRequest, result:`, closeResult.modifiedCount);

    // 7b. Close all other standalone bids for this job
    const closeStandaloneResult = await Bid.updateMany(
      { job: job._id, _id: { $ne: standaloneBid?._id }, status: "pending" },
      { status: "closed" }
    );
    console.log(`[HIRE] Closed other standalone bids, result:`, closeStandaloneResult.modifiedCount);

    // 8. Send notification to the hired worker
    try {
      await notificationRoutes.sendPushNotification(
        worker.userId.toString(),
        "You're Hired! Congratulations!",
        `You have been hired for "${job.serviceName || job.description || 'a job'}" by ${hirer?.name || 'a client'}. Check your Jobs page for details.`,
        {
          type: "hired",
          jobId: job._id.toString(),
          bidId: bid._id.toString()
        }
      );
      console.log(`[HIRE] Notification sent to worker`);
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
      // Don't fail the request if notification fails
    }

    // 9. Return success response
    console.log(`[HIRE] Hire process completed successfully`);
    res.json({
      success: true,
      message: "Worker hired successfully",
      job: {
        _id: job._id,
        status: job.status,
        hiredWorker: job.hiredWorker
      },
      bid: {
        _id: bid._id,
        status: bid.status
      }
    });

  } catch (err) {
    console.error("[HIRE] Error:", err);
    res.status(500).json({ success: false, message: "Server error during hiring: " + err.message });
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
