// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Database Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ Connected to MongoDB Atlas"))
//   .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// // Routes
// app.use("/api/auth", require("./routes/auth"));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
// Mongoose will automatically create the 'skillconnect' DB if it doesn't exist
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 Connected to MongoDB Atlas: skillconnect database"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));