// src/app/api/admin/events/[id]/volunteers/[volunteerId]/route.ts
// DELETE /api/admin/events/:id/volunteers/:volunteerId  — remove a volunteer

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { UserRole } from "@/lib/roles.types";
import { isSuperAdmin } from "@/lib/roles";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RouteContext = { params: { id: string; volunteerId: string } };

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";

  if (!userId || !isSuperAdmin(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const res = await fetch(`${API_BASE}/events/${params.id}/volunteers/${params.volunteerId}`, { method: "DELETE" });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/admin/events/[id]/volunteers/[volunteerId] DELETE]", err);
    return NextResponse.json({ error: "Failed to remove volunteer." }, { status: 500 });
  }
}
