const mongoose = require('mongoose');
const Work = require('../models/Work');

const updateWorkProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID format" });
    }
    if (updateData.skills && Array.isArray(updateData.skills)) {
      updateData.skills = updateData.skills.map(s => s.toLowerCase().trim());
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
      return res.status(200).json({ // Return 200 instead of 404 for new workers
        success: true,
        data: { completionPercentage: 0, name: "New Worker" }
      });
    }

    // --- NEW: CALCULATION LOGIC ---
    const fields = ['name', 'bio', 'skills', 'address', 'hourlyRate', 'location'];
    let filledFields = 0;

    fields.forEach(field => {
      if (profile[field] && (Array.isArray(profile[field]) ? profile[field].length > 0 : true)) {
        filledFields++;
      }
    });

    const completionPercentage = Math.round((filledFields / fields.length) * 100);

    res.status(200).json({
      success: true,
      data: {
        ...profile._doc,
        completionPercentage // Send this to the frontend
      }
    });
  } catch (error) {
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
