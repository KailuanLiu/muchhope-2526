import { NextRequest, NextResponse } from "next/server";

type Volunteer = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email?: string;
  phoneNumber?: string;
  age?: number;
  isAdult?: boolean;
  userType?: string;
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
    email: body.email ?? "",
    phoneNumber: body.phoneNumber ?? "",
    age: body.age,
    isAdult: body.isAdult,
    userType: body.userType ?? "",
  };

  volunteers.push(newVolunteer);

  return NextResponse.json({ volunteer: newVolunteer }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Volunteer id is required." }, { status: 400 });
  }

  const body = await req.json();
  const index = volunteers.findIndex((volunteer) => volunteer.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
  }

  volunteers[index] = {
    ...volunteers[index],
    ...body,
    id,
  };

  return NextResponse.json({ volunteer: volunteers[index] }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Volunteer id is required." }, { status: 400 });
  }

  const exists = volunteers.some((volunteer) => volunteer.id === id);

  if (!exists) {
    return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
  }

  volunteers = volunteers.filter((volunteer) => volunteer.id !== id);

  return NextResponse.json({ message: "Volunteer deleted successfully" });
}
