import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";

/**
 * POST API route for contact form submissions
 * @param {NextRequest} request - The incoming request with form data
 * @returns {NextResponse} Success or error response
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    // TODO: Save to database or send email notification
    // For now, we'll just log it and return success
    console.log("Contact form submission:", { name, email, message });

    // In the future, you can:
    // 1. Save to MongoDB using a Contact schema
    // 2. Send an email notification
    // 3. Integrate with an email service like SendGrid, Resend, etc.

    return NextResponse.json({ message: "Message received successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json({ message: "Internal server error. Please try again later." }, { status: 500 });
  }
}
