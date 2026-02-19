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
      status: { type: String, enum: ['pending', 'hired', 'closed'], default: 'pending' },
      createdAt: { type: Date, default: Date.now }
    }],

    // Assigned worker for direct booking
    assignedWorker: {
      workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Work' },
      workerName: String,
      workerProfilePic: String,
      assignedAt: { type: Date, default: Date.now }
    },

    // Hired worker from bid (for bidding workflow)
    hiredWorker: {
      workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Work', default: undefined },
      workerName: { type: String, default: undefined },
      workerProfilePic: { type: String, default: undefined },
      bidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', default: undefined },
      bidAmount: { type: Number, default: undefined },
      hiredAt: { type: Date, default: undefined }
    },

    status: {
      type: String,
      enum: ['finding_workers', 'bidding', 'assigned', 'scheduled', 'in_progress', 'completed', 'cancelled', 'booked', 'hired'],
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
    },

    // Scheduling info
    scheduledDate: {
      type: String,
      default: ''
    },
    scheduledTime: {
      type: String,
      default: ''
    },

    // Payment info
    paymentMethod: {
      type: String,
      default: ''
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    paidAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// REQUIRED
jobRequestSchema.index({ location: '2dsphere' });

module.exports =
  mongoose.models.JobRequest ||
  mongoose.model('JobRequest', jobRequestSchema);
