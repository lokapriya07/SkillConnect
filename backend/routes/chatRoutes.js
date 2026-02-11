const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { sendPushNotification } = require('./notificationRoutes');

// Helper to generate unique conversation ID
const generateConversationId = (userId, workerId) => {
    return [userId, workerId].sort().join('_');
};

// Send a message
router.post('/send', async (req, res) => {
    try {
        const { conversationId, senderId, senderType, receiverId, receiverType, message, messageType, senderName } = req.body;

        const newMessage = new Message({
            conversationId: conversationId || generateConversationId(senderId, receiverId),
            senderId,
            senderType,
            receiverId,
            receiverType,
            message,
            messageType: messageType || 'text',
            delivered: true  // Message is delivered to server when created
        });

        const savedMessage = await newMessage.save();

        // Send push notification to receiver
        const notificationTitle = senderType === 'worker' ? 'New message from worker' : 'New message from user';
        const notificationBody = message.length > 50 ? message.substring(0, 50) + '...' : message;
        
        await sendPushNotification(receiverId, notificationTitle, notificationBody, {
            conversationId: savedMessage.conversationId,
            senderId,
            senderType,
            senderName: senderName || 'Someone',
            messageId: savedMessage._id.toString()
        });

        res.status(201).json({ success: true, message: savedMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

// Get messages for a conversation
router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit));

        res.json({ success: true, messages: messages.reverse() });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});

// Get all conversations for a user/worker
router.get('/conversations/:id/:type', async (req, res) => {
    try {
        const { id, type } = req.params;

        // Get unique conversation IDs where the user/worker is a participant
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: id, senderType: type },
                        { receiverId: id, receiverType: type }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$conversationId',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$receiverId', id] }, { $eq: ['$receiverType', type] }, { $eq: ['$read', false] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        res.json({ success: true, conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
    }
});

// Mark messages as delivered (when receiver opens chat)
router.put('/delivered/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId, userType } = req.body;

        // Mark all messages from the other user as delivered
        await Message.updateMany(
            { 
                conversationId, 
                receiverId: userId, 
                receiverType: userType, 
                delivered: false 
            },
            { $set: { delivered: true } }
        );

        res.json({ success: true, message: 'Messages marked as delivered' });
    } catch (error) {
        console.error('Error marking messages as delivered:', error);
        res.status(500).json({ success: false, error: 'Failed to mark messages as delivered' });
    }
});

// Mark messages as read
router.put('/read/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId, userType } = req.body;

        await Message.updateMany(
            { conversationId, receiverId: userId, receiverType: userType, read: false },
            { $set: { read: true, delivered: true } }
        );

        res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
    }
});

module.exports = router;
