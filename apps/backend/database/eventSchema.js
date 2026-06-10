const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubEventSchema = new Schema({
  title: { type: String, required: true },
  date: { type: String },
  time: { type: String },
  location: { type: String },
  description: { type: String },
});

const EventSchema = new Schema({
  event_name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  subEvents: [SubEventSchema],
  admins: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
  ],
  volunteers: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      isAdult: { type: Boolean, required: true },
    },
  ],
});

module.exports = EventSchema;
module.exports.EventSchema = EventSchema;
