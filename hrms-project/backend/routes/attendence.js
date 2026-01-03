const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Routes
router.post('/checkin', authMiddleware, attendanceController.checkIn);
router.post('/checkout', authMiddleware, attendanceController.checkOut);
router.get('/my-attendance', authMiddleware, attendanceController.getMyAttendance);
router.get('/all', authMiddleware, adminMiddleware, attendanceController.getAllAttendance);
router.put('/:attendanceId', authMiddleware, adminMiddleware, attendanceController.updateAttendanceStatus);

module.exports = router;