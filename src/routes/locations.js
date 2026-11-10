const express = require("express");
const Location = require("../models/Location");

const router = express.Router();

const locationFields = ["code", "name", "type", "address", "isActive"];

function isRequestBody(body) {
  return body !== null && typeof body === "object" && !Array.isArray(body);
}

function pickLocationFields(body) {
  return Object.fromEntries(
    locationFields
      .filter((field) => Object.hasOwn(body, field))
      .map((field) => [field, body[field]]),
  );
}

function hasUnsupportedFields(body) {
  return Object.keys(body).some((field) => !locationFields.includes(field));
}

router.get("/", async (req, res) => {
  const locations = await Location.find().sort({ code: 1 });
  return res.json(locations);
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
      .json({ error: "Request contains unsupported location fields" });
  }

  const location = await Location.create(pickLocationFields(req.body));
  return res.status(201).json(location);
});

router.get("/:code", async (req, res) => {
  const code = req.params.code.trim();
  if (!code) {
    return res.status(400).json({ error: "Location code is required" });
  }

  const location = await Location.findOne({ code });
  if (!location) {
    return res.status(404).json({ error: "Location not found" });
  }

  return res.json(location);
});

router.put("/:code", async (req, res) => {
  if (!isRequestBody(req.body)) {
    return res
      .status(400)
      .json({ error: "Request body must be a JSON object" });
  }

  if (hasUnsupportedFields(req.body)) {
    return res
      .status(400)
      .json({ error: "Request contains unsupported location fields" });
  }

  const update = pickLocationFields(req.body);
  if (Object.keys(update).length === 0) {
    return res
      .status(400)
      .json({ error: "Provide at least one location field to update" });
  }

  const location = await Location.findOneAndUpdate(
    { code: req.params.code.trim() },
    update,
    { new: true, runValidators: true },
  );

  if (!location) {
    return res.status(404).json({ error: "Location not found" });
  }

  return res.json(location);
});

router.use((error, req, res, next) => {
  if (error.code === 11000) {
    return res.status(409).json({ error: "Location code already exists" });
  }

  return next(error);
});

module.exports = router;
