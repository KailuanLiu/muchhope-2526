import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/volunteers/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}  