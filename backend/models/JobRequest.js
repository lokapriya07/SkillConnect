const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    description: String,
    budget: Number,
    skillsRequired: [String],

    imagePath: String,
    videoPath: String,
    audioPath: String,

    status: {
      type: String,
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
    }
  },
  { timestamps: true }
);

// ✅ REQUIRED
jobRequestSchema.index({ location: '2dsphere' });

module.exports =
  mongoose.models.JobRequest ||
  mongoose.model('JobRequest', jobRequestSchema);
