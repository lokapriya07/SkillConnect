const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification'); // Import the new model

// In-memory store for push tokens (use database in production)
let pushTokens = [];

// --- 1. REGISTER PUSH TOKEN ---
router.post('/register', async (req, res) => {
    try {
        const { userId, userType, expoPushToken } = req.body;

        if (!userId || !expoPushToken) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Remove existing token for same user
        pushTokens = pushTokens.filter(t => t.userId !== userId);

        // Add new token
        pushTokens.push({
            userId,
            userType,
            expoPushToken,
            createdAt: new Date()
        });

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
        pushTokens = pushTokens.filter(t => t.userId !== userId);
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
async function sendPushNotification(userId, title, body, data = {}, userModel = 'User') {
    // 1. Save to Database
    try {
        await Notification.create({
            userId,
            userModel, // 'User' or 'Work'
            type: data.type || 'system',
            title,
            message: body,
            relatedId: data.jobId || null
        });
    } catch (dbError) {
        console.error('Error saving notification to DB:', dbError);
        // Continue to send push even if DB save fails
    }

    // 2. Send Push Notification (if token exists)
    const userToken = pushTokens.find(t => t.userId === userId);

    if (!userToken) {
        console.log(`No push token found for user: ${userId}`);
        return false;
    }

    const message = {
        to: userToken.expoPushToken,
        sound: 'default',
        title,
        body,
        data: {
            ...data,
            channelId: 'chat-messages'
        },
        ios: {
            sound: true,
            badge: true
        },
        android: {
            sound: true,
            priority: 'high',
            channelId: 'chat-messages'
        }
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();
        console.log('Push notification sent:', result);
        return true;
    } catch (error) {
        console.error('Error sending push notification:', error);
        return false;
    }
}

router.sendPushNotification = sendPushNotification;
module.exports = router;
