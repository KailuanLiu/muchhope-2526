import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "lib/roles";
import type { UserRole } from "lib/roles.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const eventId = searchParams.get("eventId");

  if (!email && !eventId) {
    return NextResponse.json({ message: "email or eventId query param is required" }, { status: 400 });
  }

  // Fetching shifts by eventId exposes volunteer PII — restrict to admins
  if (eventId) {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";
    if (!userId || !isAdmin(role)) {
      return NextResponse.json({ error: "Forbidden: admin access required." }, { status: 403 });
    }
  }

  const url = new URL(`${API_BASE}/shifts`);
  if (eventId) {
    url.searchParams.set("eventId", eventId);
  } else {
    url.searchParams.set("email", email!);
  }

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error("[api/shifts] Backend returned non-JSON response:", res.status);
      return NextResponse.json([], { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/shifts] GET failed:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const res = await fetch(`${API_BASE}/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error("[api/shifts] Backend returned non-JSON response:", res.status);
      return NextResponse.json({ message: "Failed to save shift" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/shifts] POST failed:", err);
    return NextResponse.json({ message: "Failed to save shift" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Shift id is required" }, { status: 400 });
    }

    const role = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";
    const deleteUrl = new URL(`${API_BASE}/shifts/${id}`);

    // Non-admins may only delete their own shifts. Scope the backend delete to
    // the caller's email so they can't remove another volunteer's shift by id.
    if (!isAdmin(role)) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const email = user.primaryEmailAddress?.emailAddress;

      if (!email) {
        return NextResponse.json({ message: "Could not resolve your account email." }, { status: 400 });
      }

      deleteUrl.searchParams.set("volunteerEmail", email);
    }

    const res = await fetch(deleteUrl.toString(), {
      method: "DELETE",
    });

    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      console.error("[api/shifts] Backend returned non-JSON response:", res.status);

      return NextResponse.json({ message: "Failed to delete shift" }, { status: 500 });
    }

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/shifts] DELETE failed:", err);

    return NextResponse.json({ message: "Failed to delete shift" }, { status: 500 });
  }
}
