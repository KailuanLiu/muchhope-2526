import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "lib/roles";
import type { UserRole } from "lib/roles.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";

  // Granting event-admin is a privilege change — restrict to admins.
  if (!userId || !isAdmin(role)) {
    return NextResponse.json({ error: "Forbidden: admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const res = await fetch(`${API_BASE}/volunteers/${id}/make-event-admin`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
