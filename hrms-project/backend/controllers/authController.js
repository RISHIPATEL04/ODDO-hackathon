const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      employeeId: user.employeeId,
      email: user.email, 
      role: user.role,
      name: `${user.personalDetails?.firstName || ''} ${user.personalDetails?.lastName || ''}`.trim()
    },
    process.env.JWT_SECRET || 'hrms_secret_key',
    { expiresIn: '7d' }
  );
};

// Register User
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, email, password, role, firstName, lastName } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (user) {
      return res.status(400).json({ 
        message: 'User already exists with this email or employee ID' 
      });
    }

    // Create new user
    user = new User({
      employeeId,
      email,
      password,
      role: role || 'employee',
      personalDetails: {
        firstName,
        lastName
      }
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        name: `${user.personalDetails.firstName} ${user.personalDetails.lastName}`
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        name: `${user.personalDetails?.firstName || ''} ${user.personalDetails?.lastName || ''}`.trim()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
