const express = require("express");
const router = express.Router();
const { getModels } = require("../../database/initModels");

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getRequesterRole(req) {
  const headerRole = req.headers["x-user-role"];
  return typeof headerRole === "string" ? normalizeRole(headerRole) : null;
}

async function requireMainAdmin(req, res, next) {
  try {
    const role = getRequesterRole(req);
    if (!role) return res.status(401).json({ message: "User role is required" });
    if (role !== "mainadmin") return res.status(403).json({ message: "Main admin access required" });
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

function toEventDateTime(event) {
  const value = new Date(`${event.date} ${event.startTime}`);
  return Number.isNaN(value.getTime()) ? null : value;
}

router.get("/", async (req, res) => {
  try {
    const { Event } = getModels();
    const { timeframe } = req.query;
    const now = new Date();
    const events = await Event.find().lean();
    const filteredEvents = events.filter((event) => {
      const eventDate = toEventDateTime(event);
      if (!eventDate || !timeframe) return true;
      if (timeframe === "upcoming") return eventDate >= now;
      if (timeframe === "past") return eventDate < now;
      return true;
    });
    filteredEvents.sort((a, b) => {
      const first = toEventDateTime(a);
      const second = toEventDateTime(b);
      if (!first || !second) return 0;
      return timeframe === "past" ? second - first : first - second;
    });
    res.status(200).json(filteredEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireMainAdmin, async (req, res) => {
  try {
    const { Event } = getModels();
    const event = await Event.create({ ...req.body });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireMainAdmin, async (req, res) => {
  try {
    const { Event } = getModels();
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { ...req.body },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
