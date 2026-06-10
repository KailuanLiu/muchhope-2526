const express = require("express");
const router = express.Router();
const { getModels } = require("../../database/initModels");

router.get("/", async (req, res) => {
  try {
    const { Shift, Volunteer } = getModels();
    const { email, eventId } = req.query;

    // Admin view: return all shifts for an event, enriched with volunteer display names
    if (eventId) {
      const shifts = await Shift.find({ eventId }).lean();

      // Deduplicate emails before querying, since one volunteer may have multiple shifts
      const emails = [...new Set(shifts.map((s) => s.volunteerEmail))];

      // Batch lookup: one DB query for all volunteers instead of one per shift
      const volunteers = await Volunteer.find({ email: { $in: emails } }).lean();

      // Build a map so each shift lookup is O(1) instead of scanning the array
      const volunteerMap = Object.fromEntries(volunteers.map((v) => [v.email, v]));

      const enriched = shifts.map((shift) => {
        const vol = volunteerMap[shift.volunteerEmail];
        return {
          ...shift,
          // Volunteers are stored in a separate DB (volunteersDB vs eventsDB), so vol may be
          // undefined if the record hasn't synced. Fall back to email as a readable identifier.
          volunteerName: vol ? `${vol.firstName} ${vol.lastName}` : shift.volunteerEmail,
        };
      });
      return res.status(200).json(enriched);
    }

    if (!email) return res.status(400).json({ message: "email or eventId query param is required" });

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
