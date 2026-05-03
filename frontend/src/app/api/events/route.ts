import connectDB from "../../../lib/db";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { EventSchema } from "../../../../../backend/database/eventSchema";

export async function GET() {
  await connectDB();

  const Event = mongoose.models.Event || mongoose.model("Event", EventSchema, "events");

  const events = await Event.find();

  return NextResponse.json(events);
}
