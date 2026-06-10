import mongoose from "mongoose";

const ShiftDetailsSchema = new mongoose.Schema(
  {
    eventName: { type: String, default: "" },
    shiftType: { type: String, default: "" },
    shiftTime: { type: String, default: "" },
  },
  { _id: false },
);

const VolunteerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, default: "" },
  email: { type: String, default: "" },
  clerkId: { type: String, unique: true, sparse: true },
  userType: { type: String, default: "Volunteer" },
  isAdult: { type: Boolean, default: true },
  role: { type: String, default: "Volunteer" },
  notes: { type: String, default: "" },
  shiftDetails: { type: ShiftDetailsSchema, default: () => ({}) },
});

export const Volunteer = mongoose.models.Volunteer || mongoose.model("Volunteer", VolunteerSchema);
