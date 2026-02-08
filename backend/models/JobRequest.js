const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    serviceName: String,
    description: String,
    budget: Number,
    skillsRequired: [String],

    imagePath: String,
    videoPath: String,
    audioPath: String,
    bids: [{
      workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Work' },
      bidAmount: Number,
      message: String,
      createdAt: { type: Date, default: Date.now }
    }],

    // Assigned worker for direct booking
    assignedWorker: {
      workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Work' },
      workerName: String,
      workerProfilePic: String,
      assignedAt: { type: Date, default: Date.now }
    },

    status: {
      type: String,
      enum: ['finding_workers', 'bidding', 'assigned', 'scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'finding_workers'
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },

    // Service address
    address: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    fullAddress: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// ✅ REQUIRED
jobRequestSchema.index({ location: '2dsphere' });

module.exports =
  mongoose.models.JobRequest ||
  mongoose.model('JobRequest', jobRequestSchema);
