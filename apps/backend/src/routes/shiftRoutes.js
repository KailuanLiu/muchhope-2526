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

    // Compare by calendar day, not exact timestamp. Shift dates are stored as
    // date-only strings (e.g. "2026-07-01"), which `new Date()` parses as UTC
    // midnight. Comparing that against the current time would drop shifts that
    // are scheduled for today (and can shift by a day depending on timezone).
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const parseShiftDate = (value) => {
      // Accept "YYYY-MM-DD" (and ISO strings like "2026-07-01T00:00:00.000Z")
      // and parse the calendar day in local time to avoid UTC offset bugs.
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value).trim());
      if (match) {
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      }
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return null;
      // Normalize to local midnight so comparisons are day-based.
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    };

    const shifts = await Shift.find({ volunteerEmail: email }).lean();
    const upcoming = shifts.filter((shift) => {
      const shiftDate = parseShiftDate(shift.date);
      return shiftDate && shiftDate >= startOfToday;
    });
    upcoming.sort((a, b) => {
      const first = parseShiftDate(a.date);
      const second = parseShiftDate(b.date);
      if (!first || !second) return 0;
      return first - second;
    });

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
    const { volunteerEmail } = req.query;

    // When a volunteerEmail scope is supplied, only delete the shift if it
    // belongs to that volunteer. Admin callers omit it to delete any shift.
    const query = { _id: id };
    if (volunteerEmail) {
      query.volunteerEmail = volunteerEmail;
    }

    const deletedShift = await Shift.findOneAndDelete(query);

    if (!deletedShift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    res.status(200).json({ message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
