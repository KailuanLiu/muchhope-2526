import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "lib/roles.types";
import { isSuperAdmin } from "lib/roles";
import connectDB from "lib/db";
import { Volunteer } from "lib/VolunteerModel";

export async function POST(req: NextRequest) {
  // Verify caller is mainadmin
  const { userId: callerId, sessionClaims } = await auth();
  const callerRole = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";

  if (!callerId || !isSuperAdmin(callerRole)) {
    return NextResponse.json({ error: "Forbidden: only the main admin can demote users." }, { status: 403 });
  }

  // Parse request body
  let targetUserId: string;
  try {
    const body = await req.json();
    targetUserId = body.userId;
    if (!targetUserId || typeof targetUserId !== "string") throw new Error();
  } catch {
    return NextResponse.json({ error: "Request body must include a valid `userId` string." }, { status: 400 });
  }

  // Prevent self-demotion
  if (targetUserId === callerId) {
    return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
  }

  // Update target user's publicMetadata role back to "user"
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: { role: "user" satisfies UserRole },
    });
  } catch (err) {
    console.error("[demote] Clerk update failed:", err);
    return NextResponse.json({ error: "Failed to update user role. Check the userId and try again." }, { status: 500 });
  }

  // Keep the Mongo volunteer record's role field in sync so the Manage Users list reflects it immediately
  let updatedVolunteer = null;
  try {
    await connectDB();
    updatedVolunteer = await Volunteer.findOneAndUpdate(
      { clerkId: targetUserId },
      { role: "Volunteer", userType: "Volunteer" },
      { new: true },
    ).lean();
  } catch (err) {
    console.error("[demote] Mongo sync failed:", err);
  }

  return NextResponse.json({ success: true, demoted: targetUserId, volunteer: updatedVolunteer });
}
