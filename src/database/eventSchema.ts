import mongoose, { Schema } from "mongoose";

const EventSchema = new Schema({
  event_name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  volunteers: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
  ],
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
