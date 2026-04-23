const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { sendPushNotification } = require('./notificationRoutes');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to generate unique conversation ID
const generateConversationId = (userId, workerId) => {
    return [userId, workerId].sort().join('_');
};

// AI Chat with Gemini
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not configured');
            return res.status(500).json({ error: 'AI service is not configured. Please contact support.' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Try multiple models in order of preference
        const modelsToTry = ['gemini-2.5-flash', 'gemini-3.1-flash', 'gemini-2.5-pro'];

        let text = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });

                const prompt = `You are a helpful assistant for service users.
Give short, clear, step-by-step solutions.
Focus on fixing issues and using devices.
Keep answers simple and practical.

If a helpful YouTube tutorial exists, include 1 relevant video suggestion at the end.
If not sure, do NOT mention YouTube.

User: ${message}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();

                if (text && text.trim() !== '') {
                    break; // Successfully got a response
                }
            } catch (modelError) {
                lastError = modelError;
                console.warn(`Model ${modelName} failed:`, modelError.message);
                continue; // Try next model
            }
        }

        if (!text || text.trim() === '') {
            // If all models failed, provide a fallback response
            const fallbackResponses = [
                "I'm here to help! For quick solutions to common device issues, try restarting your device or checking your connections. For more specific help, please provide more details about your problem.",
                "I can assist you with troubleshooting common issues. Please describe your problem in more detail, and I'll provide step-by-step guidance.",
                "Let's solve this together! Could you tell me more about what's not working? I'm here to provide practical solutions for your device or service questions."
            ];
            text = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }

        res.json({ reply: text });
    } catch (error) {
        console.error('Error with AI chat:', error.message || error);

        // Provide helpful fallback responses instead of technical error messages
        const fallbackResponses = [
            "I'm here to help! For quick solutions to common device issues, try restarting your device or checking your connections. For more specific help, please provide more details about your problem.",
            "I can assist you with troubleshooting common issues. Please describe your problem in more detail, and I'll provide step-by-step guidance.",
            "Let's solve this together! Could you tell me more about what's not working? I'm here to provide practical solutions for your device or service questions."
        ];

        res.json({
            reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
        });
    }
});

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
