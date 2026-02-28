const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification'); // Import the new model

// Import notification helper to share push token storage
const notificationHelper = require('../utils/notificationHelper');

// --- 1. REGISTER PUSH TOKEN ---
router.post('/register', async (req, res) => {
    try {
        const { userId, userType, expoPushToken } = req.body;

        if (!userId || !expoPushToken) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Use notification helper to register token
        notificationHelper.registerPushToken(userId, userType, expoPushToken);

        res.json({ success: true, message: 'Token registered successfully' });
    } catch (error) {
        console.error('Error registering push token:', error);
        res.status(500).json({ success: false, error: 'Failed to register token' });
    }
});

// --- 2. UNREGISTER PUSH TOKEN ---
router.post('/unregister', async (req, res) => {
    try {
        const { userId } = req.body;
        notificationHelper.unregisterPushToken(userId);
        res.json({ success: true, message: 'Token unregistered successfully' });
    } catch (error) {
        console.error('Error unregistering push token:', error);
        res.status(500).json({ success: false, error: 'Failed to unregister token' });
    }
});

// --- 3. GET NOTIFICATIONS (Persistent) ---
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50

        res.json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

// --- 4. MARK AS READ ---
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        console.error('Error reading notification:', error);
        res.status(500).json({ success: false, error: 'Failed to mark as read' });
    }
});

// --- HELPER: CREATE & SEND NOTIFICATION ---
// This function is kept for backward compatibility but uses the notification helper internally
async function sendPushNotification(userId, title, body, data = {}, userModel = 'User') {
    // Use notification helper which handles both DB storage and push
    return await notificationHelper.sendNotification(
        userId,
        title,
        body,
        data,
        userModel,
        data.jobId || null
    );
}

router.sendPushNotification = sendPushNotification;
module.exports = router;
