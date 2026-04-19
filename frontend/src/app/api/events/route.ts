import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      _id: "1",
      event_name: "Food Drive",
      date: "April 20, 2026",
      time: "10:00 AM",
      location: "San Jose",
      description: "Help distribute meals to families in need.",
      volunteers: [
        { name: "A", email: "a@test.com", phoneNumber: "123", isAdult: true },
        { name: "B", email: "b@test.com", phoneNumber: "123", isAdult: false },
        { name: "C", email: "c@test.com", phoneNumber: "123", isAdult: true },
      ],
    },
    {
      _id: "2",
      event_name: "Beach Cleanup",
      date: "April 25, 2026",
      time: "9:00 AM",
      location: "Santa Cruz",
      description: "Cleaning up the coastline.",
      volunteers: [],
    },
    {
      _id: "3",
      event_name: "Clothing Donation",
      date: "May 1, 2026",
      time: "1:00 PM",
      location: "Los Angeles",
      description: "Sort and distribute clothing.",
      volunteers: [{ name: "D", email: "d@test.com", phoneNumber: "123", isAdult: true }],
    },
    {
      _id: "4",
      event_name: "Community Garden",
      date: "May 5, 2026",
      time: "8:00 AM",
      location: "San Diego",
      description: "Plant and maintain garden beds.",
      volunteers: [],
    },
  ]);
}
