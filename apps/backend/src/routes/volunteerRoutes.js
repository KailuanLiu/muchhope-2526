const express = require("express");
const router = express.Router();
const { getModels } = require("../../database/initModels");

const { requireAuth, requireAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const {
  loginVolunteerBodySchema,
  volunteerIdParamsSchema,
  makeEventAdminBodySchema,
  updateVolunteerBodySchema,
} = require("../validation/volunteerSchemas");

router.get("/", requireAdmin, async (req, res) => {
  try {
    const { Volunteer } = getModels();
    const volunteers = await Volunteer.find();
    res.status(200).json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", requireAuth, validate({ body: loginVolunteerBodySchema }), async (req, res) => {
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

router.get("/:id/events", requireAuth, validate({ params: volunteerIdParamsSchema }), async (req, res) => {
  try {
    const { id } = req.params;
    const { Volunteer, Event } = getModels();

    const volunteer = await Volunteer.findById(id);
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

router.delete("/:id", requireAdmin, validate({ params: volunteerIdParamsSchema }), async (req, res) => {
  try {
    const { Volunteer } = getModels();
    const { id } = req.params;

    const volunteer = await Volunteer.findByIdAndDelete(id);

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    res.status(200).json({ message: "Volunteer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put(
  "/:id/make-event-admin",
  requireAdmin,
  validate({
    params: volunteerIdParamsSchema,
    body: makeEventAdminBodySchema,
  }),
  async (req, res) => {
    try {
      const { Volunteer, Event } = getModels();
      const { id } = req.params;
      const { eventId } = req.body;

      // first check if the volunteer exists and error if they don't
      const volunteer = await Volunteer.findById(id);
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
      const alreadyAdmin = event.admins.some((a) => String(a.id) === String(id));
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
  },
);

router.put(
  "/:id",
  requireAuth,
  validate({
    params: volunteerIdParamsSchema,
    body: updateVolunteerBodySchema,
  }),
  async (req, res) => {
    try {
      const { Volunteer } = getModels();
      const { id } = req.params;
      const updates = req.body;

      const volunteer = await Volunteer.findByIdAndUpdate(id, updates, {
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
  },
);

module.exports = router;
