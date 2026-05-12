// api/events/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type BackendEvent = {
  _id?: string;
  id?: string;
  event_name?: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  volunteers?: Array<{
    name: string;
    email: string;
    phoneNumber: string;
    isAdult: boolean;
  }>;
};

function normalizeEvent(event: BackendEvent) {
  const id = event._id || event.id || "";
  const title = event.event_name || "";
  const description = event.description || "";

  return {
    ...event,
    id,
    title,
    name: title,
    desc: description,
    image: "",
    imageUrl: "",
    date: event.date || "",
    time: event.time || "",
    location: event.location || "",
    description,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get("timeframe");
  const url = new URL(`${API_BASE}/events`);

  if (timeframe) {
    url.searchParams.set("timeframe", timeframe);
  }

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error("[api/events] Backend returned non-JSON response:", res.status);
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json();
    const normalizedData = Array.isArray(data) ? data.map(normalizeEvent) : data;
    return NextResponse.json(normalizedData, { status: res.status });
  } catch (err) {
    console.error("[api/events] Failed to fetch from backend:", err);
    return NextResponse.json([], { status: 200 });
  }
}
