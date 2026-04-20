const express = require("express");
const { Event, Volunteer } = require("../../database/initModels");

const router = express.Router();

function normalizeRole(userType) {
  return String(userType || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getRequesterEmail(req) {
  const headerEmail = req.headers["x-user-email"];
  const bodyEmail = req.body?.userEmail;

  if (typeof headerEmail === "string" && headerEmail.trim()) {
    return headerEmail.trim().toLowerCase();
  }

  if (typeof bodyEmail === "string" && bodyEmail.trim()) {
    return bodyEmail.trim().toLowerCase();
  }

  return null;
}

async function requireMainAdmin(req, res, next) {
  try {
    const email = getRequesterEmail(req);

    if (!email) {
      return res.status(401).json({ message: "User email is required" });
    }

    const volunteer = await Volunteer.findOne({ email });

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    if (normalizeRole(volunteer.userType) !== "main admin") {
      return res.status(403).json({ message: "Main admin access required" });
    }

    req.currentVolunteer = volunteer;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

function toEventDateTime(event) {
  const value = new Date(`${event.date} ${event.time}`);
  return Number.isNaN(value.getTime()) ? null : value;
}

router.get("/", async (req, res) => {
  try {
    const { timeframe } = req.query;
    const now = new Date();
    const events = await Event.find().lean();

    const filteredEvents = events.filter((event) => {
      const eventDate = toEventDateTime(event);

      if (!eventDate || !timeframe) {
        return true;
      }

      if (timeframe === "upcoming") {
        return eventDate >= now;
      }

      if (timeframe === "past") {
        return eventDate < now;
      }

      return true;
    });

    filteredEvents.sort((a, b) => {
      const first = toEventDateTime(a);
      const second = toEventDateTime(b);

      if (!first || !second) {
        return 0;
      }

      return timeframe === "past" ? second - first : first - second;
    });

    res.status(200).json(filteredEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireMainAdmin, async (req, res) => {
  try {
    const eventPayload = { ...req.body };
    delete eventPayload.userEmail;

    const event = await Event.create(eventPayload);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", requireMainAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.userEmail;

    const event = await Event.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
