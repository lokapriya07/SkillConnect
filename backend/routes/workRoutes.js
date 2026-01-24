const express = require('express');
const router = express.Router();
const { updateWorkProfile, getWorkProfile, getAllWorkers } = require('../controllers/work');

// Update profile
router.put('/profile/:userId', updateWorkProfile);

// Get profile (to verify saved data)
router.get('/profile/:userId', getWorkProfile);
router.get('/all', getAllWorkers);

module.exports = router;
