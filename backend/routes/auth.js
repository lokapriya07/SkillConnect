// // const express = require("express");
// // const router = express.Router();
// // const bcrypt = require("bcryptjs");
// // const jwt = require("jsonwebtoken");

// // const User = require("../models/User");
// // const Work = require("../models/Work");

// // /* =========================
// //    SIGNUP (User / Worker)
// // ========================= */
// // router.post("/signup", async (req, res) => {
// //   try {
// //     const { name, email, password, role } = req.body;

// //     if (!name || !email || !password || !role) {
// //       return res.status(400).json({ msg: "All fields are required" });
// //     }

// //     if (!["client", "worker"].includes(role)) {
// //       return res.status(400).json({ msg: "Invalid role" });
// //     }

// //     const Model = role === "worker" ? Work : User;

// //     const existing = await Model.findOne({ email });
// //     if (existing) {
// //       return res.status(400).json({ msg: "Email already registered" });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const newAccount = new Model({
// //       name,
// //       email,
// //       password: hashedPassword,
// //     });

// //     await newAccount.save();

// //     res.status(201).json({
// //       msg: `${role === "worker" ? "Worker" : "User"} created successfully`,
// //     });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // /* =========================
// //    LOGIN (Role Safe)
// // ========================= */router.post("/login", async (req, res) => {
// //   try {
// //     const { email, password, role } = req.body;

// //     // Validation
// //     if (!email || !password) {
// //       return res.status(400).json({ msg: "Email and password are required" });
// //     }

// //     // If frontend forgets to send role, default to 'client' or handle error
// //     const selectedRole = role || "client";
// //     const Model = selectedRole === "worker" ? Work : User;

// //     const account = await Model.findOne({ email: email.toLowerCase().trim() });

// //     if (!account) {
// //       return res.status(400).json({ msg: "Account not found in " + selectedRole + " records" });
// //     }

// //     const isMatch = await bcrypt.compare(password, account.password);
// //     if (!isMatch) {
// //       return res.status(400).json({ msg: "Invalid password" });
// //     }

// //     const token = jwt.sign(
// //       { id: account._id, role: selectedRole },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "1d" }
// //     );

// //     res.json({
// //       token,
// //       user: {
// //         id: account._id,
// //         name: account.name,
// //         email: account.email,
// //         role: selectedRole,
// //       },
// //     });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // module.exports = router;
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');

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

//     res.json({
//       user: {
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         phone: user.phone
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error during login" });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- SIGNUP ---
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role // 'client' or 'worker'
    });

    await user.save();
    res.status(201).json({ msg: "Account created successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error during signup" });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    // ROLE CHECK: Prevent Worker from logging into User app
    if (user.role !== role) {
      return res.status(403).json({ msg: `Access denied. This account is a ${user.role}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    // SUCCESS: Return user info AND the unique ID
    res.json({
      success: true,
      user: {
        id: user._id, // CRITICAL: This allows profile saving
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ""
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error during login" });
  }
});
router.get('/workers', async (req, res) => {
  try {
    // We select '-password' to ensure the hashed password is never sent to the client
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

module.exports = router;