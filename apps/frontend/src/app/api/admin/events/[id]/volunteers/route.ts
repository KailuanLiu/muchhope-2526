// src/app/api/admin/events/[id]/volunteers/route.ts
// GET  /api/admin/events/:id/volunteers   — list all volunteers for an event
// POST /api/admin/events/:id/volunteers   — manually add a volunteer

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { UserRole } from "@/lib/roles.types";
import { isSuperAdmin } from "@/lib/roles";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RouteContext = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";

  if (!userId || !isSuperAdmin(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const res = await fetch(`${API_BASE}/events/${params.id}/volunteers`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/admin/events/[id]/volunteers GET]", err);
    return NextResponse.json({ error: "Failed to load volunteers." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";

  if (!userId || !isSuperAdmin(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/events/${params.id}/volunteers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/admin/events/[id]/volunteers POST]", err);
    return NextResponse.json({ error: "Failed to add volunteer." }, { status: 500 });
  }
}
