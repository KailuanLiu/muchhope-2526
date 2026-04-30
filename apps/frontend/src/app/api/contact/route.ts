import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, message } = await request.json();

    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
    }

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      try {
        await resend.emails.send({
          from: "Contact Form <onboarding@resend.dev>", // Replace with your verified domain
          to: [process.env.MAIN_ADMIN_EMAIL || "h4imuchhope@gmail.com"], // Use admin email from env
          subject: `[Much Hope]: Submission from ${firstName} ${lastName}`,
          html: `
            <h2>Much Hope Contact Form Submission</h2>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
            <hr>
            <p><em>Sent at: ${new Date().toLocaleString()}</em></p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Continue with success response even if email fails
        // You might want to handle this differently in production
      }
    }

    // Log the contact form submission
    console.log("Contact form submission:", {
      firstName,
      lastName,
      email,
      message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Message sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
