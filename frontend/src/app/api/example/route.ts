import connectDB from "../../../lib/db";
import { NextResponse } from "next/server";

/**
 * Example GET API route
 * @returns {message: string}
 */
export async function GET() {
  await connectDB();
  return NextResponse.json({ message: "Hello from the API!" });
}
