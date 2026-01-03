const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['paid', 'sick', 'unpaid'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminComments: {
    type: String
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: {
    type: Date
  },
  reviewedBy: {
    type: String
  }
});

module.exports = mongoose.model('Leave', LeaveSchema);