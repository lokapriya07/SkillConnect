const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel' // Dynamic reference based on user type
    },
    userModel: {
        type: String,
        required: true,
        enum: ['User', 'Work'] // Refers to the User or Work model
    },
    type: {
        type: String,
        required: true,
        enum: ['hired', 'status_update', 'system', 'payment']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // Could be JobId, PaymentId, etc.
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
