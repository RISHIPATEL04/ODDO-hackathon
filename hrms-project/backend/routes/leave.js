const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Routes
router.post('/apply', authMiddleware, leaveController.applyLeave);
router.get('/my-leaves', authMiddleware, leaveController.getMyLeaves);
router.get('/all', authMiddleware, adminMiddleware, leaveController.getAllLeaves);
router.put('/:leaveId/status', authMiddleware, adminMiddleware, leaveController.updateLeaveStatus);

module.exports = router;