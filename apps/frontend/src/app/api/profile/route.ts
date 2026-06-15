import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  // get the current user's ID from the session
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // pase the request body
  const { firstName, lastName, phoneNumber, isAdult, email } = await req.json();

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

  // if user wanted to update email
  if (email && email !== existingUser.primaryEmailAddress?.emailAddress) {
    try {
      const oldEmailId = existingUser.primaryEmailAddress?.id;
      // create email as already verified
      await client.emailAddresses.createEmailAddress({
        userId,
        emailAddress: email,
        verified: true,
        primary: true,
      });

      // delete old email address
      if (oldEmailId) {
        await client.emailAddresses.deleteEmailAddress(oldEmailId);
      }

      return NextResponse.json({ success: true });
    } catch (err: any) {
      // if email already exists on another account
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        return NextResponse.json(
          {
            error: "That email address is already in use by another account.",
          },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          error: err.errors?.[0]?.message ?? "Failed to update email.",
        },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File not found." }, { status: 400 });
  }

  const client = await clerkClient();

  await client.users.updateUserProfileImage(userId, { file });

  return NextResponse.json({ success: true });
}
