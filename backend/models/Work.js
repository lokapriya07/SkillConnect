const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  title: String,
  bio: String,
  address: String,
  city: String,
  state: String,
  zip: String,
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

module.exports = mongoose.model('Work', workSchema);