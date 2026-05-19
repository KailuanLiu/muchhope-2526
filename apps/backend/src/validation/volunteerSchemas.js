const { z } = require("zod");

const createVolunteerBodySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  email: z.string().email("Valid email is required"),
  id: z.string().min(1, "Clerk ID is required"),
  userType: z.enum(["main admin", "event admin", "volunteer"]),
  isAdult: z.boolean(),
});

const loginVolunteerBodySchema = z.object({
  email: z.string().email("Valid email is required"),
});

const updateVolunteerBodySchema = z.object({
  firstName: z.string().min(1, "First name cannot be empty").optional(),
  lastName: z.string().min(1, "Last name cannot be empty").optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email("Valid email is required").optional(),
  userType: z.enum(["main admin", "event admin", "volunteer"]).optional(),
  isAdult: z.boolean().optional(),
});

const volunteerIdParamsSchema = z.object({
  id: z.string().min(1, "Volunteer ID is required"),
});

const makeEventAdminBodySchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

module.exports = {
  createVolunteerBodySchema,
  loginVolunteerBodySchema,
  updateVolunteerBodySchema,
  volunteerIdParamsSchema,
  makeEventAdminBodySchema,
};
