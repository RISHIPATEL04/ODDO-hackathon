const Payroll = require('../models/Payroll');
const User = require('../models/User');

// Get my payroll
exports.getMyPayroll = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { employeeId: req.user.employeeId };
    
    if (month && year) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    } else {
      // Get current month
      const now = new Date();
      query.month = now.getMonth() + 1;
      query.year = now.getFullYear();
    }
    
    const payroll = await Payroll.find(query).sort({ year: -1, month: -1 });
    
    // If no payroll found, create a sample from user's salary structure
    if (payroll.length === 0) {
      const user = await User.findOne({ employeeId: req.user.employeeId });
      if (user && user.salaryStructure) {
        const samplePayroll = {
          employeeId: user.employeeId,
          month: query.month,
          year: query.year,
          basicSalary: user.salaryStructure.basicSalary || 0,
          allowances: {
            housing: 0,
            transportation: 0,
            other: 0
          },
          deductions: {
            tax: user.salaryStructure.deductions || 0,
            insurance: 0,
            other: 0
          },
          totalAllowances: 0,
          totalDeductions: user.salaryStructure.deductions || 0,
          netSalary: user.salaryStructure.netSalary || 0,
          paymentStatus: 'pending'
        };
        
        return res.json([samplePayroll]);
      }
    }
    
    res.json(payroll);
  } catch (error) {
    console.error('Get my payroll error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all payroll (admin only)
exports.getAllPayroll = async (req, res) => {
  try {
    const { month, year, employeeId } = req.query;
    
    let query = {};
    
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    if (month && year) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    }
    
    const payroll = await Payroll.find(query)
      .sort({ year: -1, month: -1, employeeId: 1 })
      .limit(50);
    
    res.json(payroll);
  } catch (error) {
    console.error('Get all payroll error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create/update payroll (admin only)
exports.updatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, payrollData } = req.body;
    
    // Find existing payroll or create new
    let payroll = await Payroll.findOne({
      employeeId,
      month,
      year
    });
    
    if (!payroll) {
      payroll = new Payroll({
        employeeId,
        month,
        year,
        ...payrollData
      });
    } else {
      Object.assign(payroll, payrollData);
    }
    
    // Calculate totals
    payroll.totalAllowances = 
      (payroll.allowances.housing || 0) + 
      (payroll.allowances.transportation || 0) + 
      (payroll.allowances.other || 0);
    
    payroll.totalDeductions = 
      (payroll.deductions.tax || 0) + 
      (payroll.deductions.insurance || 0) + 
      (payroll.deductions.other || 0);
    
    payroll.netSalary = 
      (payroll.basicSalary || 0) + 
      payroll.totalAllowances - 
      payroll.totalDeductions;
    
    await payroll.save();
    
    res.json({
      message: 'Payroll updated successfully',
      payroll
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};