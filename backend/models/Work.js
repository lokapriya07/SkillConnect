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
  aadhaarLastFour: String,

  // Feedbacks and rating aggregation
  feedbacks: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRequest' },
    rating: Number,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  onTimePercentage: { type: Number, default: 100 },

  // 🔥 REQUIRED for location-based matching
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
}, { timestamps: true });

// 🔥 Geo index (VERY IMPORTANT)
workSchema.index({ location: '2dsphere' });

module.exports = mongoose.models.Work || mongoose.model('Work', workSchema);
