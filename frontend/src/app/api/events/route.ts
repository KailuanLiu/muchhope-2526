import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "1",
      title: "Food Drive",
      description: "Help distribute meals.",
      location: "San Jose",
      date: "2026-04-20",
    },
  ]);
}
