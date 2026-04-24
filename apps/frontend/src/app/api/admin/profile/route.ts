import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();

  // Verify caller is admin
  const callerUser = await client.users.getUser(userId);
  const callerRole = callerUser.publicMetadata?.role as string | undefined;
  if (callerRole !== "admin" && callerRole !== "mainadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetUserId, firstName, lastName, phoneNumber, isAdult } = await req.json();
  if (!targetUserId) return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });

  const targetUser = await client.users.getUser(targetUserId);

  const userUpdate: any = {
    publicMetadata: {
      ...targetUser.publicMetadata, // preserve role and anything else
      phoneNumber,
      isAdult,
    },
  };

  if (firstName !== undefined) userUpdate.firstName = firstName;
  if (lastName !== undefined) userUpdate.lastName = lastName;

  await client.users.updateUser(targetUserId, userUpdate);

  return NextResponse.json({ success: true });
}
