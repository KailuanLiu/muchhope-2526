import mongoose, { Schema } from "mongoose";

const VolunteerEventSchema = new Schema({
  event_name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
});

export default mongoose.models.VolunteerEvent ||
  mongoose.model("VolunteerEvent", VolunteerEventSchema);
