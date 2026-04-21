//api/admin/events/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "../../../../lib/roles.types";
import { isSuperAdmin } from "../../../../lib/roles";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  const { userId: callerId, sessionClaims } = await auth();
  const callerRole = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";

  if (!callerId || !isSuperAdmin(callerRole)) {
    return NextResponse.json({ error: "Forbidden: only the main admin can create events." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": callerRole,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("[admin/events:create] Request failed:", err);
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }
}
