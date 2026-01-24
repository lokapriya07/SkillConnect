const express = require('express');
const router = express.Router();
const { updateWorkProfile } = require('../controllers/work');

// Route for updating worker profile
router.put('/profile/:userId', updateWorkProfile);

module.exports = router;