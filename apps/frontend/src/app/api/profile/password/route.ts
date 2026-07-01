import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new password are required." }, { status: 400 });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const client = await clerkClient();

  // Verify the current password before allowing a change.
  try {
    await client.users.verifyPassword({ userId, password: currentPassword });
  } catch {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  try {
    await client.users.updateUser(userId, {
      password: newPassword,
      signOutOfOtherSessions: true,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.errors?.[0]?.message ?? "Failed to update password." }, { status: 400 });
  }
}
