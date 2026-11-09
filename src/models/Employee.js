const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    empCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    department: {
      type: String,
      trim: true
    },
    employmentStart: {
      type: Date,
      required: true
    },
    employmentEnd: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
