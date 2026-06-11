import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "lib/db";
import { Donation } from "lib/DonationModel";
import type { UserRole } from "lib/roles.types";

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function isValidPhotoDataUrl(value: string): boolean {
  return !value || /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
}

function normalizeDonation(donation: any) {
  return {
    id: donation._id.toString(),
    firstName: donation.firstName,
    lastName: donation.lastName,
    email: donation.email,
    phoneNumber: donation.phoneNumber ?? "",
    clerkId: donation.clerkId ?? "",
    eventId: donation.eventId,
    eventName: donation.eventName,
    eventDate: donation.eventDate ?? "",
    provisions: donation.provisions,
    quantity: donation.quantity,
    photoName: donation.photoName ?? "",
    photoType: donation.photoType ?? "",
    photoDataUrl: donation.photoDataUrl ?? "",
    createdAt: donation.createdAt,
  };
}

function isAdminRole(role: UserRole | undefined) {
  return role === "admin" || role === "mainadmin";
}

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const donations = await Donation.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ donations: donations.map(normalizeDonation) });
  } catch (err: any) {
    console.error("GET /api/donations error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Failed to fetch donations." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventId = cleanString(body.eventId);
    const eventName = cleanString(body.eventName);
    const eventDate = cleanString(body.eventDate);
    const provisions = cleanString(body.provisions);
    const quantity = Number(body.quantity);
    const photoName = cleanString(body.photoName);
    const photoType = cleanString(body.photoType);
    const photoDataUrl = cleanString(body.photoDataUrl);

    if (!eventId || !eventName) {
      return NextResponse.json({ error: "Please select an upcoming event." }, { status: 400 });
    }

    if (!provisions) {
      return NextResponse.json({ error: "Provisions are required." }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1." }, { status: 400 });
    }

    if (!isValidPhotoDataUrl(photoDataUrl)) {
      return NextResponse.json({ error: "Donation photo must be a valid image." }, { status: 400 });
    }

    const { userId } = await auth();
    let donor = {
      firstName: cleanString(body.firstName),
      lastName: cleanString(body.lastName),
      email: cleanString(body.email),
      phoneNumber: cleanString(body.phoneNumber),
      clerkId: "",
    };

    if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      donor = {
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        phoneNumber: (user.publicMetadata?.phoneNumber as string | undefined) ?? "",
        clerkId: userId,
      };
    }

    if (!donor.firstName || !donor.lastName || !donor.email) {
      return NextResponse.json({ error: "First name, last name, and email are required." }, { status: 400 });
    }

    if (!isValidEmail(donor.email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!userId && getPhoneDigits(donor.phoneNumber).length !== 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit phone number." }, { status: 400 });
    }

    await connectDB();
    const donation = await Donation.create({
      ...donor,
      eventId,
      eventName,
      eventDate,
      provisions,
      quantity,
      photoName,
      photoType,
      photoDataUrl,
    });

    return NextResponse.json({ donation: normalizeDonation(donation.toObject()) }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/donations error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Failed to submit donation." }, { status: 500 });
  }
}
