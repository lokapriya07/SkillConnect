const express = require('express');
const router = express.Router();

// In-memory store for push tokens (use database in production)
let pushTokens = [];

// Register device push token
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

// Unregister push token
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

// Send push notification to a user
async function sendPushNotification(userId, title, body, data = {}) {
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
