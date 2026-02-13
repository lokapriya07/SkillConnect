const express = require("express");
const router = express.Router();
const Bid = require("../models/Bid");

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

module.exports = router;
