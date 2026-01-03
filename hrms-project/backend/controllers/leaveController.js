const Leave = require('../models/Leave');
const User = require('../models/User');

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, remarks } = req.body;
    
    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Get user details
    const user = await User.findById(req.user.id);
    
    const leave = new Leave({
      employeeId: req.user.employeeId,
      employeeName: `${user.personalDetails.firstName} ${user.personalDetails.lastName}`,
      leaveType,
      startDate: start,
      endDate: end,
      duration,
      remarks,
      status: 'pending'
    });
    
    await leave.save();
    
    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my leave applications
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.employeeId })
      .sort({ appliedDate: -1 });
    
    res.json(leaves);
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all leave applications (admin only)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const leaves = await Leave.find(query)
      .sort({ appliedDate: -1 });
    
    res.json(leaves);
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update leave status (admin only)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, adminComments } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }
    
    leave.status = status;
    leave.adminComments = adminComments;
    leave.reviewedDate = new Date();
    leave.reviewedBy = req.user.employeeId;
    
    await leave.save();
    
    res.json({
      message: `Leave application ${status}`,
      leave
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
