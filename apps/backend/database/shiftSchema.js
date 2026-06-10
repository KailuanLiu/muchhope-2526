const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShiftSchema = new Schema({
  eventId: { type: String, required: true },
  volunteerId: { type: String, required: true },
  volunteerEmail: { type: String, required: true },
  shiftType: { type: String, required: true },
  shiftTime: { type: String, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = ShiftSchema;
