import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get("timeframe");
  const url = new URL(`${API_BASE}/events`);

  if (timeframe) {
    url.searchParams.set("timeframe", timeframe);
  }

  const res = await fetch(url.toString(), {
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
