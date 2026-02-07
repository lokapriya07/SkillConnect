
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const path = require('path'); 
// // const fs = require('fs');    
// // require('dotenv').config();

// // const app = express();

// // // Middleware
// // app.use(express.json());
// // app.use(cors());

// // // 1. ENSURE UPLOADS FOLDER EXISTS
// // const uploadDir = path.join(__dirname, 'uploads');
// // if (!fs.existsSync(uploadDir)) {
// //     fs.mkdirSync(uploadDir);
// // }

// // // 2. SERVE STATIC FILES
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // // 3. MONGODB CONNECTION
// // mongoose.connect(process.env.MONGO_URI)
// //     .then(() => console.log("🚀 Connected to MongoDB Atlas: skillconnect database"))
// //     .catch(err => console.error("❌ MongoDB Connection Error:", err));

// // // 4. ROUTES
// // app.use('/api/auth', require('./routes/auth'));
// // app.use('/api/jobs', require('./routes/jobRoutes')); 

// // // ADDED: Work route for profile storage
// // app.use('/api/work', require('./routes/workRoutes')); 

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, '0.0.0.0', () => {
// //     console.log(`Server running on http://192.168.0.4:${PORT}`);
// // });

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');
// const bodyParser = require("body-parser");
// const twilio = require("twilio");
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json());

// // 1. ENSURE UPLOADS FOLDER EXISTS
// // This folder stores images, videos, and audio notes for AI processing
// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }

// // 2. SERVE STATIC FILES
// // Critical: This allows the mobile app to play audio/video via URL
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // 3. MONGODB CONNECTION
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log("🚀 Connected to MongoDB Atlas: skillconnect database"))
//     .catch(err => console.error("❌ MongoDB Connection Error:", err));

// // 4. ROUTES
// app.use('/api/auth', require('./routes/auth'));

// // Updated: Job Routes handle AI extraction and matching logic
// app.use('/api/jobs', require('./routes/jobRoutes'));

// // Work Routes handle worker profiles and skill management
// app.use('/api/work', require('./routes/workRoutes'));
// app.use('/api/otp', require('./routes/otp'));

// // 5. ERROR HANDLING MIDDLEWARE
// app.use((err, req, res, next) => {
//     console.error("❌ Global Server Error:", err.stack);
//     res.status(500).json({ error: "Internal Server Error" });
// });



// const PORT = process.env.PORT || 5000;
// // Use '0.0.0.0' to ensure your Expo app can connect over local Wi-Fi
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`✅ Server running on http://192.168.0.9:${PORT}`);
// });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require("body-parser");
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io'); // Required for Socket.io
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Allows connection from your Expo apps
        methods: ["GET", "POST"]
    }
});

// Import Message Model (Make sure you created models/Message.js)
const Message = require('./models/Message');

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// 1. ENSURE UPLOADS FOLDER EXISTS
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. SERVE STATIC FILES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 Connected to MongoDB Atlas: skillconnect database"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 4. SOCKET.IO LOGIC
const onlineUsers = new Map(); // Stores { userId: socketId }

io.on('connection', (socket) => {
    console.log(`📡 New Socket Connection: ${socket.id}`);

    // Register user when they open the app
    socket.on('register', (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`👤 User registered: ${userId}`);
    });

    // Handle Sending Messages
    socket.on('send_message', async (data) => {
        const { jobId, senderId, receiverId, message } = data;

        try {
            // Save to Database
            const chatMsg = new Message({
                jobId,
                sender: senderId,
                receiver: receiverId,
                message
            });
            await chatMsg.save();

            // Send to receiver if online
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', {
                    jobId,
                    senderId,
                    message,
                    timestamp: chatMsg.timestamp
                });
            }
        } catch (error) {
            console.error("❌ Chat Save Error:", error);
        }
    });

    socket.on('disconnect', () => {
        for (let [uid, sid] of onlineUsers.entries()) {
            if (sid === socket.id) {
                onlineUsers.delete(uid);
                console.log(`🔌 User disconnected: ${uid}`);
                break;
            }
        }
    });
});

// 5. ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/work', require('./routes/workRoutes'));
app.use('/api/otp', require('./routes/otp'));

// 6. ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    console.error("❌ Global Server Error:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

// IMPORTANT: Use server.listen instead of app.listen
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://192.168.0.9:${PORT}`);
    console.log(`💬 Socket.io is active and listening for chat events`);
});