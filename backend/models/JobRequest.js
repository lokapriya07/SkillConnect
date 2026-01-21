const mongoose = require('mongoose');

const JobRequestSchema = new mongoose.Schema({
    description: { type: String, required: true },
    budget: { type: String, required: true },
    imagePath: { type: String }, 
    videoPath: { type: String }, 
    audioPath: { type: String }, 
    status: { type: String, default: "finding_workers" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobRequest', JobRequestSchema);