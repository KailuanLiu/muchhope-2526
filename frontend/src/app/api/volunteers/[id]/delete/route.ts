import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const res = await fetch(`${API_BASE}/volunteers/${id}`, {
    method: "DELETE",
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    console.error("Error parsing JSON response:", err);
    data = { message: "No JSON returned from backend" };
  }

  return NextResponse.json(data, { status: res.status });
}
