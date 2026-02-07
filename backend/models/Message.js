const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRequest', required: true },
    sender: { type: String, required: true }, // The ID of person sending (User or Worker)
    receiver: { type: String, required: true }, // The ID of person receiving
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);