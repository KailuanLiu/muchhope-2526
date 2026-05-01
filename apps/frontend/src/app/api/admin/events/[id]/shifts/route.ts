// src/app/api/admin/events/[id]/shifts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RouteContext = { params: { id: string } };

async function checkRole() {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as string;
  if (role !== "admin" && role !== "mainadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const forbidden = await checkRole();
  if (forbidden) return forbidden;

  try {
    const res = await fetch(`${API_BASE}/events/${params.id}/shifts`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/admin/events/[id]/shifts GET]", err);
    return NextResponse.json({ error: "Failed to load shifts." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const forbidden = await checkRole();
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/events/${params.id}/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/admin/events/[id]/shifts POST]", err);
    return NextResponse.json({ error: "Failed to create shift." }, { status: 500 });
  }
}
