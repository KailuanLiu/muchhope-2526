import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "lib/roles";
import type { UserRole } from "lib/roles.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // A volunteer may only view their own event history; admins may view anyone's.
  if (!isAdmin(role) && id !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const res = await fetch(`${API_BASE}/volunteers/${id}/events`);

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    console.error("Error parsing JSON response:", err);
    data = { message: "No JSON returned from backend" };
  }

  return NextResponse.json(data, { status: res.status });
}
