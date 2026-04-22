import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.CONTACT_RECIPIENT_EMAIL || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, subject, message } = body;

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    // Checks if the admin email even exists
    if (!ADMIN_EMAIL) {
      console.error("[api/contact] CONTACT_RECIPIENT_EMAIL is not set.");
      return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }

    const { error } = await resend.emails.send({
      from: "Much Hope Contact Form <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    if (error) {
      console.error("[api/contact] Resend error:", error);
      return NextResponse.json({ message: "Failed to send email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ message: "Message sent successfully." }, { status: 200 });
  } catch (err) {
    console.error("[api/contact] Unexpected error:", err);
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}
