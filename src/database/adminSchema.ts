import mongoose, { Schema } from "mongoose";

export type TimeSlot = {
  start: string;
  end: string;
};

export type Admin = {
  clerkUserID: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  time_slots: TimeSlot[];
  events: mongoose.Types.ObjectId[];
  role: "admin" | "main_admin";
};

const adminSchema = new Schema<Admin>({
  clerkUserID: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone_number: { type: String, required: true },
  time_slots: {
    type: [
      {
        start: { type: String, required: true },
        end: { type: String, required: true },
      },
    ],
    default: [],
  },
  events: { type: [Schema.Types.ObjectId], default: [] },
  role: { type: String, enum: ["admin", "main_admin"], required: true },
});

const Admin = mongoose.models["admin"] || mongoose.model("admin", adminSchema);

export default Admin;
