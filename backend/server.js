const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Added for file paths
const fs = require('fs');     // Added for folder management
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 1. ENSURE UPLOADS FOLDER EXISTS
// This creates the folder where image/video/audio files will be stored
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. SERVE STATIC FILES
// This allows you to view the files via http://your-ip:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 Connected to MongoDB Atlas: skillconnect database"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobRoutes')); // Added job routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));