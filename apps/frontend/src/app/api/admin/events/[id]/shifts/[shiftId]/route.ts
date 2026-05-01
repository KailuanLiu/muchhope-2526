// src/app/api/admin/events/[id]/shifts/[shiftId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RouteContext = { params: { id: string; shiftId: string } };

async function checkRole() {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as string;
  if (role !== "admin" && role !== "mainadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const forbidden = await checkRole();
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/events/${params.id}/shifts/${params.shiftId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/admin/events/[id]/shifts/[shiftId] PUT]", err);
    return NextResponse.json({ error: "Failed to update shift." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const forbidden = await checkRole();
  if (forbidden) return forbidden;

  try {
    const res = await fetch(`${API_BASE}/events/${params.id}/shifts/${params.shiftId}`, { method: "DELETE" });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/admin/events/[id]/shifts/[shiftId] DELETE]", err);
    return NextResponse.json({ error: "Failed to delete shift." }, { status: 500 });
  }
}
