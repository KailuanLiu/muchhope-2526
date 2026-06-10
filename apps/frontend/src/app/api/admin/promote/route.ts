import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "lib/roles.types";
import { isSuperAdmin } from "lib/roles";

export async function POST(req: NextRequest) {
  // 1. Verify caller is mainadmin
  const { userId: callerId, sessionClaims } = await auth();
  const callerRole = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role ?? "user";
  if (!callerId || !isSuperAdmin(callerRole)) {
    return NextResponse.json({ error: "Forbidden: only the main admin can promote users." }, { status: 403 });
  }

  // 2. Parse request body
  let targetUserId: string;
  try {
    const body = await req.json();
    targetUserId = body.userId;
    if (!targetUserId || typeof targetUserId !== "string") throw new Error();
  } catch {
    return NextResponse.json({ error: "Request body must include a valid `userId` string." }, { status: 400 });
  }

  // 3. Prevent self-promotion
  if (targetUserId === callerId) {
    return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
  }

  // 4. Update target user's publicMetadata role to "admin"
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: { role: "admin" satisfies UserRole },
    });
  } catch (err) {
    console.error("[promote] Clerk update failed:", err);
    return NextResponse.json({ error: "Failed to update user role. Check the userId and try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true, promoted: targetUserId });
}
