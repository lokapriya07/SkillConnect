const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  title: String,
  bio: String,
  address: String,
  city: String,
  state: String,
  hourlyRate: Number,
  minHours: Number,
  startTime: String,
  endTime: String,
  isAvailable: { type: Boolean, default: true },
  skills: [String],
  languages: [String],
  workingDays: [String],
  verificationStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'assigned', 'verified'],
    default: 'not_submitted'
  },
  experience: Number,
  aadhaarLastFour: String
}, { timestamps: true });

// Check if model exists before defining to avoid OverwriteModelError
const Work = mongoose.models.Work || mongoose.model('Work', workSchema);

const updateWorkProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid User ID format" });
    }

    const updatedWork = await Work.findOneAndUpdate(
      { userId: userId },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedWork });
  } catch (error) {
    console.error("Save Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { Work, updateWorkProfile };