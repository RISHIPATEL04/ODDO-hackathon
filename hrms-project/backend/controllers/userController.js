const User = require('../models/User');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { personalDetails, jobDetails } = req.body;
    const userId = req.params.id;
    
    // Check if user exists
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Regular employees can only update limited fields
    if (req.user.role === 'employee' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update fields
    if (personalDetails) {
      user.personalDetails = { ...user.personalDetails, ...personalDetails };
    }
    
    if (jobDetails && req.user.role === 'admin') {
      user.jobDetails = { ...user.jobDetails, ...jobDetails };
    }
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: await User.findById(userId).select('-password')
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update salary structure (admin only)
exports.updateSalaryStructure = async (req, res) => {
  try {
    const { salaryStructure } = req.body;
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.salaryStructure = salaryStructure;
    await user.save();
    
    res.json({
      message: 'Salary structure updated successfully',
      user: await User.findById(userId).select('-password')
    });
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
