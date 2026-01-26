const express = require('express');
const router = express.Router();
const twilio = require("twilio");
const User = require('../models/User');
require('dotenv').config();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
let otpStore = {};

// POST: /api/otp/send
router.post("/send", async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone number required" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    otpStore[phone] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    try {
        await client.messages.create({
            body: `Your ServiceHub OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });
        res.json({ success: true });
    } catch (err) {
        console.error("Twilio Error:", err.message);
        res.status(500).json({ success: false, error: "Failed to send SMS" });
    }
});
router.post("/verify", async (req, res) => {
    const { phone, otp } = req.body;

    // 1. Validate OTP from memory
    const record = otpStore[phone];
    console.log("--- Verification Debug ---");
    console.log("Checking Phone:", phone);
    console.log("Checking OTP:", otp);
    console.log("Store contains:", otpStore[phone]);

    if (record && record.otp == otp && record.expires > Date.now()) {

        // OTP is valid! Now clean up memory
        delete otpStore[phone];

        try {
            // 2. Check if user already exists in DB
            let user = await User.findOne({ phone: phone });

            if (user) {
                // User exists - Return user data (Login flow)
                return res.json({
                    success: true,
                    exists: true,
                    user: { id: user._id, name: user.name, role: user.role }
                });
            } else {
                // New user - Frontend should redirect to "Complete Profile" screen
                return res.json({
                    success: true,
                    exists: false,
                    message: "OTP Verified. Please complete your registration."
                });
            }
        } catch (dbErr) {
            return res.status(500).json({ success: false, error: "Database lookup failed" });
        }

    } else {
        res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
});

module.exports = router;