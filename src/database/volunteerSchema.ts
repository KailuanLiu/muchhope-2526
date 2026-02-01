import mongoose, { Schema } from "mongoose";

const VolunteerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  availabilities: { type: [String], default: [] },
  eventsAttending: { type: [String], default: [] },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.models.Volunteer || mongoose.model("Volunteer", VolunteerSchema);
