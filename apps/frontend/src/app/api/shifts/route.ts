import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ShiftInfo = {
  eventId: string;
  volunteerId: string;
  volunteerEmail: string;
  shiftType: string;
  shiftTime: string;
  date: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: ShiftInfo = await req.json();

    const response = await fetch(`${API_BASE}/shifts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("[api/shifts]", error);

    return NextResponse.json({ error: "Failed to save shift signup" }, { status: 500 });
  }
}
