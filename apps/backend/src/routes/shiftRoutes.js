const express = require("express");
const router = express.Router();
const { getModels } = require("../../database/initModels");

router.get("/", async (req, res) => {
  try {
    const { Shift } = getModels();
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "email query param is required" });

    const now = new Date();
    const shifts = await Shift.find({ volunteerEmail: email }).lean();
    const upcoming = shifts.filter((shift) => new Date(shift.date) >= now);
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json(upcoming);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { Shift } = getModels();
    const { eventId, volunteerId, volunteerEmail, shiftType, shiftTime, date } = req.body;
    const shift = await Shift.create({ eventId, volunteerId, volunteerEmail, shiftType, shiftTime, date });
    res.status(201).json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { Shift } = getModels();
    const { id } = req.params;

    const deletedShift = await Shift.findByIdAndDelete(id);

    if (!deletedShift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    res.status(200).json({ message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
