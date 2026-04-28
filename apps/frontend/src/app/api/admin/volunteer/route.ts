import { NextRequest, NextResponse } from "next/server";

type Volunteer = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
};

let volunteers: Volunteer[] = [];

export async function GET() {
  return NextResponse.json({ volunteers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const role = String(body.role ?? "Volunteer").trim();

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First name and last name are required." }, { status: 400 });
  }

  const newVolunteer: Volunteer = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    role: role || "Volunteer",
  };

  volunteers.push(newVolunteer);

  return NextResponse.json({ volunteers }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Volunteer id is required." }, { status: 400 });
  }

  volunteers = volunteers.filter((volunteer) => volunteer.id !== id);

  return NextResponse.json({ volunteers });
}
