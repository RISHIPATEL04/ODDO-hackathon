const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Routes
router.get('/my-payroll', authMiddleware, payrollController.getMyPayroll);
router.get('/all', authMiddleware, adminMiddleware, payrollController.getAllPayroll);
router.post('/update', authMiddleware, adminMiddleware, payrollController.updatePayroll);

module.exports = router;
routes/leave.js