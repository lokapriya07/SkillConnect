const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    senderId: {
        type: String,
        required: true
    },
    senderType: {
        type: String,
        enum: ['user', 'worker'],
        required: true
    },
    receiverId: {
        type: String,
        required: true
    },
    receiverType: {
        type: String,
        enum: ['user', 'worker'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'audio', 'video'],
        default: 'text'
    },
    delivered: {
        type: Boolean,
        default: false  // Single tick - delivered to server
    },
    read: {
        type: Boolean,
        default: false  // Double tick - read by receiver
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
