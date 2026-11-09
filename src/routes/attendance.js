const express = require('express');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Location = require('../models/Location');

const router = express.Router();

function isRequestBody(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body);
}

function createAttendanceHandler(actionType) {
  return async (req, res) => {
    if (!isRequestBody(req.body)) {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const empCode = typeof req.body.empCode === 'string' ? req.body.empCode.trim() : '';
    const locationCode = typeof req.body.locationCode === 'string'
      ? req.body.locationCode.trim()
      : '';

    if (!empCode || !locationCode) {
      return res.status(400).json({
        error: 'empCode and locationCode are required'
      });
    }

    const [employee, location] = await Promise.all([
      Employee.findOne({ empCode }),
      Location.findOne({ code: locationCode })
    ]);

    if (!employee || !employee.isActive) {
      return res.status(404).json({ error: 'Active employee not found' });
    }
    if (!location || !location.isActive) {
      return res.status(404).json({ error: 'Active location not found' });
    }

    const timestamp = new Date();
    const attendance = await Attendance.create({
      employeeId: employee._id,
      empCode: employee.empCode,
      locationId: location._id,
      locationCode: location.code,
      date: timestamp.toISOString().slice(0, 10),
      actionType,
      timestamp
    });

    return res.status(201).json(attendance);
  };
}

router.post('/checkIn', createAttendanceHandler('CHECK_IN'));
router.post('/checkOut', createAttendanceHandler('CHECK_OUT'));

module.exports = router;
