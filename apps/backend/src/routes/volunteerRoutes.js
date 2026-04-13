const express = require("express");
const router = express.Router();
const { getModels, Event } = require("../../database/initModels");

router.get("/", async (req, res) => {
  try {
    const { Volunteer } = getModels();
    const volunteers = await Volunteer.find();
    res.status(200).json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { Volunteer } = getModels();
    const { email } = req.body;
    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    res.status(200).json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/events", async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findOne({ id });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    const events = await Event.find({
      "volunteers.email": volunteer.email,
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findOneAndDelete({ id });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    res.status(200).json({ message: "Volunteer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/make-event-admin", async (req, res) => {
  try {
    const { id } = req.params;
    const { eventId } = req.body;

    // first check if the volunteer exists and error if they don't
    const volunteer = await Volunteer.findOne({ id });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // check if the event exists and error if it doesn't
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    volunteer.userType = "event admin";
    await volunteer.save();

    // if they aren't already an admin, then change their status to being an admin
    const alreadyAdmin = event.admins.some((a) => a.id === id);
    if (!alreadyAdmin) {
      event.admins.push({
        id: volunteer.id,
        name: `${volunteer.firstName} ${volunteer.lastName}`,
        email: volunteer.email,
      });
      await event.save();
    }

    res.status(200).json({ volunteer, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { Volunteer } = getModels();
    const { id } = req.params;
    const updates = req.body;
    const volunteer = await Volunteer.findOneAndUpdate({ id }, updates, {
      new: true,
      runValidators: true,
    });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    res.status(200).json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
