const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Routes
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id/profile', authMiddleware, userController.updateProfile);
router.put('/:id/salary', authMiddleware, adminMiddleware, userController.updateSalaryStructure);

module.exports = router;