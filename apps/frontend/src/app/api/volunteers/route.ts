import { NextRequest, NextResponse } from "next/server";
import connectDB from "lib/db";
import { Volunteer } from "lib/VolunteerModel";

export async function GET() {
  try {
    await connectDB();
    const volunteers = await Volunteer.find({}).lean();
    const mapped = volunteers.map((v: any) => ({
      ...v,
      id: v.clerkId || v._id.toString(),
    }));
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
    };

    // Only include email if provided (avoids unique index conflict on empty strings)
    if (email) {
      docData.email = email;
    }

    const doc = await Volunteer.create(docData);

    return NextResponse.json(
      {
        volunteer: {
          ...doc.toObject(),
          id: doc.clerkId || doc._id.toString(),
        },
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

    const updated = await Volunteer.findOneAndUpdate(
      { $or: [{ clerkId: id }, { _id: id }] },
      { $set: body },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    return NextResponse.json({
      volunteer: {
        ...updated,
        id: (updated as any).clerkId || (updated as any)._id.toString(),
      },
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

    const deleted = await Volunteer.findOneAndDelete({
      $or: [{ clerkId: id }, { _id: id }],
    });

    if (!deleted) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Volunteer deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/volunteers error:", err);
    return NextResponse.json({ error: "Failed to delete volunteer" }, { status: 500 });
  }
}
