const mongoose = require('mongoose');
const Work = require('../models/Work');

const updateWorkProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID format" });
    }

    // Handle GPS
    if (updateData.latitude && updateData.longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [
          parseFloat(updateData.longitude),
          parseFloat(updateData.latitude)
        ]
      };
      delete updateData.latitude;
      delete updateData.longitude;
    }

    const updatedWork = await Work.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedWork
    });

  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getWorkProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID format" });
    }

    const profile = await Work.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getAllWorkers = async (req, res) => {
  try {
    const workers = await Work.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (error) {
    console.error("Fetch Workers Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch workers"
    });
  }
};


module.exports = { updateWorkProfile, getWorkProfile, getAllWorkers };
