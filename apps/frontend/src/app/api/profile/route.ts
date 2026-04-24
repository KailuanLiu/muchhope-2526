import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  // get the current user's ID from the session
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // pase the request body
  const { firstName, lastName, phoneNumber, isAdult } = await req.json();

  const client = await clerkClient();

  // fetch existing user to preserve metadata fields like role
  const existingUser = await client.users.getUser(userId);

  const userUpdate: any = {
    publicMetadata: {
      // spread exisitng metadata first so role and other fields are not wiped
      ...existingUser.publicMetadata,
      phoneNumber,
      isAdult,
    },
  };

  // only update name fields if they were provided in the request
  if (firstName !== undefined) userUpdate.firstName = firstName;
  if (lastName !== undefined) userUpdate.lastName = lastName;

  await client.users.updateUser(userId, userUpdate);

  return NextResponse.json({ success: true });
}
