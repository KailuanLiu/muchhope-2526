//api/admin/events/[id]/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "../../../../../../../backend/lib/roles.types";
import { isSuperAdmin } from "../../../../../../../backend/lib/roles";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId: callerId, sessionClaims } = await auth();
  const callerRole = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";

  if (!callerId || !isSuperAdmin(callerRole)) {
    return NextResponse.json({ error: "Forbidden: only the main admin can edit events." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  try {
    const { id } = await params;

    const response = await fetch(`${API_BASE}/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": callerRole,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("[admin/events:update] Request failed:", err);
    return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
  }
}
