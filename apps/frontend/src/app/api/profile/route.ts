import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { firstName, lastName, phoneNumber, isAdult } = await req.json();

  const client = await clerkClient();

  const userUpdate: any = {
    publicMetadata: { phoneNumber, isAdult },
  };

  if (firstName !== undefined) userUpdate.firstName = firstName;
  if (lastName !== undefined) userUpdate.lastName = lastName;

  await client.users.updateUser(userId, userUpdate);

  return NextResponse.json({ success: true });
}
