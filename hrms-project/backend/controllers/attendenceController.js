const Attendance = require('../models/Attendance');

// Check in
exports.checkIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employeeId: req.user.employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }
    
    let attendance;
    if (existingAttendance) {
      attendance = existingAttendance;
    } else {
      attendance = new Attendance({
        employeeId: req.user.employeeId,
        date: new Date(),
        status: 'present'
      });
    }
    
    attendance.checkIn = new Date();
    await attendance.save();
    
    res.json({
      message: 'Checked in successfully',
      attendance
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check out
exports.checkOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employeeId: req.user.employeeId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }
    
    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }
    
    attendance.checkOut = new Date();
    
    // Calculate total hours
    if (attendance.checkIn) {
      const diffMs = attendance.checkOut - attendance.checkIn;
      attendance.totalHours = diffMs / (1000 * 60 * 60); // Convert to hours
    }
    
    await attendance.save();
    
    res.json({
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get attendance for employee
exports.getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { employeeId: req.user.employeeId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.date = { $gte: thirtyDaysAgo };
    }
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all attendance (admin only)
exports.getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    let query = {};
    
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.date = { $gte: thirtyDaysAgo };
    }
    
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(100);
    
    res.json(attendance);
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update attendance status (admin only)
exports.updateAttendanceStatus = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, notes } = req.body;
    
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    if (status) {
      attendance.status = status;
    }
    
    if (notes !== undefined) {
      attendance.notes = notes;
    }
    
    await attendance.save();
    
    res.json({
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
