import { NextRequest, NextResponse } from "next/server";
import connectDB from "lib/db";
import { Volunteer } from "lib/VolunteerModel";

function normalizeShiftDetails(shiftDetails: any) {
  return {
    eventName: String(shiftDetails?.eventName ?? "").trim(),
    shiftType: String(shiftDetails?.shiftType ?? "").trim(),
    shiftTime: String(shiftDetails?.shiftTime ?? "").trim(),
  };
}

function normalizeVolunteer(volunteer: any) {
  return {
    ...volunteer,
    id: volunteer.clerkId || volunteer._id.toString(),
    email: volunteer.email ?? "",
    phoneNumber: volunteer.phoneNumber ?? "",
    role: volunteer.role ?? volunteer.userType ?? "Volunteer",
    userType: volunteer.userType ?? volunteer.role ?? "Volunteer",
    notes: volunteer.notes ?? "",
    shiftDetails: normalizeShiftDetails(volunteer.shiftDetails),
  };
}

function getVolunteerLookup(id: string) {
  const lookup: any[] = [{ clerkId: id }];

  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    lookup.push({ _id: id });
  }

  return { $or: lookup };
}

function getVolunteerUpdates(body: any) {
  const updates: any = {};

  for (const field of ["firstName", "lastName", "email", "phoneNumber", "userType", "role", "notes"]) {
    if (body[field] !== undefined) {
      updates[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  }

  if (body.isAdult !== undefined) {
    updates.isAdult = body.isAdult;
  }

  if (body.shiftDetails !== undefined) {
    updates.shiftDetails = normalizeShiftDetails(body.shiftDetails);
  }

  return updates;
}

export async function GET() {
  try {
    await connectDB();
    const volunteers = await Volunteer.find({}).lean();
    const mapped = volunteers.map(normalizeVolunteer);
    return NextResponse.json({ volunteers: mapped });
  } catch (err) {
    console.error("GET /api/volunteers error:", err);
    return NextResponse.json({ error: "Failed to fetch volunteers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First name and last name are required." }, { status: 400 });
    }

    const docData: any = {
      firstName,
      lastName,
      phoneNumber: body.phoneNumber ?? "",
      clerkId: body.clerkId ?? "",
      userType: body.userType ?? "Volunteer",
      isAdult: body.isAdult ?? true,
      role: body.role ?? "Volunteer",
      notes: body.notes ?? "",
      shiftDetails: normalizeShiftDetails(body.shiftDetails),
    };

    // Only include email if provided (avoids unique index conflict on empty strings)
    if (email) {
      docData.email = email;
    }

    const doc = await Volunteer.create(docData);

    return NextResponse.json(
      {
        volunteer: normalizeVolunteer(doc.toObject()),
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("POST /api/volunteers error:", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Failed to create volunteer" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Volunteer id is required." }, { status: 400 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const updates = getVolunteerUpdates(body);

    const updated = await Volunteer.findOneAndUpdate(getVolunteerLookup(id), { $set: updates }, { new: true }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    return NextResponse.json({
      volunteer: normalizeVolunteer(updated),
    });
  } catch (err) {
    console.error("PUT /api/volunteers error:", err);
    return NextResponse.json({ error: "Failed to update volunteer" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Volunteer id is required." }, { status: 400 });
  }

  try {
    await connectDB();

    const deleted = await Volunteer.findOneAndDelete(getVolunteerLookup(id));

    if (!deleted) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Volunteer deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/volunteers error:", err);
    return NextResponse.json({ error: "Failed to delete volunteer" }, { status: 500 });
  }
}
