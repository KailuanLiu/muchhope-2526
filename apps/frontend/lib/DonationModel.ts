import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phoneNumber: { type: String, default: "", trim: true },
    clerkId: { type: String, default: "", trim: true },
    eventId: { type: String, required: true, trim: true },
    eventName: { type: String, required: true, trim: true },
    eventDate: { type: String, default: "", trim: true },
    provisions: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    photoName: { type: String, default: "", trim: true },
    photoType: { type: String, default: "", trim: true },
    photoDataUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Donation = mongoose.models.Donation || mongoose.model("Donation", DonationSchema);
