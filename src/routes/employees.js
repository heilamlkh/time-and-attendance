const express = require('express');
const Employee = require('../models/Employee');

const router = express.Router();

const employeeFields = [
  'empCode',
  'name',
  'email',
  'department',
  'employmentStart',
  'employmentEnd',
  'isActive'
];

function isRequestBody(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body);
}

function pickEmployeeFields(body) {
  return Object.fromEntries(
    employeeFields
      .filter((field) => Object.hasOwn(body, field))
      .map((field) => [field, body[field]])
  );
}

function hasUnsupportedFields(body) {
  return Object.keys(body).some((field) => !employeeFields.includes(field));
}

router.get('/', async (req, res) => {
  const employees = await Employee.find().sort({ empCode: 1 });
  return res.json(employees);
});

router.get('/:empCode', async (req, res) => {
  const empCode = req.params.empCode.trim();
  if (!empCode) {
    return res.status(400).json({ error: 'Employee code is required' });
  }

  const employee = await Employee.findOne({ empCode });
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  return res.json(employee);
});

router.post('/', async (req, res) => {
  if (!isRequestBody(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }
  if (hasUnsupportedFields(req.body)) {
    return res.status(400).json({ error: 'Request contains unsupported employee fields' });
  }

  const employee = await Employee.create(pickEmployeeFields(req.body));
  return res.status(201).json(employee);
});

router.put('/:empCode', async (req, res) => {
  if (!isRequestBody(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }
  if (hasUnsupportedFields(req.body)) {
    return res.status(400).json({ error: 'Request contains unsupported employee fields' });
  }

  const update = pickEmployeeFields(req.body);
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'Provide at least one employee field to update' });
  }

  const employee = await Employee.findOneAndUpdate(
    { empCode: req.params.empCode.trim() },
    update,
    { new: true, runValidators: true }
  );
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  return res.json(employee);
});

router.use((error, req, res, next) => {
  if (error.code === 11000) {
    return res.status(409).json({ error: 'Employee code already exists' });
  }

  return next(error);
});

module.exports = router;
