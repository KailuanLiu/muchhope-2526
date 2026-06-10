import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "email query param is required" }, { status: 400 });
  }

  const url = new URL(`${API_BASE}/shifts`);
  url.searchParams.set("email", email);

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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Shift id is required" }, { status: 400 });
    }

    const res = await fetch(`${API_BASE}/shifts/${id}`, {
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
