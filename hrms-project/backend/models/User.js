const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee'
  },
  personalDetails: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    profilePicture: String,
    dateOfBirth: Date
  },
  jobDetails: {
    department: String,
    position: String,
    dateOfJoining: Date,
    employmentType: String
  },
  salaryStructure: {
    basicSalary: Number,
    allowances: Number,
    deductions: Number,
    netSalary: Number
  },
  documents: [{
    name: String,
    url: String,
    uploadDate: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);