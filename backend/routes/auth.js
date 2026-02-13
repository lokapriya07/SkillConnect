// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// require('dotenv').config();


// // --- SIGNUP ---
// router.post('/signup', async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     let user = await User.findOne({ email: email.toLowerCase() });
//     if (user) return res.status(400).json({ msg: "User already exists" });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     user = new User({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role // 'client' or 'worker'
//     });

//     await user.save();
//     res.status(201).json({ msg: "Account created successfully" });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error during signup" });
//   }
// });

// // --- LOGIN ---
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const user = await User.findOne({ email: email.toLowerCase() });

//     if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

//     // ROLE CHECK: Prevent Worker from logging into User app
//     if (user.role !== role) {
//       return res.status(403).json({ msg: `Access denied. This account is a ${user.role}.` });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

//     // Get worker profile ID if logging in as worker
//     let workerProfileId = null;
//     if (role === 'worker') {
//       const Work = require('../models/Work');
//       const workerProfile = await Work.findOne({ userId: user._id });
//       if (workerProfile) {
//         workerProfileId = workerProfile._id;
//       }
//     }

//     // SUCCESS: Return user info AND the unique ID
//     res.json({
//       success: true,
//       user: {
//         id: user._id, // CRITICAL: This allows profile saving
//         workerProfileId: workerProfileId, // Work model's _id for assigned jobs lookup
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         phone: user.phone || ""
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error during login" });
//   }
// });
// router.get('/workers', async (req, res) => {
//   try {
//     // We select '-password' to ensure the hashed password is never sent to the client
//     const workers = await User.find({ role: 'worker' }).select('-password');

//     res.json({
//       success: true,
//       count: workers.length,
//       workers
//     });
//   } catch (err) {
//     console.error("❌ Error fetching workers:", err);
//     res.status(500).json({ msg: "Server error fetching workers" });
//   }
// });
// // --- UPDATE PROFILE ---
// router.put('/update-profile/:id', async (req, res) => {
//   try {
//     const { name, email, phone } = req.body;
//     const userId = req.params.id;

//     // Find user and update
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { 
//         name, 
//         email: email.toLowerCase(), 
//         phone 
//       },
//       { new: true } // returns the updated document
//     ).select('-password');

//     if (!updatedUser) {
//       return res.status(404).json({ msg: "User not found" });
//     }

//     res.json({
//       success: true,
//       user: {
//         id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         role: updatedUser.role,
//         phone: updatedUser.phone || ""
//       }
//     });
//   } catch (err) {
//     console.error("❌ Error updating profile:", err);
//     res.status(500).json({ msg: "Server error during profile update" });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// --- SIGNUP ---
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // 1. Validation: Ensure no fields are missing
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ msg: "Please fill in all fields (name, email, phone, password, role)" });
    }

    // 2. Check if email already exists
    let userByEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (userByEmail) return res.status(400).json({ msg: "User with this email already exists" });

    // 3. Check if phone already exists
    let userByPhone = await User.findOne({ phone: phone.toString().trim() });
    if (userByPhone) return res.status(400).json({ msg: "Phone number already in use" });

    // 4. Hash Password (Safely convert to string to avoid "Illegal arguments" error)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password), salt);

    // 5. Create and Save User
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.toString().trim(),
      password: hashedPassword,
      role // 'client' or 'worker'
    });

    await user.save();
    res.status(201).json({ success: true, msg: "Account created successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ msg: "Server error during signup" });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ msg: "Please provide email, password, and role" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    // ROLE CHECK: Ensure user is logging into the correct app/portal
    if (user.role !== role) {
      return res.status(403).json({ msg: `Access denied. This account is registered as a ${user.role}.` });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    // Get worker profile ID if logging in as worker (Optional logic from your previous code)
    let workerProfileId = null;
    if (role === 'worker') {
      try {
        const Work = require('../models/Work');
        const workerProfile = await Work.findOne({ userId: user._id });
        if (workerProfile) {
          workerProfileId = workerProfile._id;
        }
      } catch (e) {
        console.log("Work model not found or error fetching worker profile.");
      }
    }

    // SUCCESS: Return full user data including phone
    res.json({
      success: true,
      user: {
        id: user._id,
        workerProfileId: workerProfileId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ""
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

// --- GET WORKERS ---
router.get('/workers', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password');
    res.json({
      success: true,
      count: workers.length,
      workers
    });
  } catch (err) {
    console.error("❌ Error fetching workers:", err);
    res.status(500).json({ msg: "Server error fetching workers" });
  }
});

// --- UPDATE PROFILE (Saves to Database) ---
router.put('/update-profile/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.params.id;

    // 1. Find user and update in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name?.trim(), 
        email: email?.toLowerCase().trim(), 
        phone: phone?.toString().trim() 
      },
      { new: true, runValidators: true } // 'new: true' returns the updated version
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 2. Return the new data to frontend
    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || ""
      }
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    
    // Handle Duplicate Key Error (e.g., trying to change email to one that exists)
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Email or Phone number is already in use by another account" });
    }
    
    res.status(500).json({ msg: "Server error during profile update" });
  }
});

module.exports = router;