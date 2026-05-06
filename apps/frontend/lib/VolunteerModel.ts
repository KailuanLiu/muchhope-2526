import mongoose from "mongoose";

const VolunteerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, default: "" },
  email: { type: String, default: "" },
  clerkId: { type: String, unique: true, sparse: true },
  userType: { type: String, default: "Volunteer" },
  isAdult: { type: Boolean, default: true },
  role: { type: String, default: "Volunteer" },
});

export const Volunteer = mongoose.models.Volunteer || mongoose.model("Volunteer", VolunteerSchema);
