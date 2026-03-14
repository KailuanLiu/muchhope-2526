const mongoose = require("mongoose");
const { Schema } = mongoose;

const VolunteerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  id: { type: String, required: true, unique: true }, // Clerk id
  userType: { type: String, required: true }, // main admin, event admin, or volunteer
  isAdult: { type: Boolean, required: true }, // If volunteer is 18+ or not
});

module.exports = { VolunteerSchema };
