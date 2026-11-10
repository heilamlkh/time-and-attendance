const express = require("express");
const Admin = require("../models/Admin");

const router = express.Router();

const adminFields = [
  "username",
  "email",
  "password",
  "name",
  "role",
  "isActive",
  "lastLogin",
];

function isRequestBody(body) {
  return body !== null && typeof body === "object" && !Array.isArray(body);
}

function pickAdminFields(body) {
  const normalizedBody = { ...body };

  if (typeof normalizedBody.username === "string") {
    normalizedBody.username = normalizedBody.username.trim().toLowerCase();
  }

  if (typeof normalizedBody.email === "string") {
    normalizedBody.email = normalizedBody.email.trim().toLowerCase();
  }

  return Object.fromEntries(
    adminFields
      .filter((field) => Object.hasOwn(normalizedBody, field))
      .map((field) => [field, normalizedBody[field]]),
  );
}

function hasUnsupportedFields(body) {
  return Object.keys(body).some((field) => !adminFields.includes(field));
}

router.get("/", async (req, res) => {
  const admins = await Admin.find().sort({ username: 1 });
  return res.json(admins);
});

router.get("/:username", async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(404).json({ error: "Admin not found" });
  }

  return res.json(admin);
});

router.post("/", async (req, res) => {
  if (!isRequestBody(req.body)) {
    return res
      .status(400)
      .json({ error: "Request body must be a JSON object" });
  }

  if (hasUnsupportedFields(req.body)) {
    return res
      .status(400)
      .json({ error: "Request contains unsupported admin fields" });
  }

  const { username, email, password, name } = req.body;
  if (!username || !email || !password || !name) {
    return res.status(400).json({
      error: "username, email, password, and name are required",
    });
  }

  const admin = await Admin.create(
    pickAdminFields({
      ...req.body,
      username:
        typeof req.body.username === "string"
          ? req.body.username.trim().toLowerCase()
          : req.body.username,
      email:
        typeof req.body.email === "string"
          ? req.body.email.trim().toLowerCase()
          : req.body.email,
    }),
  );
  return res.status(201).json(admin);
});

router.put("/:username", async (req, res) => {
  if (!isRequestBody(req.body)) {
    return res
      .status(400)
      .json({ error: "Request body must be a JSON object" });
  }

  if (hasUnsupportedFields(req.body)) {
    return res
      .status(400)
      .json({ error: "Request contains unsupported admin fields" });
  }

  const update = pickAdminFields(req.body);
  if (Object.keys(update).length === 0) {
    return res
      .status(400)
      .json({ error: "Provide at least one admin field to update" });
  }

  const admin = await Admin.findOneAndUpdate(
    { username: req.params.username.trim().toLowerCase() },
    update,
    { new: true, runValidators: true },
  );

  if (!admin) {
    return res.status(404).json({ error: "Admin not found" });
  }

  return res.json(admin);
});

router.delete("/:username", async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const admin = await Admin.findOneAndDelete({ username });
  if (!admin) {
    return res.status(404).json({ error: "Admin not found" });
  }

  return res.json({ message: "Admin deleted successfully", admin });
});

module.exports = router;
