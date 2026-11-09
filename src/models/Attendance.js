const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    empCode: {
      type: String,
      required: true,
      trim: true
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    locationCode: {
      type: String,
      trim: true
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format'],
      validate: {
        validator(value) {
          const parsed = new Date(`${value}T00:00:00.000Z`);
          return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
        },
        message: 'Date must be a valid calendar date'
      }
    },
    actionType: {
      type: String,
      required: true,
      enum: ['CHECK_IN', 'CHECK_OUT']
    },
    timestamp: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, timestamp: -1 });
attendanceSchema.index({ locationId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
